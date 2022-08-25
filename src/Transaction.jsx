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

Add input to transaction
Txninput id:swap coinid:mskdmsmdksdm scriptmmr: true

Pass your transaction to the other node
Txnexport id:swap file: filename.txn

So that the pother node knows about your token you have to export it too
Tokens action:export tokenid: theiidofthetokentoexport

Copy the data
*/
import React, { useState } from 'react';

const MAX_CONTACT = 'MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G1CQTJ3QUQ0FF8AMM7Y54PJHAQUKSF9BWA606AV4YP5P4NGY88K1ZK9QZJYC3S0D4890R8JYJ1N92UG9QD0ZM11GMG28KT9C0J7JS5TTD8WKP75BDHWRTP60507WH8B4PPM9CW8KRKYT66H1KF617S2QJ2DGJCSJJU62MYRHQMMP8RPA89QGBP5K9BNP3K3C51TGGYCNMN6HEKK10608004ZMPTF2@192.168.1.84:10001';

const Transaction = () => {
    const tokenName = 'Test';
    const tokenLink = 'www.google.com';
    const tokenDesc = 'This is a description of a token';
    const txnName = 'swap';
    const amount = 10;

    const [tokenId, setTokenId] = useState();
    const [tokenCreated, setTokenCreated] = useState(false);
    const [outAddress, setOutAddress] = useState();
    const [txnId, setTxnId] = useState();
    const [created, setCreated] = useState(false);
    const [contact, setContact] = useState(false);

    addContact(MAX_CONTACT);

    function addContact(con) {
        const command = `maxcontacts action:add contact:${con}`;
        window.MDS.cmd(command, function (res) {
            if (res.status) {
                setContact(con);
            } else {
                console.log(res.error);
            }
        })
    }

    function createNFT(name, link, description) {
        const command = `tokencreate amount:1 decimal:0 name:{"name":"${name}","link":"${link}","description":"${description}"}`;
        window.MDS.cmd(command, function (res) {
            if (res.status) {
                setTokenCreated(true);
            }
            return "no token created";
        })
    }

    function getToken(name) {
        window.MDS.cmd(`tokens`, function (res) {
            if (res.status) {
                let t = res.response.find(token => token.name.name === name);
                setTokenId(t['tokenid']);
            }
        })
    }

    function createTransaction(name) {
        window.MDS.cmd(`txncreate id:${name}`, function (res) {
            if (res.status) {
                setTxnId(res.response.transaction.transactionid);
            } else {
                console.log(res.error);
            }
        })
    }
    function addTxnOutput(txnName, address, amount, tokenId) {
        window.MDS.cmd(`txnoutput id:${txnName} address:${address} amount:${amount} tokenid:${tokenId}`, function (res) {
            if (res.status) {
                console.log(`successfully added output to transaction`);
                exportTxn(txnName);
            } else {
                console.log(res.error);
            }
        })
    }

    function sendTxn(data) {
        window.MDS.cmd(`maxima action:send to:${contact} application:stampd data:${data}`, function (resp) {
            if (resp.status) {
                console.log(resp);
            } else {
                console.log(resp.error);
            }
        });
    }

    /* Use maxima to send transaction data to another node on the network */
    function exportTxn(name) {
        if (contact) {
            window.MDS.cmd(`txnexport id:${name}`, function (res) {
                if (res.status) {
                    sendTxn(res.response.data);
                }
            });
        }
    }

    function getAddress() {
        window.MDS.cmd('getaddress', function (res) {
            if (res.status) {
                setOutAddress(res.response.miniaddress);
            } else {
                console.log(res.error);
            }
        })
    }

    const controlTransaction = () => {
        if (txnName && outAddress && tokenId) {
            addTxnOutput(txnName, outAddress, amount, tokenId);
            setCreated(true);
        };
    }

    async function handleClick() {
        createNFT(tokenName, tokenLink, tokenDesc);
        getAddress();
        getToken(tokenName);
        createTransaction(txnName);
        controlTransaction();
    }

    React.useEffect(() => {
        getToken(tokenName);
    }, [tokenCreated]);

    React.useEffect(() => {
        controlTransaction();
    }, [txnName, outAddress, tokenId]);

    return (
        <ul> {created
            ? <p>TokenId: {tokenId}, Transaction Id: {txnId}, Output Address: {outAddress}</p>
            : <button onClick={handleClick}>Create Transaction</button>
        }
        </ul>

    )

}

export default Transaction;