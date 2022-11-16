/*
    All functions that communicate via maxima are held in this file
*/
import {
    createListing,
    getListingById,
    getStoreById
} from './db';
import {
    utf8ToHex,
    hexToUtf8
} from './utils';
const APPLICATION_NAME = 'stampd';

export function sendStoreToContacts(storeId) {
    return Promise.all([getStoreById(storeId), getContacts()])
        .then(function (result) {
            console.log(result);
            const store = result[0];
            const contacts = result[1];
            contacts.forEach((contact) => send(store, contact));
        })
        .catch((e) => {
            console.error(e)
        });
}


export function sendListingToContacts(listingId) {
    return Promise.all([getListingById(listingId), getContacts()])
        .then(function (result) {
            console.log(result);
            const listing = result[0];
            const contacts = result[1];
            contacts.forEach((contact) => send(listing, contact));
        })
        .catch((e) => {
            console.error(e)
        });
}

/* takes data and sends it to a publickey address via maxima */
export function send(data, publickey) {
    return new Promise(function (resolve, reject) {

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
            .catch((e) => console.error(e))
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

export function processMaximaEvent(msg) {

    //Is it for us.. ?
    if (msg.data.application !== "stampd") {
        return;
    }

    //Who is this message from..
    var pubkey = msg.data.from;

    //Get the data packet..
    var datastr = msg.data.data;
    if (datastr.startsWith("0x")) {
        datastr = datastr.substring(2);
    }

    //The JSON
    var jsonstr = hexToUtf8(datastr);

    //And create the actual JSON
    var maxjson = JSON.parse(jsonstr);

    //save to database
    createListing(maxjson.name, maxjson.price)
        .then((res) => {
                console.log(`Listing ${maxjson.name} added!`);
        })

}