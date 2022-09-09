/*
 * Function to create NFT and return the tokenID
 */
/* Return token Id with a given token name */
export function getTokenId(name) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`tokens`, function (res) {
            if (res.status) {
                let t = res.response.find(token => slugify(token.name.name) === slugify(name));
                if (t) {
                    resolve(t.tokenid);
                    console.log(`Token ID: ${t.tokenid}`);
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
                    console.log(`Token Amount is ${t.name.sale_price}`);
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
            console.log(`tokens -> matching token data: ${data}`);
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
            console.log(`tokens: ${tokens}`);
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
                console.log(`getaddress: ${res.response.miniaddress}`);
            } else {
                reject(res.error);
                console.log(res.error);
            }
        })
    })
}

/* Gets the public address and uses the callback to set it */
export function getPublicAddress() {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('getaddress', function (res) {
            if (res.status) {
                resolve(res.response.publickey);
                console.log(`getaddress: ${res.response.publickey}`);
            } else {
                reject(res.error);
                console.log(res.error);
            }
        })
    })
}

/* Get your keys */
export function getKeys() {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`keys`, function (res) {
            if (res.status) {
                console.log(`keys: `);
                resolve(res.response);
            } else {
                console.log(res.error);
                reject(res.error);
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
                console.log(`maxima ${res.response.contact}`);
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
                resolve(res.response.transaction.transactionid);
                console.log(`txncreate id:${name}`);
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
                console.log(`txnoutput id:${txnName} address:${address} amount:${amount} tokenid:${tokenId}`);
                resolve(true);
            } else {
                console.log(res.error);
                reject(res.error);
            }
        });
    });
}

/* returns coin Id when given a name */
export function getCoinAddressByAmount(amount) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`coins`, function (res) {
            if (res.status) {
                let coin = res.response.find(c => c.amount >= amount);
                coin ? resolve(coin.coinid) : reject('No coin with that amount');
                console.log(`Buyer Input Coin: ${coin.coinid}`);
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
                console.log(`Get Coin ID: ${coin.coinid}`);
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
                console.log(`Get Seller Coin NFT: ${coin.coinid}`);
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
        window.MDS.cmd(`txninput id:${txnName} coinid:${coinId} amount:${amount} scriptmmr:true`, function (res) {
            if (res.status) {
                console.log(`txninput id:${txnName} coinid:${coinId} amount:${amount} scriptmmr:true`);
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
                console.log(`txnexport id:${txnName}`);
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
        window.MDS.cmd(`maxima action:send to:${contact} application:stampd_${tag} data:${data}`, function (res) {
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
                console.log(`txnimport data:${data}`);
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
                setTimeout(resolve(true), 10000);
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
                console.log(`Transaction ${txnName} has been signed! ${res}`);
                resolve(txnName);
            } else {
                console.log(res.error);
                reject(res.error);
            }
        })
    });
}

/* post to the chain the transaction */
export function postTxn(txnName) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd(`txnpost id:${txnName}`, function (res) {
            if (res.status) {
                console.log(`Transaction ${txnName} has been posted! ${res}`);
                resolve(true);
            } else {
                console.log(res.error);
                reject(res.error);
            }
        })
    });
}

/* save data to a database */
export async function saveTxnToDatabase(txnName, buyersAddress, sellersAddress, data, amount, tokenId, coinId, itemDatabaseId, txnStatus) {
    return new Promise(function (resolve, reject) {
        console.log("Saving to database...");
        const transaction = {
            txnName,
            buyersAddress,
            sellersAddress,
            data,
            amount,
            tokenId,
            coinId,
            txnStatus,
        }
        fetch(`http://localhost:5001/update/${itemDatabaseId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(transaction),
        }).then(function (result) {
            console.log(`successfully updated ${itemDatabaseId}`);
            resolve(data);
        }).catch(error => {
            window.alert(error);
            reject(error);
        });
    });

}

export function sendPurchaseRequest(tokenName, amount, sellersAddress, databaseId) {
    console.log("send pruchase request called");
    const txnName = slugify(tokenName);
    let tokenId, address, coinId;
    Promise.all([getTokenId(tokenName), getAddress(), createTransaction(txnName)])
        .then(function (result) {
            tokenId = result[0];
            address = result[1];
            return getCoinAddressByAmount(amount);
        }).then(function (result) {
            coinId = result;
            return addTxnOutput(txnName, address, amount, tokenId);
        }).then(function (result) {
            return addTxnInput(txnName, coinId, amount);
        }).then(function (result) {
            return exportTxn(txnName);
        }).then(function (result) {
            return saveTxnToDatabase(txnName, address, sellersAddress, result, amount, tokenId, coinId, databaseId, 1);
        }).then(function (result) {
            return sendTxn(result, sellersAddress, `seller_${txnName}_${databaseId}`);
        }).catch(function (error) {
            console.log(error);
        });
}

export function receivePurchaseRequest(txnName, data, databaseId, buyersAddress) {
    let address, tokenId, coinId, amount;
    return Promise.all([txnImport(data), getAddress(), getTokenAmount(txnName)])
        .then(function (result) {
            address = result[1];
            amount = result[2];
            return getTokenId(txnName);
        }).then(function (result) {
            tokenId = result;
            return getCoin(tokenId);
        }).then(function (result) {
            coinId = result;
            return addTxnOutput(txnName, address, amount, '0x00');
        }).then(function (result) {
            return addTxnInput(txnName, coinId, amount);
        }).then(function (result) {
            return signTxn(txnName);
        }).then(function (result) {
            return exportTxn(txnName);
        }).then(function (result) {
            return saveTxnToDatabase(txnName, buyersAddress, address, result, amount, tokenId, coinId, databaseId, 2);
        }).catch(function (error) {
            console.log(error);
        });
}

export function checkAndSignTransaction(txnName, data) {
    txnImport(data).then(function (result) {
        return signTxn(txnName);
    }).then(function (result) {
        postTxn(result);
    }).catch(function (error) {
        console.log(error);
    });
}