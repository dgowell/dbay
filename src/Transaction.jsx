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
import React from 'react';
import createNFT from './createNFT';

function getAddress() {
    window.MDS.cmd('getaddress', function (res) {
        if (res.status) {
            return res.response.miniaddress;
        }
    })
}
function createTransaction(name) {
    window.MDS.cmd(`txncreate id:${name}`, function (res) {
        if (res.status) {
            debugger;
            console.log(res);
            return res;
        }
    })
}

const Transaction = () => {
    const tokenName = 'Test';
    const tokenLink = 'www.google.com';
    const tokenDesc = 'This is a description of a token';
    const txnName = 'swap';
    let tokenId = '';
    let outAddress = '';
    let txnId = '';

    const [created, setCreated] = React.useState(false);


    async function handleClick() {
        tokenId = await createNFT(tokenName, tokenLink, tokenDesc);
        outAddress = await getAddress();
        txnId = await createTransaction(txnName);
        setCreated(true);
        //const amount = 10;
        //addTxnOutput(txnId, outAddress, amount, tokenId);
        //const coinId = ''; //addTxnInput(txnId, coinId)
        //exportTxn(fileName); //save exported file to somewhere on the database/filesystem
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