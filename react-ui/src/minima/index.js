import PropTypes from 'prop-types';
import { getListingById } from '../database/listing';
import { utf8ToHex } from '../utils';
import { getHost } from "../database/settings";

import { APPLICATION_NAME } from '../constants';

//get server address env variable
const SERVER_ADDRESS = process.env.REACT_APP_DMAX_SERVER_ADDRESS;
const WALLET_ADDRESS = process.env.REACT_APP_DMAX_WALLET_ADDRESS;
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
                reject(false);
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
 * Send message via Maxima to contat address or permanent address
 * @param {*} message
 * @param {*} address
 * @param {*} callback
 */
export function sendMaximaMessage(message, address, callback) {
    window.MDS.log("Sending message to " + address);
    var maxcmd = "maxima action:send poll:true to:" + address + " application:dmax data:" + JSON.stringify(message);
    window.MDS.log(maxcmd);
    window.MDS.cmd(maxcmd, function (msg) {
        window.MDS.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
        }
    });
}

/**
* Called when form is submitted
* @param amount
*/

export async function handleDmaxClientSubmit(amount) {
/*
    ///get the clients contact address
    getContactAddress(function (address) {

        //create p2pidentity request
        sendMaximaMessage({ "type": "P2P_REQUEST", "data": { "amount": amount, "contact": address } }, SERVER_ADDRESS, function (msg) {
            window.MDS.log("Sent P2P request to " + SERVER_ADDRESS);

            //remove the form from the UI and replace with a message
            document.getElementById("js-main").innerHTML = "Your request has been sent to the MLS server. Please wait for confirmation.";
        });
    });

*/
//test transaction function
const txnName = 'dmax-client-transaction'
let txnValue = 1;
let inputCoins = [];
var changeWallet = await getMiniAddress();

    createTransaction(txnName, function(msg) {
        console.log(JSON.stringify(msg));
        console.log("Created transaction " + txnName);
        //get all sendable coins
        getSendableCoins(function (coins) {
            console.log("Got sendable coins");
            console.log(JSON.stringify(coins));
            //loop through the coins and find the first one that is greater than the transaction value
            for (var i = 0; i < coins.length; i++) {
                if (coins[i].value > txnValue) {
                    //add coin to inputCoins
                    inputCoins.push(coins[i].coinid);
                }
            }
            //if inputCoin is empty then loop through the coins again and find two coins that add up to or are greater than the transaction value
            if (inputCoins === []) {
                for (var i = 0; i < coins.length; i++) {
                    for (var j = 0; j < coins.length; j++) {
                        if (coins[i].value + coins[j].value > txnValue) {
                            //add coin to inputCoins
                            inputCoins.push(coins[i].coinid);
                            inputCoins.push(coins[j].coinid);
                            //break out of the loop
                            break;
                        }
                    }
                }
            }

            let inputCoinsValue = 0;
            //loop thropugh the inputCoins and add them to the transaction
            for (var i = 0; i < inputCoins.length; i++) {
                addInputToTransaction(txnName, inputCoins[i], function (msg) {
                    console.log(JSON.stringify(msg));
                });
                //add the value of the inputCoins to inputCoinsValue
                inputCoinsValue += inputCoins[i].amount;
            }
            //add the outputs to the transaction
            addOutputToTransaction(txnName, WALLET_ADDRESS, txnValue, function (msg) {
                console.log(JSON.stringify(msg));
                addOutputToTransaction(txnName, changeWallet, inputCoinsValue - txnValue, function (msg) {
                    console.log(JSON.stringify(msg));
                    //sign the transaction
                    signTransaction(txnName, function (msg) {
                        console.log(JSON.stringify(msg));
                        //add coin proof to transaction
                        addCoinProofToTransaction(txnName, function (msg) {
                            console.log(JSON.stringify(msg));
                            //send the transaction
                            sendTransaction(txnName, function (msg) {
                                console.log(JSON.stringify(msg));
                            });
                        });
                    });
                });
            });
        });
    });
}

function sendTransaction(name, callback) {
    console.log("Sending transaction " + name);
    var maxcmd = "txnpost id:" + name;
    console.log(maxcmd);
    window.MDS.cmd(maxcmd, function (msg) {
        console.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
        }
    });
}

function addCoinProofToTransaction(name, callback) {
    console.log("Adding coin proof to transaction " + name);
    var maxcmd = "txnbasics id:" + name;
    console.log(maxcmd);
    window.MDS.cmd(maxcmd, function (msg) {
        console.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
        }
    });
}

function signTransaction(name, callback) {
    console.log("Signing transaction " + name + " publickey:auto");
    var maxcmd = "txnsign id:" + name + " publickey:auto";
    console.log(maxcmd);
    window.MDS.cmd(maxcmd, function (msg) {
        console.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
        }
    });
}

function addOutputToTransaction(name, address, value, callback) {
    console.log("Adding output " + address + " to transaction " + name);
    var maxcmd = "txnoutput id:" + name + " address:" + address + " amount:" + value;
    console.log(maxcmd);
    window.MDS.cmd(maxcmd, function (msg) {
        console.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
        }
    });
}


function addInputToTransaction(name, inputCoin, callback) {
    console.log("Adding input " + inputCoin + " to transaction " + name);
    var maxcmd = "txninput id:" + name + " coinid:" + inputCoin;
    console.log(maxcmd);
    window.MDS.cmd(maxcmd, function (msg) {
        console.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
        }
    });
}

function createTransaction(name, callback) {
    console.log("Creating transaction " + name);
    var maxcmd = "txncreate id:" + name;
    console.log(maxcmd);
    window.MDS.cmd(maxcmd, function (msg) {
        console.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
        }
    });
}

function getSendableCoins(callback) {
    console.log("Getting sendable coins");
    var maxcmd = "coins sendable:true";
    window.MDS.cmd(maxcmd, function (msg) {
        console.log(JSON.stringify(msg));
        if (callback) {
            callback(msg.response);
        }
    });
}



/**
* Get Contact Address
* @param {*} callback
*/
export function getContactAddress(callback) {
    var maxcmd = "maxima";
    window.MDS.cmd(maxcmd, function (msg) {
        console.log(`Get Contact Address: ${JSON.stringify(msg)}`);
        if (callback) {
            console.log(`Contact Address: ${msg.response.contact}`);
            callback(msg.response.contact);
        }
    });
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
        if (address.includes('@')) {
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
    listingId,
    password = "" // Add a default value for password
}) {
    // Include the password in the command string if it's not empty
    const passwordPart = password ? `password:${password}` : "";
    const Q = `send tokenid:0x00 address:${walletAddress} amount:${amount} ${passwordPart} state:{"0":"[${listingId}]"}`;
    return new Promise(function (resolve, reject) {
        //get contacts list from maxima
        window.MDS.cmd(Q, function (res) {
            if (res.status === true) {
                console.log(`sent ${amount} to ${walletAddress} with state code ${listingId} succesfully!`);
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

/*
* Adds a contact to the users contact list
* @param {string} address - The address to add to the contact list
*/
export function addContact(address) {
    var msg = "";
    var status = false;
    return new Promise(function (resolve, reject) {
        const query = `maxcontacts action:add contact:${address}`;
        window.MDS.cmd(query, function (res) {
            if (res.status === true) {
                msg = "Successfully added contact"
                status = true;
                resolve({ msg, status });
            } else {
                msg = res.error;
                status = false;
                reject({ msg, status })
            }
        })
    })
}

export function unlockValut(pswd) {
    return new Promise(function (resolve, reject) {
        try {
            window.MDS.cmd(`vault action:passwordunlock password:${pswd}`, function (res) {
                console.log(res);
                if (res.status) {
                    resolve(res.response.status);
                    console.log(`vault status: ${res.response.locked}`);
                } else {
                    reject(res.error);
                }
            })
        } catch (e) {
            reject(Error(e));
        }
    })
}

export async function isContactByName(adrs) {
    const contacts = await getMaxContacts();
    var found = false;
    for (const contact of contacts) {
        if (contact.extradata.name === adrs) {
            found = true;
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