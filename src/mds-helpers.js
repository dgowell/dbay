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

/* Get the token with a given name */
export function getToken(name, setTokenId) {
    window.MDS.cmd(`tokens`, function (res) {
        if (res.status) {
            let t = res.response.find(token => token.name.name === name);
            setTokenId(t['tokenid']);
            console.log(`Get token: ${name}`);
        } else {
            console.log(res.error);
        }
    })
}

/* Get the address */
export function getAddress(setAddress) {
    window.MDS.cmd('getaddress', function (res) {
        if (res.status) {
            setAddress(res.response.miniaddress);
            console.log(`Get address ${res.response.miniaddress}`);
        } else {
            console.log(res.error);
        }
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

/* Create transaction with a given name */
export function createTransaction(name, setTxnId) {
    window.MDS.cmd(`txncreate id:${name}`, function (res) {
        if (res.status) {
            setTxnId(res.response.transaction.transactionid);
            console.log(`Create transaction ${res.response.transaction.transactionid}`);
        } else {
            console.log(res.error);
        }
    })
}

/* Add output to transaction */
export function addTxnOutput(txnName, address, amount, tokenId, setHasOutput) {
    window.MDS.cmd(`txnoutput id:${txnName} address:${address} amount:${amount} tokenid:${tokenId}`, function (res) {
        if (res.status) {
            console.log(`Add output to transaction: ${txnName}`);
            setHasOutput(true);
        } else {
            console.log(res.error);
            return false;
        }
    })
}

/* returns coin id of coin with a given name */
export function getCoin(name, setCoinId) {
    window.MDS.cmd(`coins`, function (res) {
        if (res.status) {
            let coin = res.response.find(c => c.token.name.name === name);
            setCoinId(coin['coinid']);
            console.log(`Get Coin: ${coin['coinid']}`);
        } else {
            console.log(res.error);
        }
    })
}

/* Add input to transaction */
export function addTxnInput(txnName, coinid, setHasInput) {
    window.MDS.cmd(`txninput id:${txnName} coinid:${coinid} scriptmmr:true`, function (res) {
        if (res.status) {
            console.log(`Add input to transaction: ${txnName}`);
            setHasInput(true);
        } else {
            console.log(res.error);
        }
    })
}

/* export transaction */
export function exportTxn(name, setData) {
    window.MDS.cmd(`txnexport id:${name}`, function (res) {
        if (res.status) {
            setData(res.response.data);
            console.log(`Export transaction ${name}`);
        } else {
            console.log(res.error);
        }
    });
}

/* Use maxima to send transaction data to another node on the network */
export function sendTxn(data, contact) {
    window.MDS.cmd(`maxima action:send to:${contact} application:stampd data:${data}`, function (res) {
        if (res.response.delivered) {
            console.log(`You've sent a transaction at ${res.response.time} and it's been delivered`);
        } else {
            console.log(res.error);
        }
    });
}