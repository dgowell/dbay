

//Load dmax.js
MDS.load("dmax.js");
MDS.load("notifications.js");

/* eslint-disable no-undef */
var LISTINGSTABLE = 'LISTING';
var SETTINGSTABLE = 'SETTINGS';
var TRANSACTIONSTABLE = 'TRANSACTIONS';
var SUBSCRIPTIONSTABLE = 'SUBSCRIPTIONS';
var APPLICATION_NAME = 'dbay';

const SERVER_ADDRESS = 'MAX#0x30819F300D06092A864886F70D010101050003818D0030818902818100B4D30A8C0A1D1EA48DE04CA803D0A9D75453E6E9732D6575F4A06330EEF733DF7DF496E33BA46BB195C5826ED32264FE69E4C809C544F9859CF543932CB5A6ED347052F33B50F3A2D424C1BE384CA9B5E0DD0DFFECE2286E4D0311CDF30F3B5E343369CDA8AC8E5DBB1B2EDADD7E9053B9393F4AA021224BF4AA41568403D82D0203010001#MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G1C0ANS2ENGJEFBYJM2SCQFR3U3KBJNP1WS9B0KG1Z2QG5T68S6N2C15B2FD7WHV5VYCKBDW943QZJ9MCZ03ESQ0TDR86PEGUFRSGEJBANN91TY2RVPQTVQSUP26TNR399UE9PPJNS75HJFTM4DG2NZRUDWP06VQHHVQSGT9ZFV0SCZBZDY0A9BK96R7M4Q483GN2T04P30GM5C10608005FHRRH4@78.141.238.36:9001';
const SERVER_WALLET = 'MxG0800CY355Q2F0WPRAUBUTZ52CQ9MNC196PY5Z20SV6DBKEURK9P50GHY1WK2';

//switch on and off logs
var logs = true;

MDS.init(function (msg) {
    switch (msg.event) {
        case "inited":
            setup();
            break;
        case "MAXIMA":
            //MDS.log('Receieved Maxima Message' + JSON.stringify(msg));
            processMaximaEvent(msg);
            break;
        case "NEWBALANCE":
            //check coins against unconfirmed/pending payemnts
            //seller side new balance
            processNewBalanceEvent();
            break;
        case "MINIMALOG":
            //buyer side new spent coin
            processMinimaLogEvent(msg.data);
            break;
        case "MDS_PENDING":
            MDS.log('MDS Pending Event' + JSON.stringify(msg));
            break;
        default:
            break;
    }
});
/*
* Register the store name and public key, if no store then create it
* store name = maxima contact name
* store id = current public key
*/
function setup() {
    MDS.log('Setup called!');
    getPublicKey(function (pk) {
        getMLS(function (mls) {

            let permanentAddress = '';

            hasStaticMLS(function (result) {
                if (result === true) {
                    permanentAddress = `MAX#${pk}#${mls}`;
                }
            });

            if (logs) { MDS.log(`Permanent Address: ${permanentAddress}`) }

            //create listing table
            createListingTable(function (result) {
                if (logs) { MDS.log('Listing table created or exists') }
            });

            //add location description column
            addLocationDescriptionColumn(function (result) {
                if (logs) { MDS.log('Added location description Column: ' + result) }
            });

            addPendingUIDColumn(function (result) {
                if (logs) { MDS.log('Added pending UID Column: ' + result) }
            });

            addSellerHasPermAddressColumn(function (result) {
                if (logs) { MDS.log('Added seller has permanent address Column: ' + result) }
            });

            addSellerPermAddressColumn(function (result) {
                if (logs) { MDS.log('Added seller permanent address Column: ' + result) }
            });

            createSettingsTable(function (result) {
                if (result === true) {

                    //check if store exists
                    createHost(pk, permanentAddress, function (result) {
                        if (logs) { MDS.log('Host created: ' + result) }
                    }
                    );
                    addDmaxServerP2p2IdentityColumn(function (result) {
                        if (logs) { MDS.log('Added dmax server p2p2 identity Column: ' + result) }
                    });
                }
            });


            //setup dmax transactions
            createTransactionTable(function (result) {
                if (logs) { MDS.log('Transaction table created or exists') }
            });

            createSubscriptionsTable(function (result) {
                if (logs) { MDS.log('Subscriptions table created or exists') }
            });

            createNotificationsTable(function (result) {
                if (logs) { MDS.log('Notifications table created or exists') }
            });

            //send subscription requests
            sendSubscriptionRequests();
        });
    });
}


/*
************************************************* PROCESS EVENTS *************************************************
*/
/*
*  BUYER SIDE: Use the new spent coin event to trigger a check for pending transactions
*/
function processMinimaLogEvent(data) {
    //if we have a new spent coin
    if (data.message.includes("NEW Spent Coin")) {


        //DBAY LISTINGS

        //get all pending transactions
        getListingsWithPendingUID(function (listings) {
            if (logs) { MDS.log('Listings Found: ' + JSON.stringify(listings)); }
            MDS.log('listings is a : ' + typeof (listings));
            if (listings.length > 0) {
                listings.forEach(function (listing) {
                    let cmd = `checkpending uid:${listing.pendinguid}`;
                    MDS.cmd(cmd, function (response) {
                        if (response.status === true) {
                            updateListing(listing.listing_id, { "status": "completed" });
                            const data = {
                                "type": "PAYMENT_RECEIPT_READ",
                                "buyer_message": listing.buyer_message,
                                "listing_id": listing.listing_id,
                                "transmission_type": listing.transmission_type,
                                "purchase_code": listing.purchase_code,
                                "buyer_name": listing.buyer_name,
                                "buyer_pk": listing.buyer_pk,
                            }
                            MDS.log('SUPER LISTING: ' + JSON.stringify(listing));
                            let sellerAddress = listing.seller_has_perm_address ? listing.seller_perm_address : listing.created_by_pk;
                            sendMessage({
                                data: data,
                                address: sellerAddress,
                                app: "dbay",
                                callback: function (result) {
                                    if (logs) { MDS.log('Message sent to seller: ' + JSON.stringify(result)) }
                                }
                            });

                            //need to add the seller as a contact so they can let us know when the item has been shipped
                            if (listing.transmission_type === "delivery") {
                                addContact(listing.created_by_pk, function (result) {
                                    MDS.log('Contact added: ' + JSON.stringify(result));
                                });
                            }
                        }
                    });
                });
            } else { if (logs) { MDS.log('No listings with pending UID') } }
        });


        //DMAX TRANSACTIONS
        getTransactionsWithPendingUID(function (transactions) {
            if (logs) { MDS.log('Transactionss Found: ' + JSON.stringify(transactions)); }
            MDS.log('transactions is a : ' + typeof (transactions));
            if (transactions.length > 0) {
                transactions.forEach(function (transaction) {
                    let cmd = `checkpending uid:${transaction.pendinguid}`;
                    MDS.cmd(cmd, function (response) {
                        if (response.status === true) {
                            getPublicKey(function (publickey) {
                                updateTransaction(transaction.txn_id, { "status": "paid" });
                                sendMessage({
                                    data: {
                                        "type": "PAYMENT_RECEIPT_READ",
                                        "data": {
                                            "purchase_code": transaction.purchase_code,
                                            "amount": transaction.amount,
                                            "publickey": publickey,
                                        }
                                    },
                                    address: SERVER_ADDRESS,
                                    app: "dmax",
                                    callback: function (result) {
                                        if (logs) { MDS.log('Message sent to seller: ' + JSON.stringify(result)) }
                                    }
                                });

                            });
                        }
                    });
                });
            } else { if (logs) { MDS.log('No transactions with pending UID') } }
        });
    }
}




/*
*   BUYER & SELLER SIDE: Handle the maxima messages sent between the buyer and seller
*/
function processMaximaEvent(msg) {

    //Is it for us.. ?
    if (msg.data.application === "dbay") {


        //Get the data packet..
        var datastr = msg.data.data;
        if (datastr.startsWith("0x")) {
            datastr = datastr.substring(2);
        }
        if (logs) {
            MDS.log("----");
            MDS.log(JSON.stringify(msg.data.data));
            MDS.log("----");
        }

        var jsonstr = "";
        MDS.cmd("convert from:HEX to:String data:" + msg.data.data, function (resp) {
            MDS.log(JSON.stringify(resp.response.conversion).replace(/'/g, ""));
            jsonstr = JSON.parse(resp.response.conversion.replace(/'/g, ""));
        });

        if (logs) {
            //And create the actual JSON
            MDS.log(JSON.stringify(jsonstr));
            var entity = jsonstr;
            MDS.log("======");
            MDS.log(entity.type);
            MDS.log("======");
        }

        //determine what type of message you're receiving
        switch (entity.type) {
            case 'availability_check':
                //seller must process request to check availability of listing from buyer
                processAvailabilityCheck(entity);
                break;
            case 'availability_response':
                //buyer must process response from seller
                processAvailabilityResponse(entity);
                break;
            case 'LISTING':
                //a contact has shared a listing with you
                processListing(entity);
                break;
            case 'PAYMENT_RECEIPT_READ':
                //seller must process purchase receipt from buyer
                processPaymentReceiptRead(entity);
                break;
            case 'PAYMENT_RECEIPT_WRITE':
                //seller must process purchase receipt from buyer
                processPaymentReceiptWrite(entity);
                break;
            case 'COLLECTION_REQUEST':
                //seller must process collection request from buyer
                processCollectionRequest(entity);
                break;
            case 'COLLECTION_REJECTED':
                //buyer must process collection rejection from seller
                processCollectionRejected(entity);
                break;
            case 'CANCEL_COLLECTION':
                processCancelCollection(entity);
                break;
            case 'ITEM_SENT_CLICKED':
                //buyer must process item sent clicked from seller
                processItemSentClicked(entity);
                break;
            case 'LISTINGS_REQUEST':
                //seller must process subscription request from buyer
                MDS.log("LISTINGS_REQUEST received:" + JSON.stringify(entity));
                processSubscriptionRequest(entity);
                break;
            case 'SELLER_INFO_REQUEST':
                //buyer must process seller info request from seller
                processSellerInfoRequest(entity);
                break;
            case 'SELLER_INFO_RESPONSE':
                //seller must process seller info response from buyer
                processSellerInfoResponse(entity);
                break;
            default:
                if (logs) { MDS.log(entity); }
        }
    } else if (msg.data.application === "dmax") {
        //Is it for dmax...

        //Convert the data..
        MDS.cmd("convert from:HEX to:String data:" + msg.data.data, function (resp) {

            //And create the actual JSON
            //TODO: Check that conversion is part of the response
            var json = JSON.parse(resp.response.conversion);

            //What type is this..
            var type = json.type;



            if (type === "P2P_RESPONSE") {
                MDS.log("P2P_RESPONSE received:" + JSON.stringify(json));
                //save p2p to the database
                var p2pIdentity = json.data.p2pidentity;
                addP2pIdentity(p2pIdentity, function (result) {
                    if (result === true) {
                        MDS.log("P2P saved to the database: " + JSON.stringify(result));
                    }
                });
            }


            else if (type === "EXPIRY_DATE") {
                MDS.log("EXPIRY_DATE received:" + JSON.stringify(json));
                //replace user message with the expiry date and permanent maxima address
                const expiryDate = json.data.expiry_date;
                const permanentAddress = json.data.permanent_address;

                //find the pending transaction
                getPendingTransaction(function (transaction) {
                    if (transaction) {
                        //update the transaction
                        updateTransaction(transaction.txn_id, { "expiry_date": expiryDate, "status": "complete" });
                    }
                });
            } else {
                MDS.log("INVALID message type in dmax server: " + type);
            }
        });
    }
}

function getPendingTransaction(callback) {
    MDS.cmd("SELECT * FROM transactions WHERE status='paid'", function (response) {
        if (response.rows.length > 0) {
            callback(response.rows[0]);
        } else {
            callback(null);
        }
    });
}



/*
*   Recieve and save a listing from a contact
*/
function processListing(entity) {
    if (logs) { MDS.log(`processing listing...${entity}`) }

    //check it's not one of your own
    const host = getHost();
    if (host.pk === entity.created_by_pk) {
        return;
    }

    createListing({
        listingId: entity.listing_id,
        title: entity.title,
        price: entity.price,
        createdByPk: entity.created_by_pk,
        createdByName: entity.created_by_name,
        sellerHasPermAddress: entity.seller_has_perm_address,
        sellerPermAddress: entity.seller_perm_address,
        sentByName: entity.sent_by_name,
        sentByPk: entity.sent_by_pk,
        walletAddress: entity.wallet_address,
        createdAt: entity.created_at,
        image: entity.image,
        description: entity.description,
        collection: entity.collection,
        delivery: entity.delivery,
        location: entity.location,
        locationDescription: entity.location_description,
        shippingCost: entity.shipping_cost,
        shippingCountries: entity.shipping_countries
    });
    if (logs) { MDS.log(`Listing ${entity.title} added!`); }
}

/*
* Seller processes availability check from buyer
*/
function processAvailabilityCheck(entity) {
    MDS.log(`received availability check for listing: ${JSON.stringify(entity)}`);

    //create the data for the response
    const data = {
        "type": "availability_response",
        "status": "unavailable",
        "listing_id": entity.listing_id
    }

    //check the status of the listing
    const listingStatus = getStatus(entity.listing_id);
    MDS.log(`status of listing is: ${JSON.stringify(listingStatus)}`);

    if (listingStatus) {
        //reduce the amount of statuses for the buyer to process
        if (listingStatus === 'available' || listingStatus === 'ongoing') {
            //send back the status of the listing
            data.status = 'available';
        } else if (listingStatus === 'unconfirmed_payment' || listingStatus === 'collection_confirmed' || listingStatus === 'completed') {
            data.status = 'completed';
        }
    }
    //Note: if there is no status then we will return unavailable

    MDS.log(`sending the responose to buyer..`);
    send({
        data: data,
        address: entity.buyer_pk,
        app: 'dbay',
        callback: function (response) {
            MDS.log(`response sent: ${JSON.stringify(response)}`);
        }
    });
}

/*
*
*/
function processNewBalanceEvent() {
    if (logs) { MDS.log("Processing new balance event"); }
    //TODO: update this function to only return last 3 transactions
    getHistoryTransactions(function (transactions) {
        if (transactions.length > 0) {

            getListingsWithUnconfirmedPayments(function (listings) {
                if (logs) {
                    MDS.log(`Found ${JSON.stringify(listings.count)} listings with unconfirmed payments`);
                }
                MDS.log(`Listings found: ${JSON.stringify(listings)}`);
                MDS.log(`Listings type ${JSON.stringify(typeof listings)}`);
                if (listings.length > 0) {
                    //loop therough coins and check each one against the coins list returned by mds.cmd('coins')
                    listings.forEach(function (listing) {

                        if (logs) { MDS.log(`Transactions found: ${JSON.stringify(transactions.length)}`); }
                        confirmCoin(listing.purchase_code, transactions, function (coin) {
                            //if theres a match, assume buyer has paid for listing
                            if (coin) {
                                MDS.log(`About to check coin amount: ${JSON.stringify(coin)}`);
                                //if coin is confirmed then check the amount of the coin matches the amount on the listing
                                var totalCost = parseInt(parseInt(listing.price) + (listing.shipping_cost ? parseInt(listing.shipping_cost) : 0));
                                MDS.log("listing amount: " + totalCost);
                                MDS.log("coin amount: " + coin.amount);
                                MDS.log("total cost: " + totalCost);
                                if (parseInt(coin.amount) === totalCost) {
                                    MDS.log("Coin amount matches listing amount");
                                    updateListing(listing.listing_id, { 'status': 'paid', 'notification': true });
                                    MDS.log("Listing updated to paid");

                                    var message = `You have received payment from @${listing.buyer_name} for your item: ${listing.title}`;
                                    addNotification({
                                        listing_id: listing.listing_id,
                                        message: message,
                                        created_at: Math.floor(Date.now() / 1000),
                                        callback: function (response) {
                                            MDS.log(`Notification added: ${JSON.stringify(response)}`);
                                        }
                                    })

                                } else {
                                    MDS.log("Coin amount does not match listing amount");
                                }
                            }
                        });
                    });
                }
            });
        }
    });
}



/*
*   Process a purchase receipt with READ permissions
*   @param {object} entity - the entity object
*/
function processPaymentReceiptRead(entity) {
    if (logs) { MDS.log(`Message received for purchased listing: ${JSON.stringify(entity)}`); }

    const id = entity.listing_id;
    const purchaseCode = entity.purchase_code;

    updateListing(id, {
        "status": "unconfirmed_payment",
        'buyer_message': entity.buyer_message,
        'buyer_name': entity.buyer_name,
        'buyer_pk': entity.buyer_pk,
        'transmission_type': entity.transmission_type,
        'purchase_code': entity.purchase_code,
    });

    getHistoryTransactions(function (transactions) {
        if (transactions.length > 0) {

            getListingById(id, function (listing) {
                if (logs) { MDS.log(`Listing found: ${JSON.stringify(listing)}`); }

                if (listing) {
                    if (logs) { MDS.log(`Transactions found: ${JSON.stringify(transactions.length)}`); }
                    confirmCoin(purchaseCode, transactions, function (coin) {

                        if (coin) {
                            //if coin found check amount of coin matches amount on listing
                            MDS.log(`About to check coin amount: ${JSON.stringify(coin)}`);
                            //if coin is confirmed then check the amount of the coin matches the amount on the listing
                            var totalCost = parseInt(parseInt(listing.price) + (listing.shipping_cost ? parseInt(listing.shipping_cost) : 0));
                            MDS.log("listing amount: " + totalCost);
                            MDS.log("coin amount: " + coin.amount);
                            MDS.log("total cost: " + totalCost);
                            if (parseInt(coin.amount) === totalCost) {
                                MDS.log("coin amount matches total cost");
                                updateListing(id,
                                    {
                                        'buyer_message': entity.buyer_message,
                                        'status': entity.transmission_type === 'collection' ? 'completed' : 'paid',
                                        'notification': true,
                                        'buyer_name': entity.buyer_name,
                                        'buyer_pk': entity.buyer_pk,
                                    });
                                var message = `You have received payment from @${entity.buyer_name} for your item: ${listing.title}.`;
                                if (entity.transmission_type === 'delivery') {
                                    message = `Congratulations, ${listing.title} has been purchased by @${entity.buyer_name}.`
                                }
                                addNotification({
                                    listing_id: entity.listing_id,
                                    message: message,
                                    created_at: Math.floor(Date.now() / 1000),
                                    callback: function (response) {
                                        MDS.log(`Notification added: ${JSON.stringify(response)}`);
                                    }
                                })

                            } else {
                                MDS.log("coin amount does not match total cost");
                            }
                        }
                    });
                }
            });
        }
    });
}

/*
*   Process a purchase receipt with WRITE permissions
*   @param {object} entity - the entity object
*/
function processPaymentReceiptWrite(entity) {
    var id = entity.listing_id;
    if (logs) { MDS.log(`Message received for purchased listing: ${JSON.stringify(entity)}`); }

    getHistoryTransactions(function (transactions) {
        if (transactions.length > 0) {

            getListingById(id, function (listing) {
                if (logs) { MDS.log(`Listing found: ${JSON.stringify(listing)}`); }

                if (listing) {
                    if (logs) { MDS.log(`Transactions found: ${JSON.stringify(transactions.length)}`); }
                    confirmCoin(entity.purchase_code, transactions, function (coin) {

                        if (coin) {
                            //if coin found check amount of coin matches amount on listing
                            MDS.log(`About to check coin amount: ${JSON.stringify(coin)}`);
                            //if coin is confirmed then check the amount of the coin matches the amount on the listing
                            var totalCost = parseInt(parseInt(listing.price) + (listing.shipping_cost ? parseInt(listing.shipping_cost) : 0));
                            MDS.log("listing amount: " + totalCost);
                            MDS.log("coin amount: " + coin.amount);
                            MDS.log("total cost: " + totalCost);
                            if (parseInt(coin.amount) === totalCost) {
                                MDS.log("coin amount matches total cost");
                                updateListing(id,
                                    {
                                        'buyer_message': entity.buyer_message,
                                        'status': 'completed',
                                        'notification': true,
                                        'buyer_name': entity.buyer_name,
                                        'buyer_pk': entity.buyer_pk,
                                        'purchase_code': entity.purchase_code,
                                        'transmission_type': entity.transmission_type,
                                    });
                                var message = `You have received payment from @${entity.buyer_name} for your item: ${listing.title}.`;
                                if (entity.transmission_type === 'delivery') {
                                    message = `Congratulations, ${listing.title} has been purchased by @${entity.buyer_name}.`
                                }
                                addNotification({
                                    listing_id: entity.listing_id,
                                    message: message,
                                    created_at: Math.floor(Date.now() / 1000),
                                    callback: function (response) {
                                        MDS.log(`Notification added: ${JSON.stringify(response)}`);
                                    }
                                })
                            } else {
                                MDS.log("coin amount does not match total cost");
                            }
                        } else {
                            MDS.log("coin not found");
                            updateListing(id, {
                                'buyer_message': entity.buyer_message,
                                'status': 'unconfirmed_payment',
                                'buyer_name': entity.buyer_name,
                                'buyer_pk': entity.buyer_pk,
                                'purchase_code': entity.purchase_code,
                                'transmission_type': entity.transmission_type,
                            });
                            //check for coin when rew balance comes in
                        }

                    });
                }
            });
        }
    });
}


function processItemSentClicked(entity) {
    if (logs) { MDS.log(`Message received for item sent: ${JSON.stringify(entity)}`); }
    const id = entity.data.listing_id;
    updateListing(id, { "status": "completed", 'notification': true });
    getListingById(id, function (listing) {
        //MDS.log(`Listing found: ${JSON.stringify(listing)}`);
        notification(`Your purchase ${listing.title} has been sent by @${listing.created_by_name} and is now in transit.`);
        var message = `Your purchase ${listing.title} has been sent by @${listing.created_by_name} and is now in transit.`
        addNotification({
            listing_id: listing.listing_id,
            message: message,
            created_at: Math.floor(Date.now() / 1000),
            callback: function (response) {
                MDS.log(`Notification added: ${JSON.stringify(response)}`);
            }
        })
    });
}

/*
* Returns the coin that has the purchase code
* @param {string} purchaseCode - the purchase code
* @param {array} transactions - the transactions array
* @param {function} callback - the callback function
*/
function confirmCoin(purchaseCode, transactions, callback) {
    if (logs) { MDS.log(`Confirming coin for purchase code: ${purchaseCode}`); }
    var response = null;
    transactions.forEach(function (transaction) {
        //if (logs) { MDS.log(`Transaction: ${JSON.stringify(transaction.body.txn.state)}`); }
        if (transaction.body.txn.state[0]) {
            if (transaction.body.txn.state[0].data) {
                //MDS.log(`Transaction: ${JSON.stringify(transaction.body.txn.state[0].data)}`);

                if (transaction.body.txn.state[0].data === "[" + purchaseCode + "]") {
                    if (logs) { MDS.log(`Coin confirmed: ${JSON.stringify(transaction.body.txn.outputs[0].coinid)}`); }
                    response = transaction.body.txn.outputs[0];
                }
            }
        }
    });
    callback(response);
}

/*
*   BUYER FUNCTION: update the listing with the returned status from seller
*/
function processAvailabilityResponse(entity) {
    if (logs) { MDS.log(`received availability response and updatuing listing status ${JSON.stringify(entity)}`); }
    updateListing(entity.listing_id, { "status": entity.status });
}

/*
*   SELLER FUNCTION: process the collection confirmation
*/
function processCollectionRequest(entity) {
    if (logs) { MDS.log(`Message received for collection of listing, updating..`); }
    const buyerName = entity.buyer_name;
    const id = entity.listing_id;
    updateListing(id, {
        'buyer_message': entity.message,
        'status': 'ongoing',
        'notification': true,
        'transmission_type': entity.transmission_type,
        'buyer_name': buyerName,
        'buyer_pk': entity.buyer_pk,
    });
    getListingById(id, function (listing) {
        var message = `@${buyerName} would like to arrange to collect ${listing.title}.`
        addNotification({
            listing_id: listing.listing_id,
            message: message,
            created_at: Math.floor(Date.now() / 1000),
            callback: function (response) {
                MDS.log(`Notification added: ${JSON.stringify(response)}`);
            }
        })
    });
}

/*
*  BUYER FUNCTION: process the collection rejection
*/
function processCollectionRejected(entity) {
    if (logs) { MDS.log(`Message received for collection rejected, updating..`); }
    updateListing(entity.listing_id, { 'status': 'collection_rejected' });
}

/*
*   SELLER FUNCTION: process the collection cancellation
*/
function processCancelCollection(entity) {
    if (logs) { MDS.log(`Message received for cancelling collection`); }
    const listing = getListingById(entity.listing_id);
    if (listing.buyer_name === entity.buyer_name) {
        updateListing(entity.listing_id, { 'status': 'available' })
    } else {
        if (logs) { MDS.log("buyer name not the same as on listing so cancel averted!"); }
    }
}


/*
*   SELLER FUNCTION: process subscription request
*/
function processSubscriptionRequest(entity) {
    if (logs) { MDS.log(`Message received for subscription request, updating..`); }
    const subscriberAddress = entity.data.subscriber_address;
    const listingInventory = entity.data.listing_inventory;
    MDS.log(`Listing inventory: ${JSON.stringify(listingInventory)}`);
    getMaximaInfo(function (maxima) {
        const publickey = maxima.publickey;
        MDS.log(`Public key: ${publickey}`);
        getListings(publickey, function (listings) {
            MDS.log(`All Listings: ${JSON.stringify(listings)}`);
            //compare listings ids to the lising inventory and return only the difference
            const filteredListings = listings.filter(function (listing) {
                const isListingInInventory = listingInventory.some(function (inventoryItem) {
                    return String(inventoryItem.listing_id) === String(listing.listing_id);
                });
                MDS.log(`Listing ${listing.listing_id} is ${isListingInInventory ? '' : 'not '}in inventory`);
                return !isListingInInventory;
            });
            MDS.log(`Filtered listings: ${JSON.stringify(filteredListings)}`);
            if (filteredListings.length > 0) {
                //loop through each listing and send it back to the subscriber
                filteredListings.forEach(function (listing) {
                    MDS.log(`Sending listing: ${JSON.stringify(listing)}`);
                    sendListingToContactAddress(subscriberAddress, listing, function (response) {
                        MDS.log(`Response from sending listing: ${JSON.stringify(response)}`);
                    }
                    );
                });
            }
        });
    });
}


function processSellerInfoRequest(entity) {
    if (logs) { MDS.log(`Message received for seller info request, updating..`); }
    const subscriberAddress = entity.data.subscriber_address;
    //get the maxima name and return it
    getMaximaInfo(function (maxima) {
        const name = maxima.name;
        MDS.log(`Name: ${name}`);
        const data = {
            "type": "SELLER_INFO_RESPONSE",
            "data": {
                "name": name,
                "publickey": maxima.publickey
            }
        }
        const app = "dbay";
        const address = subscriberAddress;
        sendMessage({
            data: data, address: address, app: app, callback: function (response) {
                MDS.log(`Response from sending seller info: ${JSON.stringify(response)}`);
            }
        });
        var message = `You have a new subscriber!`;
        addNotification({
            message: message,
            created_at: Math.floor(Date.now() / 1000),
            callback: function (response) {
                MDS.log(`Notification added: ${JSON.stringify(response)}`);
            }
        });
    });
}

function processSellerInfoResponse(entity) {
    if (logs) { MDS.log(`Message received for seller info response, updating..`); }
    const sellerInfo = entity.data;
    const sellerName = sellerInfo.name;
    const sellerPublicKey = sellerInfo.publickey;
    //get all the subcriptions and update the name of the one that matches the publickey
    getSubscriptions(function (subcriptions) {
        MDS.log(`Subscriptions: ${JSON.stringify(subcriptions)}`);
        if (subcriptions && subcriptions.length > 0) {
            const subscription = subcriptions.find(function (subscription) {
                return subscription.seller_permanent_address.includes(sellerPublicKey);
            });
            MDS.log(`Subscriber: ${JSON.stringify(subscription)}`);
            if (subscription) {
                updateSubscriber(subscription.seller_permanent_address, { "seller_store_name": sellerName });
            }
        }
    });
}




/*

***************************************************** GET FUNCTIONS *****************************************************
*/

function getSubscriptions(callback) {
    let fullsql = `SELECT * FROM subscriptions`;
    MDS.sql(fullsql, (res) => {
        if (res.error) {
            callback(false, res.error);
        } else {
            MDS.log(`Subscriptions: ${JSON.stringify(res.rows)}`);
            callback(res.rows);
        }
    });
}

function getMaximaInfo(callback) {
    var maxcmd = "maxima";
    MDS.cmd(maxcmd, function (msg) {
        MDS.log(JSON.stringify(msg));
        if (msg.response) {
            callback(msg.response);
        } else {
            callback(false);
        }
    });
}

/**
* Fetches all listings listings using a particular Id
* @param {string} pk - The id of the creator
*/
function getListings(pk, callback) {
    const store = `where "created_by_pk"='${pk}'`;
    const Q = `select * from ${LISTINGSTABLE} ${pk ? `${store}` : ''};`
    MDS.sql(Q, (res) => {
        if (res.status) {
            callback(res.rows);
        } else {
            callback(false, Error(`MDS.SQL ERROR, could get listings ${res.error}`));
            MDS.log(`MDS.SQL ERROR, could get listings ${res.error}`);
        }
    });

}


function getStatus(listingId) {
    var status = '';
    MDS.sql(`SELECT "status" FROM ${LISTINGSTABLE} WHERE "listing_id"='${listingId}';`, function (res) {
        if (res) {
            if (logs) { MDS.log(`Response from get status is: ${JSON.stringify(res)}`); }
            if (res.count > 0) {
                status = res.rows[0].status;
            }
        }
        else {
            if (logs) { MDS.log(`MDS.SQL ERROR, couldn't get status of listing ${res.error}`); }
        }
    });
    return status;
}

function getHost() {
    var host = '';
    MDS.sql(`select * FROM SETTINGS;`, function (res) {
        if (res.status && res.count === 1) {
            host = res.rows[0];
        } else if (res.error.includes('Table \"SETTINGS\" not found')) {
            return "No Tables Created";
        } else {
            return res.error;
        }
    });
    return host;
}
/*
*   Return coin if found
*/
function getCoinById(coinid, callback) {
    MDS.cmd(`coins coinid:${coinid}`, function (res) {
        if (res.status) {
            if (callback) {
                callback(res.response[0]);
            }
        } else {
            if (logs) { MDS.log(`MDS.cmd ERROR, could not get coin ${res.error}}`); }
            return Error(res.error);
        }
    });
}
/*
*   Return coin if found
*/
function getCoinByIdAndAddress(coinid, address, callback) {
    MDS.cmd(`coins coinid:${coinid} address:${address}`, function (res) {
        if (res.status) {
            if (callback) {
                callback(res.response[0]);
            }
        } else {
            if (logs) { MDS.log(`MDS.cmd ERROR, could not get coin ${res.error}}`); }
            return Error(res.error);
        }
    });
}

function getListingById(id, callback) {
    var listings = '';
    MDS.sql(`SELECT * FROM ${LISTINGSTABLE} WHERE "listing_id"='${id}';`, function (res) {
        if (res.status) {
            if (res.count > 1) {
                if (logs) { MDS.log(`More than one listing with id ${id}`); }
                return null;
            } else {
                if (callback) {
                    callback(res.rows[0]);
                } else {
                    listings = res.rows[0];
                }
            }
        } else {
            if (logs) { MDS.log(`MDS.SQL ERROR, could get listing by Id ${res.error}`); }
            return null;
        }
    });
    return listings;
}

function getMLS(callback) {
    MDS.cmd('maxima', function (res) {
        if (logs) { MDS.log('Get MLS: ' + JSON.stringify(res)); }
        if (res.status) {
            callback(res.response.mls);
        } else {
            callback(Error(`Couldn't fetch maxima public key ${res.error}`));
        }
    })
}

function getMaximaContactName(callback) {
    MDS.cmd('maxima', function (res) {
        if (res.status) {
            callback(res.response.name);
        } else {
            callback(Error(`Couldn't fetch maxima contact name ${res.error}`));
        }
    })
}



function getListingsWithUnconfirmedPayments(callback) {
    if (logs) { MDS.log("Getting unconfirmed payments"); }
    MDS.sql(`SELECT * FROM "${LISTINGSTABLE}" WHERE "status"='unconfirmed_payment'`, function (result) {
        if (result && callback) {
            if (result.count > 0) {
                callback(result.rows);
            }
        } else {
            callback([]);
            if (logs) { MDS.log("No unconfirmed payments found"); }
        }
    });
}


function getListingsWithPendingUID(callback) {
    if (logs) { MDS.log("Getting pending listings"); }
    MDS.sql(`SELECT * FROM "${LISTINGSTABLE}" WHERE "pendinguid" IS NOT NULL AND "status"='pending_confirmation'`, function (result) {
        if (result && callback) {
            callback(result.rows);
        } else {
            callback([]);
            if (logs) { MDS.log("No pending listings found"); }
        }
    });
}

function getTransactionsWithPendingUID(callback) {
    if (logs) { MDS.log("Getting pending transactions"); }
    MDS.sql(`SELECT * FROM "${TRANSACTIONSTABLE}" WHERE "pendinguid" IS NOT NULL`, function (result) {
        if (result && callback) {
            callback(result.rows);
        } else {
            callback([]);
            if (logs) { MDS.log("No pending listings found"); }
        }
    });
}



function getHistoryTransactions(callback) {
    if (logs) { MDS.log('Search history for purchase code'); }
    MDS.cmd(`history`, function (res) {
        if (res.status === true) {
            callback(res.response.txpows);
        }
        else { callback([]); }
    });
}

function hasStaticMLS(callback) {
    MDS.cmd('maxima', function (res) {
        if (res.status) {
            if (res.staticmls === true) {
                callback(res.static);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}



/*
***************************************************** DATABASE FUNCTIONS *****************************************************
*/

function createListingTable(callback) {
    const Q = `create table if not exists ${LISTINGSTABLE} (
            "listing_id" varchar(666) primary key,
            "title" varchar(50) NOT NULL,
            "price" INT NOT NULL,
            "created_by_pk" varchar(640) NOT NULL,
            "created_by_name" char(50),
            "seller_has_perm_address" boolean default false,
            "seller_perm_address" varchar(640),
            "sent_by_pk" varchar(640),
            "sent_by_name" char(50),
            "created_at" int not null,
            "wallet_address" varchar(80) not null,
            "status" char(40) not null default 'available',
            "buyer_message" varchar(1000),
            "buyer_name" char(50),
            "buyer_pk" varchar(330),
            "purchase_code" varchar(30),
            "pendinguid" varchar(34) default null,
            "coin_id" varchar(80),
            "notification" boolean default false,
            "collection" boolean default false,
            "delivery" boolean default false,
            "image"  varchar(max),
            "description" varchar(1500),
            "location" varchar(50),
            "location_description" varchar(150),
            "shipping_cost" int,
            "shipping_countries" varchar(150),
            "transmission_type" varchar(10),
            constraint UQ_listing_id unique("listing_id")
            )`;

    MDS.sql(Q, function (res) {
        if (logs) { MDS.log(`MDS.SQL, ${Q}`); }
        MDS.log(`Creating listing tables ${res.status}`)
        if (res.status && callback) {
            callback(true);
        } else {
            return Error(`Creating listing tables ${res.error}`);
        }
    })
}

function createSettingsTable(callback) {
    const Q = `create table if not exists ${SETTINGSTABLE} (
            "pk" varchar(640),
            "perm_address" varchar(80),
            "dmax_server_p2p_identity" varchar(640) default null,
            CONSTRAINT AK_name UNIQUE("perm_address"),
            CONSTRAINT AK_pk UNIQUE("pk")
            )`;

    MDS.sql(Q, function (res) {
        if (logs) { MDS.log(`MDS.SQL, ${Q}`); }
        if (res.status && callback) {
            callback(true);
        } else {
            return Error(`${res.error}`);
        }
    })
}

//create a subscriptions table
function createSubscriptionsTable(callback) {
    const Q = `create table if not exists ${SUBSCRIPTIONSTABLE} (
            "seller_permanent_address" varchar(640) NOT NULL PRIMARY KEY,
            "seller_store_name" varchar(50) NOT NULL,
            "seller_store_description" varchar(1500),
            "seller_store_image" varchar(max)
            )`;

    MDS.sql(Q, function (res) {
        if (logs) { MDS.log(`MDS.SQL, ${Q}`); }
        if (res.status && callback) {
            callback(true);
        } else {
            return Error(`${res.error}`);
        }
    })
}


function createHost(pk, permAddress, callback) {
    let fullsql = `insert into ${SETTINGSTABLE}("pk", "perm_address") values('${pk}', '${permAddress}');`;
    if (permAddress === '') {
        fullsql = `insert into ${SETTINGSTABLE}("pk") values('${pk}');`;
    }
    MDS.sql(fullsql, (res) => {
        if (res.status) {
            callback(true);
        } else {
            callback(Error(res.error));
        }
    });
}

function createListing({
    title,
    price,
    createdByPk,
    createdByName,
    sellerHasPermAddress,
    sellerPermAddress,
    listingId,
    sentByName,
    sentByPk,
    walletAddress,
    createdAt,
    image,
    description,
    collection,
    delivery,
    location,
    locationDescription,
    shippingCost,
    shippingCountries
}) {
    const randomId = Math.trunc(Math.random() * 10000000000000000);
    let pk = '';
    getPublicKey(function (res) {   // get the public key of the user
        if (res) {
            pk = res;
        } else {
            return Error(`Couldn't fetch public key ${res.error}`);
        }
    });

    const id = `${randomId}${pk}`;
    if (logs) { MDS.log(`the id for the listing is: ${id}`); }
    const timestamp = Math.floor(Date.now() / 1000);

    let fullsql = `insert into ${LISTINGSTABLE}
        (
            "listing_id",
            "title",
            "price",
            "collection",
            "delivery",
            "created_by_pk",
            "created_by_name",
            "seller_has_perm_address",
            ${sellerHasPermAddress ? '"seller_perm_address",' : ''}
            ${sentByName ? '"sent_by_name",' : ''}
            ${sentByPk ? '"sent_by_pk",' : ''}
            "wallet_address",
             ${sentByPk ? '"status",' : ''}
            "image",
            "description",
            ${location ? '"location",' : ''}
            ${locationDescription ? '"location_description",' : ''}
            ${shippingCost ? '"shipping_cost",' : ''}
            ${shippingCountries ? '"shipping_countries",' : ''}
            "created_at"
        )

        values(
            ${listingId ? `'${listingId}',` : `'${id}',`}
            '${title}',
            '${price}',
            '${collection}',
            '${delivery}',
            '${createdByPk}',
            '${createdByName}',
            '${sellerHasPermAddress}',
            ${sellerHasPermAddress ? `'${sellerPermAddress}',` : ''}
            ${sentByName ? `'${sentByName}',` : ''}
            ${sentByPk ? `'${sentByPk}',` : ''}
            '${walletAddress}',
            ${sentByPk ? `'unchecked',` : ''}
            '${image}',
            '${description}',
            ${location ? `'${location}',` : ''}
            ${locationDescription ? `'${locationDescription}',` : ''}
            ${shippingCost ? `'${shippingCost}',` : ''}
            ${shippingCountries ? `'${shippingCountries}',` : ''}
            ${createdAt ? `'${createdAt}'` : `'${timestamp}'`}
        );`;
    MDS.sql(fullsql, (res) => {
        if (logs) { MDS.log(`MDS.SQL, ${fullsql}`); }
        if (res.status) {
            return listingId ? listingId : id;
        } else {
            if (logs) { MDS.log(`MDS.SQL ERROR, could not create listing ${res.error}}`); }
            return Error(res.error);
        }
    });
}

/*
*   Show notificatio to the user in the minidapp
*/
function notification(message) {
    MDS.notify(message);
    MDS.log('Notification sent: ' + message);
}


function addLocationDescriptionColumn(callback) {
    const Q = `alter table ${LISTINGSTABLE} add column if not exists "location_description" varchar(150);`;
    MDS.sql(Q, function (res) {
        if (logs) { MDS.log(`MDS.SQL, ${Q}`); }
        if (res.status) {
            callback(true)
        } else {
            callback(Error(`Adding location_description column to listing table ${res.error}`));
        }
    })
}

function addContact(address, callback) {
    MDS.cmd(`maxcontacts action:add contact:${address}`, function (res) {
        if (res.status) {
            callback(true);
        } else {
            callback(Error(`Adding contact ${address} to maxcontacts ${res.error}`));
        }
    });
}


function addPendingUIDColumn(callback) {
    const Q = `alter table ${LISTINGSTABLE} add column if not exists "pendinguid" varchar(34) default null;`;
    MDS.sql(Q, function (res) {
        if (logs) { MDS.log(`MDS.SQL, ${Q}`); }
        if (res.status) {
            callback(true)
        } else {
            callback(Error(`Adding pendinguid column to listing table ${res.error}`));
        }
    })
}

//add "seller_has_perm_address" boolean default false column
function addSellerHasPermAddressColumn(callback) {
    const Q = `alter table ${LISTINGSTABLE} add column if not exists "seller_has_perm_address" boolean default false;`;
    MDS.sql(Q, function (res) {
        if (logs) { MDS.log(`MDS.SQL, ${Q}`); }
        if (res.status) {
            callback(true)
        } else {
            callback(Error(`Adding seller_has_perm_address column to listing table ${res.error}`));
        }
    })
}

//add "seller_perm_address" varchar(34) default null column
function addSellerPermAddressColumn(callback) {
    const Q = `alter table ${LISTINGSTABLE} add column if not exists "seller_perm_address" varchar(640) default null;`;
    MDS.sql(Q, function (res) {
        if (logs) { MDS.log(`MDS.SQL, ${Q}`); }
        if (res.status) {
            callback(true)
        } else {
            callback(Error(`Adding seller_perm_address column to listing table ${res.error}`));
        }
    })
}


//add dmax_server_p2p2_identity column
function addDmaxServerP2p2IdentityColumn(callback) {
    const Q = `alter table ${SETTINGSTABLE} add column if not exists "dmax_server_p2p_identity" varchar(640) default null;`;
    MDS.sql(Q, function (res) {
        if (logs) { MDS.log(`MDS.SQL, ${Q}`); }
        if (res.status) {
            callback(true)
        } else {
            callback(Error(`Adding dmax_server_p2p2_identity column to listing table ${res.error}`));
        }
    })
}


function updateListing(listingId, data) {
    var formattedData = '';

    var keys = Object.keys(data);
    var totalKeys = keys.length;

    for (var i = 0; i < totalKeys; i++) {
        var key = keys[i];

        // Check if it's the last iteration
        if (i === totalKeys - 1) {
            formattedData += `"${key}"='${data[key]}'`;
        } else {
            formattedData += `"${key}"='${data[key]}',`;
        }
    }
    MDS.sql(`UPDATE ${LISTINGSTABLE} SET ${formattedData} WHERE "listing_id"='${listingId}';`, function (res) {
        if (res.status) {
            if (logs) { MDS.log(`MDS.SQL, UPDATE ${LISTINGSTABLE} SET ${formattedData} WHERE "listing_id"='${listingId}';`); }
            return res;
        } else {
            if (logs) { MDS.log(`MDS.SQL ERROR, could get update listing ${res.error}`); }
            return false;
        }
    });
}


function updateTransaction(transactionId, data) {
    var formattedData = '';

    var keys = Object.keys(data);
    var totalKeys = keys.length;

    for (var i = 0; i < totalKeys; i++) {
        var key = keys[i];

        // Check if it's the last iteration
        if (i === totalKeys - 1) {
            formattedData += `"${key}"='${data[key]}'`;
        } else {
            formattedData += `"${key}"='${data[key]}',`;
        }
    }
    MDS.sql(`UPDATE ${TRANSACTIONSTABLE} SET ${formattedData} WHERE "txn_id"='${transactionId}';`, function (res) {
        if (res.status) {
            if (logs) { MDS.log(`MDS.SQL, UPDATE ${TRANSACTIONSTABLE} SET ${formattedData} WHERE "txn_id"='${transactionId}';`); }
            return res;
        } else {
            if (logs) { MDS.log(`MDS.SQL ERROR, could get update txn ${res.error}`); }
            return false;
        }
    });
}

function updateSubscriber(id, data) {
    var formattedData = '';

    var keys = Object.keys(data);
    var totalKeys = keys.length;

    for (var i = 0; i < totalKeys; i++) {
        var key = keys[i];

        // Check if it's the last iteration
        if (i === totalKeys - 1) {
            formattedData += `"${key}"='${data[key]}'`;
        } else {
            formattedData += `"${key}"='${data[key]}',`;
        }
    }
    MDS.sql(`UPDATE ${SUBSCRIPTIONSTABLE} SET ${formattedData} WHERE "seller_permanent_address"='${id}';`, function (res) {
        if (res.status) {
            if (logs) { MDS.log(`MDS.SQL, UPDATE ${SUBSCRIPTIONSTABLE} SET ${formattedData} WHERE "seller_permanent_address"='${id}';`); }
            return res;
        } else {
            if (logs) { MDS.log(`MDS.SQL ERROR, could get update subscriber ${res.error}`); }
            return false;
        }
    });
}


function addP2pIdentity(p2p, callback) {
    MDS.sql(`UPDATE ${SETTINGSTABLE} SET "dmax_server_p2p_identity"='${p2p}';`, function (res) {
        if (res.status) {
            callback(true);
        } else {
            if (logs) { MDS.log(`MDS.SQL ERROR, couldn't add p2p identity ${res.error}`); }
            return false;
        }
    });
}

/*
**************************************************** MAXIMA ****************************************************
*/


function utf8ToHex(s) {
    var rb = [];
    for (var i = 0; i < s.length; i++) {
        var code = s.charCodeAt(i);
        if (code < 128) {
            rb.push(code);
        } else if (code < 2048) {
            rb.push((code >> 6) | 192);
            rb.push((code & 63) | 128);
        } else {
            rb.push((code >> 12) | 224);
            rb.push(((code >> 6) & 63) | 128);
            rb.push((code & 63) | 128);
        }
    }
    var r = '';
    for (var i = 0; i < rb.length; i++) {
        var b = rb[i];
        r += ('0' + b.toString(16)).slice(-2);
    }
    return r;
}

function send({ data, address, app, callback }) {
    //before sending append version number of application

    //Convert to a string..
    var datastr = JSON.stringify(data);

    //And now convert to HEX
    var hexstr = "0x" + utf8ToHex(datastr).toUpperCase().trim();

    //Create the function..
    var fullfunc = '';
    MDS.log('Heres the address we\'ll send to: ' + address);
    if (address.indexOf('@') !== -1) {
        fullfunc = 'maxima action:send poll:true to:' + address + ' application:' + app + ' data:' + hexstr;
    } else {
        fullfunc = 'maxima action:send poll:true publickey:' + address + ' application:' + app + ' data:' + hexstr;
    }

    //Send the message via Maxima!..
    MDS.cmd(fullfunc, function (resp) {
        if (resp.status === false) {
            MDS.log("Status was false:" + JSON.stringify(resp));
            callback(false, resp.error);
        } else if (resp.response.delivered === false) {
            MDS.log("Message was not delivered: " + JSON.stringify(resp));
            callback(false, resp.response.error);
        } else if (resp.status === true) {
            MDS.log("The status is true for the maxima command: " + JSON.stringify(resp));
            callback(true);
        }
    });
}
/**
* Fetches maxima contact address
*/
function getMaximaContactAddress(callback) {
    MDS.cmd('maxima', function (res) {
        if (res.status) {
            callback(res.response.contact);
        } else {
            callback(false, (Error(`Couldn't fetch maxima contact name ${res.error}`)));
        }
    })
}


function getListingIds(seller_address, callback) {
    MDS.sql(`SELECT "listing_id" FROM ${LISTINGSTABLE} WHERE "created_by_pk"='${seller_address}';`, function (res) {
        if (res.status) {
            if (logs) { MDS.log(`MDS.SQL, SELECT "listing_id" FROM ${LISTINGSTABLE} WHERE "seller_permanent_address"='${seller_address}';`); }
            callback(res.data);
        } else {
            if (logs) { MDS.log(`MDS.SQL ERROR, could get listing ids ${res.error}`); }
            callback(false, (Error(`Couldn't fetch listing ids ${res.error}`)));
        }
    });
}



//function that loops through each seller in the subscriptions table and sends them a SUBCRIPTION_REQUEST requesting they send their listings
function sendSubscriptionRequests() {
    getMaximaContactAddress(function (maximaContactAddress, err) {
        //get all the sellers from the subscriptions table
        MDS.sql(`SELECT "seller_permanent_address" FROM ${SUBSCRIPTIONSTABLE}`, function (res) {
            MDS.log('the results from getting sellers from the subscriptions table are: ' + JSON.stringify(res));
            if (res.status && res.rows > 0) {
                if (logs) { MDS.log(`MDS.SQL, SELECT "seller_permanent_address" FROM ${SUBSCRIPTIONSTABLE}`); }
                MDS.log(JSON.stringify(res));

                //loop through each seller and send them a SELECT "seller_permanent_address" FROM SUBSCRIPTIONEST
                for (var i = 0; i < res.rows.length; i++) {
                    var seller = res.rows[i].seller;
                    //get all the listings for the seller
                    //get the publickeuy from the full MAxima address
                    var sellerAddress = seller.split('#')[1];
                    debugger;
                    getListingIds(sellerAddress, function (listings, err) {
                        if (err) {
                            if (logs) { MDS.log(`MDS.SQL ERROR, could get listings ${err}`); }
                            return false;
                        }
                        //check if the seller is a valid address
                        if (seller.includes('MAX')) {
                            //send the seller a LISTINGS_REQUEST
                            var data = {
                                "type": "LISTINGS_REQUEST",
                                "data": {
                                    "listing_inventory": listings,
                                    "subscriber_address": maximaContactAddress
                                }
                            }
                            sendMessage({
                                data: data,
                                address: seller,
                                app: "dbay",
                                callback: function (res) {
                                    if (res.status) {
                                        if (logs) { MDS.log(`Successfully sent subscription request to ${seller}`); }
                                        return true;
                                    } else {
                                        if (logs) { MDS.log(`MDS.SQL ERROR, couldn't send subscriptions ${res.error}`); }
                                        return false;
                                    }
                                }
                            });
                        }
                    });
                }

            } else {
                if (logs) { MDS.log(`There are no sellers in the subscriptions table`); }
                return false;
            }
        });
    });
}

function sendListingToContactAddress(subscriberAddress, listing, callback) {
    var data = listing;
    data.type = 'LISTING';
    getMaximaInfo(function (maxima, err) {
        if (err) {
            if (logs) { MDS.log(`MDS.SQL ERROR, could get maxima info ${err}`); }
            return false;
        }
        listing.sent_by_name = maxima.name;
        listing.sent_by_pk = maxima.publickey;

        send({
            data: data,
            address: subscriberAddress,
            app: "dbay",
            callback: function (result) {
                if (logs) { MDS.log('Message sent to seller: ' + JSON.stringify(result)) }
            }
        });
    });
}