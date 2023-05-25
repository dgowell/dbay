/* eslint-disable no-undef */
var LISTINGSTABLE = 'LISTING';
var SETTINGSTABLE = 'SETTINGS';
var APPLICATION_NAME = 'stampd';

//switch on and off logs
var logs = true;

MDS.init(function (msg) {
    switch (msg.event) {
        case "inited":
            setup();
            break;
        case "MAXIMA":
            if (logs) { MDS.log("MAXIMA EVENT received: "); }
            processMaximaEvent(msg);
            break;
        case "MINING":
            //check coins against unconfirmed/pending payemnts
            if (logs) { MDS.log("MINING EVENT received: "); }
            processMiningEvent(msg.data);
            break;
        case "NEWBALANCE":
            //check coins against unconfirmed/pending payemnts
            if (logs) { MDS.log("NEWBALANCE EVENT received: "); }
            processNewBalanceEvent();
            break;
        default:
            //if (logs) { MDS.log(JSON.stringify(msg)); }
            break;
    }
});
/*
* Register the store name and public key, if no store then create it
* store name = maxima contact name
* store id = current public key
*/
function setup() {
    let pk = getPublicKey();
    let hostName = getMaximaContactName();
    let mls = getMLS();
    const permanentAddress = `MAX#${pk}#${mls}`;

    if (logs) { MDS.log(`Permanent Address: ${permanentAddress}`) }

    //create listing table
    createListingTable(function (result) {
        if (logs) { MDS.log('Listing table created or exists') }

        //add location description column
        addLocationDescriptionColumn(function (result) {
            if (logs) { MDS.log('Added location description Column: ' + result) }
        });

        //add location description column
        addUnconfirmedCoinColumn(function (result) {
            if (logs) { MDS.log('Added unconfirmed coin Column: ' + result) }
        });

        //create settings table
        createSettingsTable(function (result) {
            if (logs) { MDS.log('Settings table created or exists:' + hostName); }

            //check if store exists
            createHost(hostName, permanentAddress);
            if (logs) { MDS.log('Local hosting info stored in database') }

        });
    });
}

/*
************************************************* PROCESS EVENTS *************************************************
*/
function processMaximaEvent(msg) {

    //Is it for us.. ?
    if (msg.data.application !== "stampd") {
        return;
    }

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
            //buyer checks listing availability with seller
            processAvailabilityCheck(entity);
            break;
        case 'availability_response':
            //seller sends status of listing to buyer
            processAvailabilityResponse(entity);
            break;
        case 'listing':
            //a contact has shared a listing with you
            processListing(entity);
            break;
        case 'purchase_receipt':
            //buyer sends seller their address and coin id
            processPurchaseReceipt(entity);
            break;
        case 'collection_confirmation':
            //buyer sends seller their number to arrange collection
            processCollectionConfirmation(entity);
            break;
        case 'cancel_collection':
            //buyer sends seller their number to arrange collection
            processCancelCollection(entity);
            break;
        default:
            if (logs) { MDS.log(entity); }
    }

}
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
* Check coins for unconfirmed payments
*/
function processMiningEvent(data) {
    if (logs) { MDS.log("Processing mining event"); }


    //check if we are seller or buyer
    var pk = getPublicKey();

    var txn = '';
    var listingId = '';
    var outputs = '';
    var coinId = '';

    try {
        txn = data.txpow.body.txn;
        listingId = txn.state[0].data;

        //remove the square brackets in the listingID string
        listingId = listingId.substring(1, listingId.length - 1);

        var outputs = txn.outputs;


        getListingById(listingId, function (listing) {
            if (logs) { MDS.log("Listing:" + JSON.stringify(listing)); }

            //loop through the outputs and check which amount equals the listing.price;
            for (var x = 0; x < outputs.length; x++) {
                var output = outputs[x];
                var amount = output.amount;
                if (logs) { MDS.log("amount:" + amount); }
                if (amount === listing.price) {
                    if (logs) { MDS.log("amount matches listing price"); }
                    coinId = output.coinid;
                    if (logs) { MDS.log("coin id:" + coinId); }
                }
            }
            if (logs) { MDS.log("Transmission Type:" + listing.transmission_type); }

            //send listingId and coinid to seller
            var data = {
                "type": "purchase_receipt",
                "listing_id": listingId,
                "coin_id": coinId,
                "transmission_type": listing.transmission_type
            }

            if (logs) { MDS.log("sending purchase receipt to seller at: " + listing.created_by_pk); }
            send(data, listing.created_by_pk);

        });
    } catch (error) {
        if (logs) { MDS.log(error); }
    }
}

function processAvailabilityCheck(entity) {
    MDS.log(`received availability check for listing: ${JSON.stringify(entity)}`);

    const data = {
        "type": "availability_response",
        "status": "unavailable",
        "listing_id": entity.listing_id
    }

    try {
        //is listing available
        const listingStatus = getStatus(entity.listing_id);
        MDS.log(`status of listing is: ${JSON.stringify(listingStatus)}`);

        if (listingStatus) {
            data.status = listingStatus;

            MDS.log(`sending the responose to buyer..`);
            send(data, entity.buyer_pk);

            //if listing available change to pending to stop other users buying it
            if (listingStatus === 'available') {
                updateListing(entity.listing_id, { "status": "pending" });
            }
        };
    } catch (error) {
        if (logs) { MDS.log(`There was an error processing availability check: ${JSON.stringify(error)}`); }
    };
}

function processNewBalanceEvent() {
    if (logs) { MDS.log("Processing new balance event"); }

    getListingsWithUnconfirmedCoins(function (listings) {
        if (logs) { MDS.log("Listings with unconfirmed coins: " + JSON.stringify(listings)); }

        //loop therough coins and check each one against the coins list returned by mds.cmd('coins')
        listings.forEach(function (listing) {
            if (logs) { MDS.log("Unconfirmed coin: " + JSON.stringify(listing.unconfirmed_coin_id)); }

            //check if a coin exists with this id
            MDS.cmd('coins coinid:' + listing.unconfirmed_coin_id, function (coin) {
                if (logs) { MDS.log("Coin: " + JSON.stringify(coin)); }
                coin = response[0];
                //confirm that the amount onf the listing equals the coin amount
                if (coin.amount === listing.price) {
                    //update the listing as sold
                    //remove the coin id from the listing
                    updateListing(listing.id, {
                        'unconfirmed_coin_id': null,
                        'coin_id': coin.coinid,
                        'status': 'sold',
                        'notification': 'true'
                    }, function (result) {
                    })
                }
            });
        });
    });
}

/*
*   Process a purchase receipt
*   @param {object} entity - the entity object
*/
function processPurchaseReceipt(entity) {
    var id = entity.listing_id;
    if (logs) { MDS.log(`Message received for purchased listing: ${JSON.stringify(entity)}`); }

    //get the listing
    getListingById(id, function (listing) {
        if (logs) { MDS.log(`Listing found: ${JSON.stringify(listing)}`); }
        //check coins for coin id
        if (logs) { MDS.log(`Coin id about to be checked: ${entity.coin_id}`); }
        getCoinById(entity.coin_id, function (coin) {
            if (coin) {
                if (logs) { MDS.log(`Coin amount: ${coin.amount}, listing price: ${listing.price}`); }
                //if the coin amount is the same as the listing price, update the listing
                if (coin.amount === listing.price) {
                    updateListing(id,
                        {
                            'buyer_message': entity.buyer_message,
                            'status': 'sold',
                            'coin_id': entity.coin_id,
                            'notification': 'true',
                            'buyer_name': entity.buyer_name
                        })
                } else if (coin.amount > listing.price) {
                    MDS.log(`Coin amount greater than listing price, coin value sent: ${coin.amount}, listing price: ${listing.price}`);
                } else {
                    MDS.log(`Coin amount less than listing price, coin value sent: ${coin.amount}, listing price: ${listing.price}`);
                }
            } else {
                //no coin found
                if (logs) { MDS.log(`No coin found for coin id: ${entity.coin_id}`); }
                //update listing with coin id sent from buyer
                updateListing(id, {
                    'unconfirmed_coin_id': entity.coin_id,
                    'buyer_name': entity.buyer_name,
                    'buyer_message': entity.buyer_message,
                });
            }
        }); //get coin
    }); //get listing
}


function processAvailabilityResponse(entity) {
    if (logs) { MDS.log(`processing availability response...${entity}`); }
    updateListing(entity.listing_id, { "status": entity.status });
}

function processCollectionConfirmation(entity) {
    if (logs) { MDS.log(`Message received for collection of listing, updating..`); }
    updateListing(id, {
        'buyer_message': entity.message,
        'status': 'sold',
        'notification': 'true',
        'transmission_type': entity.transmission_type,
        'buyer_name': entity.buyer_name
    });
}

function processCancelCollection(entity) {
    //TODO: rewrite function that updates the listing all at once instead of hitting database x times
    if (logs) { MDS.log(`Message received for cancelling collection`); }
    const listing = getListingById(entity.listing_id);
    if (listing.buyer_name === entity.buyer_name) {
        updateListing(entity.listing_id, { 'status': 'available' })
    } else {
        if (logs) { MDS.log("buyer name not the same as on listing so cancel averted!"); }
    }
}


/*
***************************************************** GET FUNCTIONS *****************************************************
*/
function getStatus(listingId) {
    var st = '';
    MDS.sql(`SELECT "status" FROM ${LISTINGSTABLE} WHERE "listing_id"='${listingId}';`, function (res) {
        if (res) {
            if (logs) { MDS.log(`Response from get status is: ${JSON.stringify(res)}`); }
            st = res.rows[0].status;
        }
        else {
            if (logs) { MDS.log(`MDS.SQL ERROR, could get status of listing ${res.error}`); }
        }
    });
    return st;
}

function getHost() {
    var host = '';
    MDS.sql(`select "pk", "name" FROM SETTINGS;`, function (res) {
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

function getMLS() {
    var mls = '';
    MDS.cmd('maxima', function (res) {
        if (logs) { MDS.log('Get MLS: ' + JSON.stringify(res)); }
        if (res.status) {
            mls = res.response.mls;
        } else {
            return Error(`Couldn't fetch maxima public key ${res.error}`);
        }
    })
    return mls;
}

function getPublicKey() {
    var pb = '';
    MDS.cmd('maxima', function (res) {
        if (logs) { MDS.log(JSON.stringify(res)); }
        if (res.status) {
            pb = res.response.publickey;
        } else {
            return Error(`Couldn't fetch maxima public key ${res.error}`);
        }
    })
    return pb;
}

function getMaximaContactName() {
    var mcn = '';
    MDS.cmd('maxima', function (res) {
        if (res.status) {
            mcn = res.response.name;
        } else {
            return Error(`Couldn't fetch maxima contact name ${res.error}`);
        }
    })
    return mcn;
}

/*
* Return all listings with unconfirmed coins
*/
function getListingsWithUnconfirmedCoins(callback) {
    if (logs) { MDS.log("Getting unconfirmed coins"); }
    MDS.sql("SELECT * FROM listing WHERE unconfirmed_coin_id IS NOT NULL", function (result) {
        if (result && callback) {
            callback(result);
        } else {
            callback([]);
            if (logs) { MDS.log("No unconfirmed coins found"); }
        }
    });
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
            "sent_by_pk" varchar(640),
            "sent_by_name" char(50),
            "created_at" int not null,
            "wallet_address" varchar(80) not null,
            "status" char(12) not null default 'available',
            "buyer_message" varchar(1000),
            "buyer_name" char(50),
            "buyer_pk" varchar(330),
            "purchase_code" varchar(30),
            "coin_id" varchar(80),
            "unconfirmed_coin_id" varchar(80) default null,
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
            "name" varchar(50),
            CONSTRAINT AK_name UNIQUE("name"),
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
function createHost(name, pk) {
    let fullsql = `insert into ${SETTINGSTABLE}("name", "pk") values('${name}', '${pk}');`;
    if (logs) { MDS.log(`Host added to settings table: ${name}`); }
    MDS.sql(fullsql, (res) => {
        if (res.status) {
            return true;
        } else {
            return Error(res.error);
        }
    });
}

function createListing({
    title,
    price,
    createdByPk,
    createdByName,
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
    const pk = getPublicKey();
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

function addUnconfirmedCoinColumn(callback) {
    const Q = `alter table ${LISTINGSTABLE} add column if not exists "unconfirmed_coin_id" varchar(80) default null;`;
    MDS.sql(Q, function (res) {
        if (logs) { MDS.log(`MDS.SQL, ${Q}`); }
        if (res.status) {
            callback(true)
        } else {
            callback(Error(`Adding unconfirmed_coin_id column to listing table ${res.error}`));
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
            return res;
        } else {
            if (logs) { MDS.log(`MDS.SQL ERROR, could get update listing ${res.error}`); }
            return false;
        }
    });
}

/*
**************************************************** MAXIMA ****************************************************
*/
function send(data, address) {

    //before sending append version number of application

    //Convert to a string..
    var datastr = JSON.stringify(data);
    MDS.log(datastr);
    var hexstr = "";
    const funcC = `convert from:String to:HEX data:'${String(datastr)}'`;
    if (logs) { MDS.log(funcC); }
    MDS.cmd(funcC, function (resp) {
        if (logs) { MDS.log(JSON.stringify(resp)); }
        hexstr = resp.response.conversion;
    });
    //And now convert to HEX
    //const hexstr = "0x" + utf8ToHex(datastr).toUpperCase().trim();

    //Create the function..
    let fullfunc = '';
    if (address.includes('@')) {
        fullfunc = `maxima action:send to:${address} poll:true application:${APPLICATION_NAME} data:${hexstr}`;
    } else {
        fullfunc = `maxima action:send publickey:${address} poll:true application:${APPLICATION_NAME} data:${hexstr}`;
    }

    //Send the message via Maxima!..
    MDS.cmd(fullfunc, function (resp) {
        if (resp.status === false) {
            if (logs) { MDS.log(JSON.stringify(resp)); }
            return false;
        } else if (resp.response.delivered === false) {
            if (logs) { MDS.log(JSON.stringify(resp)); }
            return false;
        } else if (resp.status === true) {
            return true;
        }
    });
}