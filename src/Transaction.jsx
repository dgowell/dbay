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

So that the other node knows about your token you have to export it too
Tokens action:export tokenid: theiidofthetokentoexport

Copy the data
*/
import React, { useState, useEffect } from 'react';
import {
    createNFT,
    getToken,
    getAddress,
    addContact,
    createTransaction,
    addTxnOutput,
    getCoin,
    addTxnInput,
    exportTxn,
    sendTxn,
    exportToken
} from './mds-helpers';


const Transaction = () => {
    const TOKEN_NAME = 'Test';
    const TOKEN_LINK = 'www.google.com';
    const TOKEN_DESC = 'This is a description of a token';
    const txnName = 'swap';
    const amount = 10;
    const MAX_CONTACT = 'MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G1GGHUVYU7SVFC423GVRA99Q10649D2Q06R3NA7UJ1JAJCYW78FHHZKV1BY3R2AWMZ0UGJ3YB4TZ3D002A8PAK5N2W313FPCW2AC7VD5TAUQ29309Q0QP7MMWU3S1C6G0GMA783UQFVU4AW9AK35308ZZ1DM8W9H3T3D09VSKUQEMCFQ6GZCD1GQ9E9JS87T4EG3YBJQFGJVHNK106080044PZWW6@192.168.1.83:10001';

    const [tokenId, setTokenId] = useState();
    const [tokenCreated, setTokenCreated] = useState(false);
    const [outAddress, setOutAddress] = useState();
    const [txnId, setTxnId] = useState();
    const [sent, setSent] = useState(false);
    const [contact, setContact] = useState(false);
    const [hasOutput, setHasOutput] = useState(false);
    const [hasInput, setHasInput] = useState(false);
    const [coinId, setCoinId] = useState();
    const [data, setData] = useState();
    const [tokenExportData, setTokenExportData] = useState();

    useEffect(() => {
        if (!contact) {
            addContact(MAX_CONTACT, setContact);
        }
    }, []);

    useEffect(() => {
        if (tokenCreated) {
            getToken(TOKEN_NAME, setTokenId);
        }
    }, [tokenCreated]);

    useEffect(() => {
        if (txnName && outAddress && tokenId) {
            addTxnOutput(txnName, outAddress, amount, tokenId, setHasOutput);
            getCoin(TOKEN_NAME, setCoinId);
        }
    }, [txnName, outAddress, tokenId]);

    useEffect(() => {
        if (coinId) { addTxnInput(txnName, coinId, setHasInput); }
    }, [coinId]);

    useEffect(() => {
        if (hasOutput && hasInput) {
            exportTxn(txnName, setData);
        }
    }, [hasOutput, hasInput]);

    useEffect(() => {
        if (!tokenExportData) {
            exportToken(tokenId, setTokenExportData);
        }
    }, []);

    useEffect(() => {
        if (contact && data) {
            sendTxn(data, contact, 'txndata', setSent);
        }
    }, [data, contact]);

    useEffect(() => {
        if (contact && tokenExportData) {
            sendTxn(tokenExportData, contact, 'tokendata', setSent);
        }
    }, [tokenExportData, contact]);

    async function handleClick() {
        createNFT(TOKEN_NAME, TOKEN_LINK, TOKEN_DESC, setTokenCreated);
        getAddress(setOutAddress);
        getToken(TOKEN_NAME, setTokenId);
        createTransaction(txnName, setTxnId);
    }

    return (
        <ul> {sent
            ? <p>TokenId: {tokenId}, Transaction Id: {txnId}, Output Address: {outAddress}</p>
            : <button onClick={handleClick}>Create Transaction</button>
        }
        </ul>

    )

}

export default Transaction;