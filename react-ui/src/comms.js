/*
    All functions that communicate via maxima are held in this file
*/
import {
    processListing,
    processPurchaseRequest,
    getListingById,
} from './database/listing';
import {
    utf8ToHex,
    hexToUtf8
} from './utils';
import {
    getHostStore
} from "./database/settings";

const APPLICATION_NAME = 'stampd';


export function sendListingToContacts(listingId) {
    return Promise.all([getListingById(listingId), getContacts(), getHostStore()])
        .then(function (result) {
            let listing = result[0];
            const contacts = result[1];
            const host = result[2];
            listing.version = '0.1';
            listing.type = 'listing';
            listing.sent_by_name = host.host_store_name;
            listing.sent_by_pk = host.host_store_pubkey;
            contacts.forEach((contact) => send(listing, contact));
        })
        .catch((e) => {
            console.error(e)
        });
}

/* takes data and sends it to a publickey address via maxima */
export function send(data, publickey) {
    return new Promise(function (resolve, reject) {

        //before sending append version number of application


        //Convert to a string..
        const datastr = JSON.stringify(data);

        //And now convert to HEX
        const hexstr = "0x" + utf8ToHex(datastr).toUpperCase().trim();

        //Create the function..
        const fullfunc = `maxima action:send publickey:${publickey} application:${APPLICATION_NAME} data:${hexstr}`;

        //Send the message via Maxima!..
        window.MDS.cmd(fullfunc, function (resp) {
            if (resp.status === false) {
                reject(resp.error);
                alert(resp.error);
                window.MDS.log(JSON.stringify(resp));
            } else if (resp.response.delivered === false) {
                reject(resp.response.error);
                alert(resp.response.error);
                window.MDS.log(JSON.stringify(resp));
            } else if (resp.status === true) {
                resolve(true);
            }
        });
    });
}

/*
    Returns an array of public keys of your contacts
    as this is how you send things to them via maxima
*/
export function getContacts() {

    return new Promise(function (resolve, reject) {
        getMaxContacts()
            .then((res) => {
                resolve(res.map((contact) => contact.publickey));
            })
            .catch((e) => reject(console.error(e)))
    });

}

function getMaxContacts() {
    return new Promise(function (resolve, reject) {
        //get contacts list from maxima
        window.MDS.cmd('maxcontacts', function (res) {
            if (res.status) {
                resolve(res.response.contacts);
            } else {
                reject(res.error);
            }
        })
    })
}

export function getMaximaContactName() {
    return new Promise(function (resolve, reject) {
        //get name from maxima
        window.MDS.cmd('maxima', function (res) {
            if (res.status) {
                resolve(res.response.name);
            } else {
                reject(res.error);
            }
        })
    })
}

export function getPublicKey() {
    return new Promise(function (resolve, reject) {
        //get contacts list from maxima
        window.MDS.cmd('maxima', function (res) {
            if (res.status) {
                resolve(res.response.publickey);
            } else {
                reject(res.error);
            }
        })
    })
}

export function processMaximaEvent(msg) {

    //Is it for us.. ?
    if (msg.data.application !== "stampd") {
        return;
    }

    //Who is this message from..
    //var pubkey = msg.data.from;

    //Get the data packet..
    var datastr = msg.data.data;
    if (datastr.startsWith("0x")) {
        datastr = datastr.substring(2);
    }

    //The JSON
    var jsonstr = hexToUtf8(datastr);

    //And create the actual JSON
    var entity = JSON.parse(jsonstr);

    //determine if you're receiving a store or a listing
    switch (entity.type) {
        case 'purchase_request':
            processPurchaseRequest(entity);
            break;
        case 'listing':
            processListing(entity);
            break;
        default:
            console.log(entity);
    }

}


export function sendMoney({
    walletAddress,
    amount
}) {
    const Q = `send tokenid:0x00 address:${walletAddress} amount:${amount}`;
    return new Promise(function (resolve, reject) {
        //get contacts list from maxima
        window.MDS.cmd(Q, function (res) {
            if (res.status) {
                resolve(res);
            } else if (res.message) {
                reject(res.message);
            } else {
                reject(JSON.stringify(res));
            }
        })
    })
}

export function sendPurchaseRequest({
    merchant,
    message,
    customerName,
    customerPk,
    createdAt,
}) {
    return new Promise(function (resolve, reject) {
        const data = {
            "type": "purchase_request",
            "created_at": createdAt,
            "customer_name": customerName,
            "customer_pk": customerPk,
            "message": message
        };
        send(data, merchant).then((res) => {
            resolve(res);
        }).catch(e => reject(e));
    });
}

export function sendMerchantConfirmation({customer, listingId}) {
    return new Promise(function (resolve, reject) {
        const data = {
            "type": "merchant_confirmation",
            "listing_id": listingId,
        };
        send(data, customer).then((res) => {
            resolve(res);
        }).catch(e => reject(e));
    });
}