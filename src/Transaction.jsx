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
    sendTxn
} from './mds-helpers';


const Transaction = () => {
    const TOKEN_NAME = 'Test';
    const TOKEN_LINK = 'www.google.com';
    const TOKEN_DESC = 'This is a description of a token';
    const txnName = 'swap';
    const amount = 10;
    const MAX_CONTACT = 'MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G16RBR0SYH1WT8D6HPWVHCFCPD4VFSWJ8Q8HSWMTARUKAD22JZHJTC81DH50GAU40ZEBG5S51R4TD80D7H604GS40VMHVRCK89AD28ZRQZGY601WBWJ496GJF7R3HYUEEMJDVSVE935NK4NC7UU064NE8STGHCMA2VT9M5ZB37PTHAPKGM80NPKPV2D8Q067MPPD3UP87B9T5PC10608006FMHYMD@192.168.1.83:10001';

    const [tokenId, setTokenId] = useState();
    const [tokenCreated, setTokenCreated] = useState(false);
    const [outAddress, setOutAddress] = useState();
    const [txnId, setTxnId] = useState();
    const [created, setCreated] = useState(false);
    const [contact, setContact] = useState(false);
    const [hasOutput, setHasOutput] = useState(false);
    const [hasInput, setHasInput] = useState(false);
    const [coinId, setCoinId] = useState();
    const [data, setData] = useState();

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
        controlTransaction();
    }, [txnName, outAddress, tokenId, coinId, hasInput, hasOutput, data, txnName]);


    const controlTransaction = () => {
        if (txnName && outAddress && tokenId) {
            addTxnOutput(txnName, outAddress, amount, tokenId, setHasOutput);
            getCoin(TOKEN_NAME, setCoinId);
            if (coinId) { addTxnInput(txnName, coinId, setHasInput); }
            if (hasOutput && hasInput) {
                if (contact) {
                    exportTxn(txnName, setData);
                    sendTxn(data, contact);
                    setCreated(true);
                } else {
                    console.log("There is no contact");
                }
            } else {
                console.log(`no transaction output: ${hasOutput} or inpput: ${hasInput}`)
            }
        } else {
            console.log(`one of these is missing: txnName:${txnName} outAddress${outAddress} or tokenId:${tokenId}`);
        }
    }

    async function handleClick() {
        createNFT(TOKEN_NAME, TOKEN_LINK, TOKEN_DESC, setTokenCreated);
        getAddress(setOutAddress);
        getToken(TOKEN_NAME, setTokenId);
        createTransaction(txnName, setTxnId);
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