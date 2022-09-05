/*
 * Function to create NFT and return the tokenID
 */
export function createNFT(name, link, description, setTokenCreated) {
    const command = `tokencreate amount:1 decimal:0 name:{"name":"${name}","link":"${link}","description":"${description}"}`;
    window.MDS.cmd(command, function (res) {
        if (res.status) {
            setTokenCreated(true);
            console.log(`Create NFT ${name}`);
        } else {
            console.log(res.error);
        }

    })
}

/* Return token Id with a given token name */
export function getTokenId(name) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`tokens`, function (res) {
            if (res.status) {
                let t = res.response.find(token => token.name.name === name);
                if (t) {
                    resolve(t['tokenid']);
                    console.log(`Get token: ${name}`);
                } else {
                    reject("No Token with that name");
                }
            } else {
                console.log(res.error);
                reject(res.error);
            }
        })
    })
}

/* Return token data with a given token ID */
export function getTokenData(id, setData) {
    window.MDS.cmd(`tokens`, function (res) {
        if (res.status) {
            let data = res.response.find(token => token.tokenid === id);
            setData(data);
            console.log(`Get token: ${id}`);
        } else {
            console.log(res.error);
        }
    })
}

/* Get all tokens */
export function getTokens(tokens) {
    window.MDS.cmd(`tokens`, function (res) {
        if (res.status) {
            tokens(res.response);
            console.log(`Get tokens: ${tokens}`);
        } else {
            console.log(res.error);
        }
    })
}

/* Gets the miniaddress Mx00.. and uses the callback to set it */
export function getAddress() {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('getaddress', function (res) {
            if (res.status) {
                resolve(res.response.miniaddress);
                console.log(`Get address ${res.response.miniaddress}`);
            } else {
                reject(res.error);
                console.log(res.error);
            }
        })
    })
}

/* Gets the Maxima contact address */
export function getMaximaAddress() {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('maxima', function (res) {
            if (res.status) {
                resolve(res.response.contact);
                console.log(`Get address ${res.response.contact}`);
            } else {
                reject(res.error);
                console.log(res.error);
            }
        })
    })
}

/* add contact with given hex address to maxima contacts */
export function addContact(hex, setContact) {
    const command = `maxcontacts action:add contact:${hex}`;
    window.MDS.cmd(command, function (res) {
        if (res.status) {
            setContact(hex);
            console.log(`Add contact ${hex}`);
        } else {
            console.log(res.error);
        }
    })
}

const slugify = str =>
    str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

/* Create transaction with a given name and return a Promise */
export function createTransaction(name) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`txncreate id:${name}`, function (res) {
            if (res.status) {
                //console.log(`Create transaction ${res.response.transaction.transactionid}`);
                resolve(res.response.transaction.transactionid);
            } else if (res.error.includes('Txn with this ID already exists')) {
                resolve(res.error);
            } else {
                console.log(res.error);
                reject(res.error);
            }
        })
    })
}

/* Add output to transaction */
export function addTxnOutput(txnName, address, amount, tokenId) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`txnoutput id:${txnName} address:${address} amount:${amount} tokenid:${tokenId}`, function (res) {
            if (res.status) {
                console.log(`Add output to transaction: ${txnName}`);
                resolve(true);
            } else {
                console.log(res.error);
                reject(res.error);
            }
        });
    });
}


/* returns coin Id when given a token id */
export function getCoin(tokenId) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`coins`, function (res) {
            if (res.status) {
                let coin = res.response.find(c => c.tokenid === tokenId);
                resolve(coin['coinid']);
                console.log(`Get Coin: ${coin['coinid']}`);
            } else {
                reject(res.error);
                console.log(res.error);
            }
        })
    })
}

/* Add input to transaction */
export function addTxnInput(txnName, coinId) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`txninput id:${txnName} coinid:${coinId} scriptmmr:true`, function (res) {
            if (res.status) {
                console.log(`Add input to transaction: ${txnName}`);
                resolve(true);
            } else {
                console.log(res.error);
                reject(res.error);
            }
        })
    })
}

/* export transaction */
export function exportTxn(txnName) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`txnexport id:${txnName}`, function (res) {
            if (res.status) {
                resolve(res.response.data);
                console.log(`Export transaction ${txnName}`);
            } else {
                console.log(res.error);
                reject(res.error);
            }
        });
    })
}

/* Use maxima to send transaction data to another node on the network */
export function sendTxn(data, contact, tag) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`maxima action:send to:${contact} application:stampd-${tag} data:${data}`, function (res) {
            if (res.response.delivered) {
                console.log(`You've sent a transaction at ${res.response.time} and it's been delivered`);
                resolve(true);
            } else {
                console.log(res.error);
                reject(res.error);
            }
        });
    })
}

export function txnImport(data, txnName) {
    window.MDS.cmd(`txnimport data:${data} id:${txnName}`, function (res) {
        if (res.status) {
            console.log(`You've imported a transaction called ${txnName}`);
        } else {
            console.log(res.error);
        }
    });
}

/* Export token data to send to node 2 */
export function exportToken(tokenId, setTokenExportData) {
    window.MDS.cmd(`tokens action:export tokenid:${tokenId} `, function (res) {
        if (res.status) {
            console.log(`Export Token: ${tokenId}`);
            setTokenExportData(res.response.data);
        } else {
            console.log(res.error);
            return false;
        }
    })
}

/* Import the token */
export function tokenImport(data, setTokenImported) {
    window.MDS.cmd(`txnimport data:${data}`, function (res) {
        if (res.status) {
            console.log(`Token Imported`);
            setTokenImported(true);
        } else {
            console.log(res.error);
        }
    });
}

export function sendPurchaseRequest(tokenName, amount, sellersAddress) {
    const txnName = slugify(tokenName);
    let tokenId, address, coinId;
    Promise.all([getTokenId(tokenName), getAddress(), createTransaction(slugify(txnName))]).then(function (result) {
        tokenId = result[0];
        address = result[1];
        return getCoin(tokenId);
    }).then(function (result) {
        coinId = result;
        return addTxnOutput(txnName, address, amount, tokenId);
    }).then(function (result) {
        return addTxnInput(txnName, coinId);
    }).then(function (result) {
        return exportTxn(txnName);
    }).then(function (result) {
        return sendTxn(result, sellersAddress, txnName);
    }).catch(function (error) {
        console.log(error);
    });
}