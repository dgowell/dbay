const hex = require('string-hex');
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
                let t = res.response.find(token => slugify(token.name.name) === slugify(name));
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

/* Return token amount when given token name */
export function getTokenAmount(name) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`tokens`, function (res) {
            if (res.status) {
                let t = res.response.find(token => slugify(token.name.name) === slugify(name));
                if (t) {
                    resolve(t.name.sale_price);
                    console.log(`Get token: ${name}`);
                } else {
                    reject(`No Token with this name: ${name}`);
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

function slugify(str) {
    if (str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    } else {
        return null;
    }
}

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

/* returns coin Id when given a name */
export function getCoinIdByAmount(amount) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`coins`, function (res) {
            if (res.status) {
                let coin = res.response.find(c => c.amount === amount);
                coin ? resolve(coin.coinid) : reject('No coin with that amount');
                console.log(`Get Coin: ${coin.coinid}`);
            } else {
                reject(res.error);
                console.log(res.error);
            }
        })
    })
}

/* returns coin Id when given a name */
export function getCoinIdFromMiniAddress(miniaddress) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`coins`, function (res) {
            if (res.status) {
                let coin = res.response.find(c => c.miniaddress === miniaddress);
                coin ? resolve(coin.coinid) : reject(`No coin with that miniaddress ${miniaddress}`);
                console.log(`Get Coin: ${coin.coinid}`);
            } else {
                reject(res.error);
                console.log(res.error);
            }
        })
    })
}

/* returns coin Id when given a token id */
export function getCoin(tokenId) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`coins`, function (res) {
            if (res.status) {
                let coin = res.response.find(c => c.tokenid === tokenId);
                coin ? resolve(coin.coinid) : reject('No coin with that ID');
                console.log(`Get Coin: ${coin['coinid']}`);
            } else {
                reject(res.error);
                console.log(res.error);
            }
        })
    })
}

/* Add input to transaction */
export function addTxnInput(txnName, coinId, amount) {
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

export function txnImport(data) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`txnimport data:${data}`, function (res) {
            if (res.status) {
                console.log(`You've imported a transaction`);
                resolve(true);
            } else {
                console.log(res.error);
                reject(res.error);
            }
        });
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

/* Export token data to send to node 2 */
export function createPurchaseCoin(amount, address) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`send amount:${amount} address:${address}`, function (res) {
            if (res.status) {
                const coin = res.response.body.txn.outputs.find(coin => coin.amount === amount);
                console.log(`Create coin for ${amount} minima`);
                //wait for coin to be processed properly before resolving otherwise it won't appear in the chain
                setTimeout(resolve(coin.miniaddress), 3000);
            } else {
                console.log(res.error);
                reject(res.error);
            }
        })
    });
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

/* Signing the transaction */
export function signTxn(txnName) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`txnsign id:${txnName} publickey:auto`, function (res) {
            if (res.status) {
                console.log(`Transaction ${txnName} has been signed!`);
                resolve(true);
            } else {
                console.log(res.error);
                reject(res.error);
            }
        })
    });
}

/* save data to a database */
export async function saveTxnToDatabase(txnName, buyersAddress, data, amount, tokenId, coinId) {
    return new Promise(function (resolve, reject) {
        console.log("Saving to database...");
        const transaction = {
            txnName,
            buyersAddress,
            data,
            amount,
            tokenId,
            coinId
        }
        fetch("http://localhost:5001/transaction/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(transaction),
        }).then(function (result) {
            console.log("successfully dsaved to db");
            resolve(result);
        }).catch(error => {
            window.alert(error);
            reject(error);
        });
    });

}

export function sendPurchaseRequest(tokenName, amount, sellersAddress) {
    const txnName = slugify(tokenName);
    let tokenId, address, coinId;
    Promise.all([getTokenId(tokenName), getAddress(), createTransaction(txnName)])
        .then(function (result) {
            tokenId = result[0];
            address = result[1];
            return createPurchaseCoin(amount, address);
        }).then(function (result) {
            return getCoinIdByAmount(amount);
        }).then(function (result) {
            coinId = result;
            return addTxnOutput(txnName, address, amount, tokenId);
        }).then(function (result) {
            return addTxnInput(txnName, coinId);
        }).then(function (result) {
            return exportTxn(txnName);
        }).then(function (result) {
            return sendTxn(result, sellersAddress, 'seller-'.concat(txnName));
        }).catch(function (error) {
            console.log(error);
        });
}

export function receivePurchaseRequest(msg) {
    const data = msg.data;
    let address, tokenId, coinId, amount;
    const buyersAddress = msg.from;
    //the application name contains the transaction name with stampd- infront of it so this is removed
    const txnName = msg.application.slice(14)

    Promise.all([txnImport(data), getAddress(), getTokenAmount(txnName)])
        .then(function (result) {
            address = result[1];
            amount = result[2];
            return getTokenId(txnName);
        }).then(function (result) {
            tokenId = result;
            return getCoin(tokenId);
        }).then(function (result) {
            coinId = result;
            return addTxnOutput(txnName, address, amount, tokenId);
        }).then(function (result) {
            return addTxnInput(txnName, coinId, amount);
        }).then(function (result) {
            return signTxn(txnName);
        }).then(function (result) {
            return exportTxn(txnName);
        }).then(function (result) {
            return saveTxnToDatabase(txnName, buyersAddress, result, amount, tokenId, coinId);
        }).catch(function (error) {
            console.log(error);
        });
}

export function checkAndSignTransaction(msg) {
    console.log(msg);
}