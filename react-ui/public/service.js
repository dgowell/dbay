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
            MDS.log("MAXIMA EVENT received: " + JSON.stringify(msg.data));
            processMaximaEvent(msg);
            break;
        case "MINING":
            //check coins against unconfirmed/pending payemnts
            MDS.log("MINING EVENT received: " + JSON.stringify(msg.data));
            processMiningEvent(msg.data);
            break;
        default:
            MDS.log(JSON.stringify(msg));
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
    createListingTable();
    if (logs) { MDS.log('Listing table created or exists') }

    //add location description column
    addLocationDescriptionColumn(function (result) {
        if (logs) { MDS.log('Added location description Column: ' + result) }
    });

    //create settings table
    createSettingsTable();
    if (logs) {
        MDS.log('Settings table created or exists');
        MDS.log(hostName);
    }

    //check if store exists
    createHost(hostName, permanentAddress);
    if (logs) { MDS.log('Local hosting info stored in database') }
}

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
            MDS.log(entity);
    }

}

/*
* Check coins for unconfirmed payments
*/
function processMiningEvent(data) {

    MDS.log("Checking for unconfirmed payments");
    var txn = data.txpow.body.txn;
    var listingId = txn.state[0].data;

    //remove the square brackets int he listingID string
    listingId = listingId.substring(1, listingId.length - 1);

    var outputs = txn.outputs;
    var coinId = '';


    getListingById(listingId, function (listing) {
        MDS.log("listing:" + JSON.stringify(listing));


        //loop through the outputs and check which amount equals the listing.price;
        for (var x = 0; x < outputs.length; x++) {
            var output = outputs[x];
            var amount = output.amount;
            MDS.log("amount:" + amount);
            if (amount === listing.price) {
                MDS.log("amount matches listing price");
                coinId = output.coinid;
                MDS.log("coin id:" + coinId);
            }
        }

        //send listingId and coinid to seller
        var data = {
            "type": "purchase_receipt",
            "listing_id": listingId,
            "coin_id": coinId
        }

        MDS.log("sending purchase receipt to seller at: " + listing.created_by_pk);
        send(data, listing.created_by_pk);
    });
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
        MDS.log(`There was an error processing availability check: ${error}`);
    };
}

function getStatus(listingId) {
    var st = '';
    MDS.sql(`SELECT "status" FROM ${LISTINGSTABLE} WHERE "listing_id"='${listingId}';`, function (res) {
        if (res) {
            MDS.log(`Response from get status is: ${JSON.stringify(res)}`);
            st = res.rows[0].status;
        }
        else {
            MDS.log(`MDS.SQL ERROR, could get status of listing ${res.error}`);
        }
    });
    return st;
}


function send(data, address) {

    //before sending append version number of application

    //Convert to a string..
    var datastr = JSON.stringify(data);
    MDS.log(datastr);
    var hexstr = "";
    const funcC = `convert from:String to:HEX data:'${String(datastr)}'`;
    MDS.log(funcC);
    MDS.cmd(funcC, function (resp) {
        MDS.log(JSON.stringify(resp));
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
            MDS.log(JSON.stringify(resp));
            return false;
        } else if (resp.response.delivered === false) {
            MDS.log(JSON.stringify(resp));
            return false;
        } else if (resp.status === true) {
            return true;
        }
    });
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
            MDS.log(`MDS.SQL ERROR, could get update listing ${res.error}`);
            return false;
        }
    });
}

function processAvailabilityResponse(entity) {
    MDS.log(`processing availability response...${entity}`);
    updateListing(entity.listing_id, { "status": entity.status });
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
    MDS.log(`the id for the listing is: ${id}`);
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
        MDS.log(`MDS.SQL, ${fullsql}`);
        if (res.status) {
            return listingId ? listingId : id;
        } else {
            MDS.log(`MDS.SQL ERROR, could not create listing ${res.error}}`);
            return Error(res.error);
        }
    });
}

function addLocationDescriptionColumn(callback) {
    const Q = `alter table ${LISTINGSTABLE} add column if not exists "location_description" varchar(150);`;
    MDS.sql(Q, function (res) {
        MDS.log(`MDS.SQL, ${Q}`);
        if (res.status) {
            callback(true)
        } else {
            callback(Error(`Adding location_description column to listing table ${res.error}`));
        }
    })
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
    MDS.log(`Listing ${entity.title} added!`);
}

function processPurchaseReceipt(entity) {
    //TODO: rewrite function that updates the listing all at once instead of hitting database x times
    var id = entity.listing_id;
    MDS.log(`Message received for purchased listing, updating..`);
    if (entity.transmission_type === 'delivery') {
        updateListing(id,
            {
                'buyer_message': entity.buyer_message,
                'status': 'sold'
            })
    } else {
        updateListing(id, { 'status': 'completed' })
    }
    updateListing(id, {
        'coin_id': entity.coin_id,
        'notification': 'true',
        'transmission_type': entity.transmission_type,
        'buyer_name': entity.buyer_name
    })
}
function processCollectionConfirmation(entity) {
    MDS.log(`Message received for collection of listing, updating..`);
    updateListing(id, {
        'buyer_message': entity.message,
        'status': 'sold',
        'notification': 'true',
        'transmission_type': entity.transmission_type,
        'buyer_name': entity.buyer_name
    });
}
function getListingById(id, callback) {
    var listings = '';
    MDS.sql(`SELECT * FROM ${LISTINGSTABLE} WHERE "listing_id"='${id}';`, function (res) {
        if (res.status) {
            if (res.count > 1) {
                MDS.log(`More than one listing with id ${id}`);
                return null;
            } else {
                if (callback) {
                    callback(res.rows[0]);
                } else {
                    listings = res.rows[0];
                }
            }
        } else {
            MDS.log(`MDS.SQL ERROR, could get listing by Id ${res.error}`);
            return null;
        }
    });
    return listings;
}

function processCancelCollection(entity) {
    //TODO: rewrite function that updates the listing all at once instead of hitting database x times
    MDS.log(`Message received for cancelling collection`);
    const listing = getListingById(entity.listing_id);
    if (listing.buyer_name === entity.buyer_name) {
        updateListing(entity.listing_id, { 'status': 'available' })
    } else {
        MDS.log("buyer name not the same as on listing so cancel averted!");
    }
}

function getMLS() {
    var mls = '';
    MDS.cmd('maxima', function (res) {
        MDS.log(JSON.stringify(res));
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
        MDS.log(JSON.stringify(res));
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

function createListingTable() {
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
        MDS.log(`MDS.SQL, ${Q}`);
        if (res.status) {
            return true;
        } else {
            return Error(`Creating listing tables ${res.error}`);
        }
    })
}
function createSettingsTable() {
    const Q = `create table if not exists ${SETTINGSTABLE} (
            "pk" varchar(640),
            "name" varchar(50),
            CONSTRAINT AK_name UNIQUE("name"),
            CONSTRAINT AK_pk UNIQUE("pk")
            )`;

    MDS.sql(Q, function (res) {
        MDS.log(`MDS.SQL, ${Q}`);
        if (res.status) {
            return true;
        } else {
            return Error(`${res.error}`);
        }
    })
}
function createHost(name, pk) {
    let fullsql = `insert into ${SETTINGSTABLE}("name", "pk") values('${name}', '${pk}');`;
    MDS.log(`Host added to settings table: ${name}`);
    MDS.sql(fullsql, (res) => {
        if (res.status) {
            return true;
        } else {
            return Error(res.error);
        }
    });
}
