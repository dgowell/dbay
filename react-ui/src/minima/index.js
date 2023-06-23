import PropTypes from 'prop-types';
import { getListingById } from '../database/listing';
import { utf8ToHex } from '../utils';
import { getHost } from "../database/settings";

import { APPLICATION_NAME } from '../constants';
import { createPendingTransaction } from '../database/transaction';

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
isContact.propTypes = {
    pk: PropTypes.string.isRequired
};

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
 * Send message via Maxima to contact address or permanent address
 * @param {*} message
 * @param {*} address
 * @param {*} callback
 */
export function sendMessage({ data, address, app, callback }) {
    window.MDS.log("Sending message to " + address);
    const formatAddress = address.includes('MAX') || address.includes('Mx') ? `to:${address}` : `publickey:${address}`;
    var maxcmd = "maxima action:send poll:true " + formatAddress + " application:" + app + " data:" + JSON.stringify(data);
    window.MDS.log(maxcmd);
    window.MDS.cmd(maxcmd, function (msg) {
        window.MDS.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
        }
    });
}
sendMessage.propTypes = {
    data: PropTypes.object.isRequired,
    address: PropTypes.string.isRequired,
    app: PropTypes.string.isRequired,
    callback: PropTypes.func
};



/*
* Send request to server for p2p identity
*
*/
export function sendP2PIdentityRequest(callback) {
    ///get the clients contact address
    getContactAddress(function (clientAddress) {

        const data = { "type": "P2P_REQUEST", "data": { "contact": clientAddress } };
        const address = SERVER_ADDRESS;
        const app = 'dmax';

        //create p2pidentity request
        sendMessage({
            data, address, app, function(msg) {
                window.MDS.log("Sent P2P request to " + address);
            }
        });
        callback(true)
    });
}
sendP2PIdentityRequest.propTypes = {
    callback: PropTypes.func.isRequired
};

/*
* Set Static MLS
* @param {*} callback
*/
function setStaticMLS(p2pidentity, callback) {
    window.MDS.log("Setting static MLS to " + p2pidentity);
    var maxcmd = `maxextra action:staticmls host:${p2pidentity}`;
    window.MDS.cmd(maxcmd, function (msg) {
        window.MDS.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
        }

    });
}
setStaticMLS.propTypes = {
    p2pidentity: PropTypes.string.isRequired,
    callback: PropTypes.func
};

/**
 * Send minima to address
 * @param {*} amount
 * @param {*} address
 * @param {*} callback
 * @returns coin data
 */
function sendMinima({ amount, address, password, purchaseCode, callback }) {
    const passwordPart = password ? `password:${password}` : "";
    const purchaseCodePart = purchaseCode ? `state:{"99":"[${purchaseCode}]"}` : "";
    var maxcmd = `send address:${address} amount:${amount} ${passwordPart} ${purchaseCodePart}`;
    window.MDS.cmd(maxcmd, function (msg) {
        window.MDS.log(`sendMinima function response: ${JSON.stringify(msg)}`);
        debugger;
        if (callback) {
            //return the coinid
            if (msg.status) {
                console.log("success");
                window.MDS.log(`coinid returned: ${JSON.stringify(msg.response.body.txn.outputs[0].coinid)}`);
                callback(msg.response.body.txn.outputs[0].coinid);
            } else if (msg.pending) {
                console.log("pending transaction");
                createPendingTransaction({
                    pendinguid: msg.pendinguid,
                    amount,
                    purchaseCode, function(response, error) {
                        window.MDS.log(`createPendingTranasction returned: ${JSON.stringify(response, error)}`);
                    }
                });
                callback(false, msg.error);
            } else {
                console.log("error");
                window.MDS.log(msg.error);
                callback(false, msg.error);
            }
        }
    });
}
sendMinima.propTypes = {
    amount: PropTypes.number.isRequired,
    address: PropTypes.string.isRequired,
    password: PropTypes.string,
    purchaseCode: PropTypes.string,
    callback: PropTypes.func
};




/*
* Generate a random code of given length
* @param {*} length
*/
function generateCode(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
generateCode.propTypes = {
    length: PropTypes.number.isRequired
};

/**
* Called when form is submitted
* @param amount
*/

export async function handleDmaxClientSubmit(values, p2pIdentity, callback) {
    console.log(values);

    //set the static MLS
    setStaticMLS(p2pIdentity, function (resp) {
        window.MDS.log("Set static MLS");

        let purchaseCode = generateCode(10);

        //send amount of money to the server wallet
        sendMinima({
            amount: values.amount,
            address: WALLET_ADDRESS,
            password: values.password,
            purchaseCode,
            callback: function(coinId, error) {
                if (error) {
                    window.MDS.log("Error sending Minima: " + error);
                    //update frontend document with error
                    callback(false, error);
                    return;
                }

                //if no error, send minima to server

                window.MDS.log("Sent Minima");
                //coinID is returned

                //get the client public key
                getPublicKey(function (clientPK) {
                    window.MDS.log("Got public key");

                    //send via maxima coinID, clientPK
                    sendMessage({
                        data: {
                            "type": "PAY_CONFIRM",
                            "data": {
                                "status": "OK",
                                "coin_id": coinId,
                                "client_pk": clientPK,
                                "amount": values.amount,
                                "purchase_code": purchaseCode
                            }
                        },
                        address: SERVER_ADDRESS, 
                        app: "dmax", function(msg) {
                            window.MDS.log("Sent response to " + SERVER_ADDRESS);
                            if (callback) {
                                callback(msg);
                            }
                        }
                    });
                });
            }
        });
    });

}
handleDmaxClientSubmit.propTypes = {
    values: PropTypes.object.isRequired,
    p2pIdentity: PropTypes.string.isRequired,
    callback: PropTypes.func
};


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
    const name = await getMaximaContactName();
    console.log("contacts", contacts);
    listing.version = '0.1';
    listing.type = 'listing';
    listing.sent_by_name = name;
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
            fullfunc = `maxima action:send poll:true to:${address} application:${APPLICATION_NAME} data:${hexstr}`;
        } else {
            fullfunc = `maxima action:send poll:true publickey:${address} application:${APPLICATION_NAME} data:${hexstr}`;
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
}, callback) {
    // Include the password in the command string if it's not empty
    const passwordPart = password ? `password:${password}` : "";
    const Q = `send tokenid:0x00 address:${walletAddress} amount:${amount} ${passwordPart} state:{"99":"[${purchaseCode}]"}`;
    //get contacts list from maxima
    window.MDS.cmd(Q, function (res) {
        if (callback) {
            callback(res);
        }
    });
}
sendMoney.propTypes = {
    walletAddress: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
    purchaseCode: PropTypes.string.isRequired,
    password: PropTypes.string
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

export function getMaximaInfo(callback) {
    var maxcmd = "maxima";
    window.MDS.cmd(maxcmd, function (msg) {
        window.MDS.log(JSON.stringify(msg));
        if (callback) {
            callback(msg.response);
        }
        callback(false);
    });
}

export function getPermanentAddress(callback) {
    var maxcmd = "maxima";
    window.MDS.cmd(maxcmd, function (res) {
        console.log(`Get Creator Address: ${JSON.stringify(res)}`);
        if (res.status === true) {
            const maxima = res.response;
            if (maxima.staticmls === true) {
                //consturct the perm address from the public key and mls
                const permAddress = `MAX#${maxima.publickey}#${maxima.mls}`;
                const cmd = `maxextra action:getaddress maxaddress:${permAddress}`;
                window.MDS.cmd(cmd, function (maxextra) {
                    if (maxextra.status === true && maxextra.response.success === true) {
                        callback(permAddress);
                    } else {
                        callback(false);
                    }
                });
            } else {
                callback(false);
            }
        } else {
            console.error(res.error);
        }
    });
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


/**
 * Links to another minidapp
 * @param {string} minidapp - The minidapp to link to
 */
export function link(minidapp, callback) {
    window.MDS.dapplink(minidapp, function (res) {
        console.log(JSON.stringify(res));
        callback(res);
    })
}