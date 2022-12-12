/*
    All functions that communicate via maxima are held in this file
*/
import {
    createListing,
    getListingById,
} from './database/listing';
import {
    createStore,
    getStoreByPubkey
} from './database/store';
import {
    utf8ToHex,
    hexToUtf8
} from './utils';
import { getHostStore } from "./database/settings";

const APPLICATION_NAME = 'stampd';

export function sendStoreToContacts(storeId) {
    return Promise.all([getStoreByPubkey(storeId), getContacts()])
        .then(function (result) {
            console.log(result);
            let data = result[0];
            data.version = '0.1';
            data.type = 'store';
            const contacts = result[1];
            contacts.forEach((contact) => send(data, contact));
        })
        .catch((e) => {
            console.error(e)
        });
}


export function sendListingToContacts(listingId) {
    return Promise.all([getListingById(listingId), getContacts(), getHostStore()])
        .then(function (result) {
            let listing= result[0];
            const contacts = result[1];
            const host = result[2];
            listing.version = '0.1';
            listing.type = 'listing';
            listing.store_name = host.host_store_name;
            listing.store_pubkey = host.host_store_pubkey;
            contacts.forEach((contact) => send(listing, contact));
        })
        .catch((e) => {
            console.error(e)
        });
}

/* takes data and sends it to a publickey address via maxima */
export function send(data, publickey, storeId) {
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
        case 'store':
            createStore(entity.name, entity.store_pubkey)
                .then((res) => {
                    console.log(`Store ${entity.name} added!`);
                })
                .catch((e) => console.error(`Could not create store: ${e}`));
            break;
        case 'listing':
            //check if store exists if not create one
            getStoreByPubkey(entity.store_pubkey).then((res) => {
                if (res === 'No stores with that public key') {
                    createStore(entity.store_name, entity.store_pubkey)
                        .then((res) => {
                            console.log(`Store ${entity.store_name} added!`);
                            createListing(entity.name, entity.price, entity.category_id, entity.store_pubkey, entity.listing_id)
                                .then((res) => {
                                    console.log(`Listing ${entity.name} added!`);
                                }).catch((e) => console.error(`Could not create listing: ${e}`));
                        })
                        .catch((e) => console.error(`Could not create store: ${e}`));
                }
                else {
                    createListing(entity.name, entity.price, entity.category_id, entity.store_pubkey)
                        .then((res) => {
                            console.log(`Listing ${entity.name} added!`);
                        }).catch((e) => console.error(`Could not create listing: ${e}`));
                }
            }).catch((e) => new Error(`No stores or too many with that public key ${e}`));
            break;
        default:
            console.log(entity);
    }

}