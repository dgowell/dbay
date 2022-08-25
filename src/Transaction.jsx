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


const Transaction = () => {
    const tokenName = 'Test';
    const tokenLink = 'www.google.com';
    const tokenDesc = 'This is a description of a token';
    const txnName = 'swap';
    const amount = 10;

    const [tokenId, setTokenId] = useState();
    const [outAddress, setOutAddress] = useState();
    const [txnId, setTxnId] = useState();
    const [created, setCreated] = useState(false);

    function checkName(token, name) {
        return token.token.name.name === name;
    }

    function createNFT(name, link, description) {
        const command = `tokencreate amount:1 decimal:0 name:{"name":"${name}","link":"${link}","description":"${description}"}`;
        window.MDS.cmd(command, function (res) {
            if (res.response) {
                let token = res.response.outputs.find(e => checkName(e, name));
                setTokenId(token.token.tokenid);
            }
            return "no token created";
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
            } else {
                console.log(res.error);
            }
        })
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
        createTransaction(txnName);
        controlTransaction();
        //const coinId = ''; //addTxnInput(txnId, coinId)
        //exportTxn(fileName); //save exported file to somewhere on the database/filesystem
    }

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