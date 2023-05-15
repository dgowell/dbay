import PropTypes from 'prop-types';
import {
    processListing,
    getListingById,
} from '../database/listing';
import { utf8ToHex, hexToUtf8 } from '../utils';
import { getHost } from "../database/settings";

import { APPLICATION_NAME } from '../constants';
import { processAvailabilityResponse } from './buyer-processes';
import {
    processAvailabilityCheck,
    processPurchaseReceipt,
    processCollectionConfirmation,
    processCancelCollection
} from './seller-processes';


/**
* Sorts out what type of message has been receieved
* @param {object} msg - Receieved Message Object
*/
export function processMaximaEvent(msg) {

    //Is it for us.. ?
    if (msg.data.application !== "stampd") {
        return;
    }

    //Get the data packet..
    var datastr = msg.data.data;
    if (datastr.startsWith("0x")) {
        datastr = datastr.substring(2);
    }

    //The JSON
    var jsonstr = hexToUtf8(datastr);
    //And create the actual JSON
    var entity = JSON.parse(jsonstr.replace(/'/g, ""));

    //determine what type of message you're receiving
    switch (entity.type) {
        case 'availability_check':
            //buyer checks listing availability with seller
            //processAvailabilityCheck(entity);
            break;
        case 'availability_response':
            //seller sends status of listing to buyer
            //processAvailabilityResponse(entity);
            break;
        case 'listing':
            //a contact has shared a listing with you
            //processListing(entity);
            break;
        case 'purchase_receipt':
            //buyer sends seller their address and coin id
            //processPurchaseReceipt(entity);
            break;
        case 'collection_confirmation':
            //buyer sends seller their number to arrange collection
            //processCollectionConfirmation(entity);
            break;
        case 'cancel_collection':
            //buyer sends seller their number to arrange collection
            //processCancelCollection(entity);
            break;
        default:
            console.log(entity);
    }

}
processMaximaEvent.prototype = {
    msg: PropTypes.object.isRequired
}


/**
* Fetches publickeys of your maxima contacts
*/
export function getContacts() {
    return new Promise(function (resolve, reject) {
        getMaxContacts()
            .then((res) => {
                resolve(res.map((contact) => contact.publickey));
            })
            .catch((e) => reject(Error(`Couldn't fetch public keys of max contacts ${e}`)));
    });
}

/*
*   Gets the current MLS of the node and returns it
*/
export function getMLS() {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('maxima', function (res) {
            if (res.status) {
                resolve(res.response.mls);
            } else {
                reject(Error(`Couldn't fetch mls ${res.error}`));
            }
        })
    })
}


/**
* Fetches a list of maxima contacts
*/
function getMaxContacts() {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('maxcontacts', function (res) {
            if (res.status && res.response.contacts) {
                resolve(res.response.contacts);
            } else {
                reject(Error(`Couldn't fetch list of maxima contacts ${res.error}`));
            }
        })
    })
}
/**
* Fetches maxima contact name
*/
export function getMaximaContactName() {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('maxima', function (res) {
            if (res.status) {
                resolve(res.response.name);
            } else {
                reject(Error(`Couldn't fetch maxima contact name ${res.error}`));
            }
        })
    })
}


/**
* Checks maxcontacts against contact name and returns contact address if found
*/
export function isContact(pk) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('maxcontacts', function (res) {
            if (res.status) {
                const contacts = res.response.contacts;
                contacts.forEach((c) => {
                    if (pk === c.publickey) {
                        console.log("this is one of your contacts");
                        resolve(c.currentaddress);
                    }
                })
                resolve(false);
            } else {
                reject(Error(`Couldn't find a matching name ${res.error}`));
            }
        })
    })
}

/**
* Fetches maxima contact address
*/
export function getMaximaContactAddress() {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('maxima', function (res) {
            if (res.status) {
                resolve(res.response.contact);
            } else {
                reject(Error(`Couldn't fetch maxima contact name ${res.error}`));
            }
        })
    })
}
/**
* Fetches maxima public key
*/
export function getPublicKey() {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('maxima', function (res) {
            if (res.status) {
                resolve(res.response.publickey);
            } else {
                reject(Error(`Couldn't fetch maxima public key ${res.error}`));
            }
        })
    })
}

/*
*   Fetches miniaddress MX...
*/
export function getMiniAddress() {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('getaddress', function (res) {
            if (res.status) {
                resolve(res.response.miniaddress);
                console.log(`getaddress: ${res.response.miniaddress}`);
            } else {
                reject(Error(`Couldn't fetch mini address ${res.error}`));
            }
        })
    })
}




/**
* Send listing to all contacts
* @param {string} lsitingId - The Id of the listing
*/
export async function sendListingToContacts(listingId) {

    let listing = await getListingById(listingId);
    const contacts = await getContacts();
    const host = await getHost();
    console.log("contacts", contacts);
    listing.version = '0.1';
    listing.type = 'listing';
    listing.sent_by_name = host.name;
    listing.sent_by_pk = host.pk;

    return new Promise(function (resolve, reject) {
        if (contacts.length === 0) {
            reject(Error('No contacts to send to'));
        }
        //send the listing to each contact
        contacts.forEach(function (contact, key, arr) {
            send(listing, contact)
                .then(function (result) {
                    if (result === true) {
                        console.log(`Successfully sent to ${contact}`);
                    }
                })
                .catch((e) => {
                    reject(Error(`Couldn't send listing to a ${contact} ${e}`));
                });
            //if it's the last item resolve it
            if (Object.is(arr.length - 1, key)) {
                resolve(true);
            }
        })
    });
}
sendListingToContacts.propTypes = {
    listingId: PropTypes.string.isRequired
}


/**
* Get's sellers current public key using permanent address
* @param {string} permanentAddress - The seller permanent address MAX#<pk>#<mls>
*/
export function getSellersPubKey(permanentAddress) {
    return new Promise(function (resolve, reject) {
        const func = `maxextra action:getaddress maxaddress:${permanentAddress}`;
        console.log(func);
        //Send the message via Maxima!..
        window.MDS.cmd(func, function (resp) {
            if (resp.status === false) {
                reject(resp.error);
                console.error(resp.error);
                window.MDS.log(JSON.stringify(resp));
            } else if (resp.response.success === false) {
                reject(resp.response.error);
                console.error(resp.response.error);
                window.MDS.log(JSON.stringify(resp));
            } else if (resp.status === true) {
                resolve(resp.response.mlsresponse.publickey);
            }
        });
    });
}


/**
* Get's sellers current contact address using permanent address
* @param {string} permanentAddress - The seller permanent address MAX#<pk>#<mls>
*/
export function getSellersAddress(permanentAddress) {
    return new Promise(function (resolve, reject) {
        const func = `maxextra action:getaddress maxaddress:${permanentAddress}`;
        //Send the message via Maxima!..
        window.MDS.cmd(func, function (resp) {
            if (resp.status === false) {
                reject(resp.error);
                console.error(resp.error);
                window.MDS.log(JSON.stringify(resp));
            } else if (resp.response.success === false) {
                reject(resp.response.error ? resp.response.error : false );
                console.error(resp.response.error ? resp.response.error : false);
                window.MDS.log(JSON.stringify(resp));
            } else if (resp.status === true) {
                resolve(resp.response.mlsresponse.address);
            }
        });
    });
}

/**
* Sends data to a publickey address via maxima
* @param {string} data - The data to send
* @param {string} address - Either public key or contact address
*/
export function send(data, address) {
    return new Promise(async function (resolve, reject) {

        //before sending append version number of application


        //Convert to a string..
        const datastr = JSON.stringify(data);

        //And now convert to HEX
        const hexstr = "0x" + utf8ToHex(datastr).toUpperCase().trim();

        //Create the function..
        let fullfunc = '';
        console.log(`Heres the address we'll send to: ${address}`);
        if (address.includes('@')){
            fullfunc = `maxima action:send to:${address} application:${APPLICATION_NAME} data:${hexstr}`;
        } else {
            fullfunc = `maxima action:send publickey:${address} application:${APPLICATION_NAME} data:${hexstr}`;
        }

        //Send the message via Maxima!..
        window.MDS.cmd(fullfunc, function (resp) {
            if (resp.status === false) {
                reject(resp.error);
                console.error(resp.error);
                window.MDS.log(JSON.stringify(resp));
            } else if (resp.response.delivered === false) {
                reject(resp.response.error);
                console.error(resp.response.error);
                window.MDS.log(JSON.stringify(resp));
            } else if (resp.status === true) {
                console.log(`Sent to ${address}`);
                resolve(true);
            }
        });
    });
}
send.propTypes = {
    data: PropTypes.string.isRequired,
    publickey: PropTypes.string.isRequired
}

/**
* Sends an amount of Minima to a wallet address via maxima and adds an identifier purchase code variable
* @param {string} walletAddress - Hex wallet address the minima is going to
* @param {string} amount - Amount of minim to send
* @param {string} purchaseCode - Unique code given from seller
*/
export function sendMoney({
    walletAddress,
    amount,
    purchaseCode,
    password = "" // Add a default value for password
}) {
    // Include the password in the command string if it's not empty
    const passwordPart = password ? `password:${password}` : "";
    const Q = `send tokenid:0x00 address:${walletAddress} amount:${amount} ${passwordPart} state:{"0":"[${purchaseCode}]"}`;
    return new Promise(function (resolve, reject) {
        //get contacts list from maxima
        window.MDS.cmd(Q, function (res) {
            if (res.status === true) {
                console.log(`sent ${amount} to ${walletAddress} with state code ${purchaseCode} succesfully!`);
                const coinId = res.response.body.txn.outputs[0].coinid;
                coinId ? resolve(coinId) : reject(Error(`No coin attached to purchase`));
            } else if (res.message) {
                reject(Error(`Problem sending money: ${res.message}`));
                window.MDS.log(`Problem sending money: ${res.message}`);
            } else if (res.error) {
                reject(Error(`Problem sending money: ${res.error}`));
                window.MDS.log(`Problem sending money: ${res.eror}`);
            } else {
                reject(Error(`Problem sending money: ${res}`));
                window.MDS.log(`Problem sending money: ${res}`);
            }
        })
    })
}

export function addContact(max){
    var msg="";
    var status=false;
    return new Promise(function(resolve,reject){
        const fullFunc = `maxextra action:getaddress maxaddress:${max}`;
        window.MDS.cmd(fullFunc, function (res){
            if(res.status===true){
                const addCnt = `maxcontacts action:add contact:${res.response.mlsresponse.address}`;
                window.MDS.cmd(addCnt,function (res){
                    if(res.status===true){
                        msg="Successfully added contact"
                        status=true;
                        resolve({msg,status});
                    }else{
                        msg="Unable to add contact, something went wrong";
                        status=false;
                        reject({msg,status})
                    }
                })
            }else{
                msg="Unable to add contact, something went wrong";
                status=false;
                reject({msg,status})
            }
        })

    })

}


export function checkVault() {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('vault', function (res) {
            if (res.status) {
                resolve(res.response.locked);
                console.log(`vault Locked: ${res.response.locked}`);
            } else {
                reject(Error(`Couldn't fetch mini address ${res.error}`));
            }
        })
    })
}

export function unlockValut(pswd) {
    return new Promise(function (resolve, reject) {
        try{
        window.MDS.cmd(`vault action:passwordunlock password:${pswd}`, function (res) {
            console.log(res);
            if (res.status) {
                resolve(res.response.status);
                console.log(`vault status: ${res.response.locked}`);
            } else {
                reject(res.error);
            }
        })
        }catch(e){
            reject(Error(e));
        }
    })
}

export async function isContactByName(adrs){
    const contacts = await getMaxContacts();
    var found=false;
    for(const contact of contacts){
        if(contact.extradata.name==adrs){
            found=true;
            break;
        }
    }
    return found;
}

sendMoney.propTypes = {
    walletAddress: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    purchaseCode: PropTypes.string.isRequired
}