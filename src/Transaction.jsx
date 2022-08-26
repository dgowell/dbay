/*
The function follows the below pattern

Create token
tokencreate name:mynft amount: 1 decimals: 0

Send minima to other node so that is has minima
Send amount: 10 address:

To get address to receive minima
    Getaddress

Create transaction
Txncreate id: swap

Add output to transaction
txnoutput address:MxG081P54HDF8223AJVDREUR9YEMJ3GZ94GU1RMGS1V5YNQ1MJCMNCKF940V09E id:swap amount: 10 tokenid: 0x00

find which nft you want to send
coins

Add input to transaction
Txninput id:swap coinid:mskdmsmdksdm scriptmmr: true

Pass your transaction to the other node
Txnexport id:swap file: filename.txn

So that the pother node knows about your token you have to export it too
Tokens action:export tokenid: theiidofthetokentoexport

Copy the data
*/
import React, { useState, useEffect } from 'react';



const Transaction = () => {
    const TOKEN_NAME = 'Test';
    const TOKEN_LINK = 'www.google.com';
    const TOKEN_DESC = 'This is a description of a token';
    const txnName = 'swap';
    const amount = 10;
    const MAX_CONTACT = 'MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G1HZ0Q31WFB78WBETEUNQJBVR3G65Y36PPKA2DUJYR65CM87Y7K0K7843BTVU4FQ967V06YD3EEJC2ATHJ9ZGPPYEAA8DWJACPS019G59Y8B771Q71H4BJKC0D2K3UY7HMENHD3CGYKR7PDGN5V7YQPPZEEVE2V8TTVAAWQY1V4B8W9W8V0CER54Z6S5R2BQ01RMSS87ZH9VZYS10608004TR7GZY@192.168.1.84:10001';

    const [tokenId, setTokenId] = useState();
    const [tokenCreated, setTokenCreated] = useState(false);
    const [outAddress, setOutAddress] = useState();
    const [txnId, setTxnId] = useState();
    const [created, setCreated] = useState(false);
    const [contact, setContact] = useState(false);
    const [hasOutput, setHasOutput] = useState(false);
    const [hasInput, setHasInput] = useState(false);
    const [coinId, setCoinId] = useState();

    useEffect(() => {
        if (!contact) {
            addContact(MAX_CONTACT);
        }
    }, []);

    useEffect(() => {
        if (tokenCreated) {
            getToken(TOKEN_NAME);
        }
    }, [tokenCreated]);

    useEffect(() => {
        controlTransaction();
    }, [txnName, outAddress, tokenId]);

    /* add contact to send to */
    function addContact(hex) {
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

    /* create the NFT on chain */
    function createNFT(name, link, description) {
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
    function getToken(name) {
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

    /* Create transaction with a given name */
    function createTransaction(name) {
        window.MDS.cmd(`txncreate id:${name}`, function (res) {
            if (res.status) {
                setTxnId(res.response.transaction.transactionid);
                console.log(`Create transaction ${name}`);
            } else {
                console.log(res.error);
            }
        })
    }

    /* Add output to transaction */
    function addTxnOutput(txnName, address, amount, tokenId) {
        window.MDS.cmd(`txnoutput id:${txnName} address:${address} amount:${amount} tokenid:${tokenId}`, function (res) {
            if (res.status) {
                console.log(`Add ${amount} output to transaction ${txnName}`);
                setHasOutput(true);
            } else {
                console.log(res.error);
                return false;
            }
        })
    }

    /* returns coin id of coin with a given name */
    function getCoin(name) {
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
    function addTxnInput(txnName, coinid) {
        window.MDS.cmd(`txninput id:${txnName} coinid:${coinid} scriptmmr:true`, function (res) {
            if (res.status) {
                console.log(`successfully added input to transaction`);
                setHasInput(true);
            } else {
                console.log(res.error);
            }
        })
    }

    /* export transaction */
    function exportTxn(name) {
        if (contact) {
            window.MDS.cmd(`txnexport id:${name}`, function (res) {
                if (res.status) {
                    sendTxn(res.response.data);
                    console.log(`Export transaction ${name}`);
                } else {
                    console.log(res.error);
                }
            });
        }
    }

    /* Use maxima to send transaction data to another node on the network */
    function sendTxn(data) {
        window.MDS.cmd(`maxima action:send to:${contact} application:stampd data:${data}`, function (res) {
            if (res.status) {
                console.log(res);
            } else {
                console.log(res.error);
            }
        });
    }

    function getAddress() {
        window.MDS.cmd('getaddress', function (res) {
            if (res.status) {
                setOutAddress(res.response.miniaddress);
                console.log(`Get address ${res.response.miniaddress}`);
            } else {
                console.log(res.error);
            }
        })
    }

    const controlTransaction = () => {
        if (txnName && outAddress && tokenId) {
            addTxnOutput(txnName, outAddress, amount, tokenId);
            getCoin(TOKEN_NAME);
            if (coinId) { addTxnInput(txnName, coinId); }
            if (hasOutput && hasInput) {
                exportTxn(txnName);
                setCreated(true);
            }
        };
    }

    async function handleClick() {
        createNFT(TOKEN_NAME, TOKEN_LINK, TOKEN_DESC);
        getAddress();
        getToken(TOKEN_NAME);
        createTransaction(txnName);
        controlTransaction();
    }

    return (
        <ul> {created
            ? <p>TokenId: {tokenId}, Transaction Id: {txnId}, Output Address: {outAddress}</p>
            : <button onClick={handleClick}>Create Transaction</button>
        }
        </ul>

    )

}

export default Transaction;