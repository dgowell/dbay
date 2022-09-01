/*
* When user B receives a message from MAxima and checks that it is for the correct application it will then follow the following steps
1. Check the token that you are expecting is there, if not import the token data
2. take the data from the message
3. add output to the transactoin
4. add input to the txn
5. sign it
6. export it
7. send it back
*/
import React, {
    useState,
    useEffect,
} from 'react';
import {
    getToken,
    getAddress,
    addTxnOutput,
    addContact,
    addTxnInput,
    txnImport,
    exportTxn,
    sendTxn,
    getCoin,
    tokenImport
} from './mds-helpers';

const ReceiveTransaction = (data) => {
    const TOKEN_NAME = 'Test';
    const txnName = 'swap';
    const amount = 10;
    const contactHex = 'MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G11WJMVNYTYMAEC3B0PPFD7NUZJB23PN6UMKU0CQR2CU5RU4FH2S1MASSHZ7ZSR2TBS2WH3MSAJ2K8PBHFFWJCASS4Q2VGY0HQ9W73A41VFUY906QKQT2U6VSA14A9Q7QT083RC45P20D73C7FB2QP825WM3FAJFJCPKY56UVV2MVGD3T0DUFTK4ZN6DW02D10MWYJ860ME5V2C1060800728CPRJ@192.168.1.83:9001';

    const [tokenId, setTokenId] = useState();
    const [address, setAddress] = useState();
    const [hasOutput, setHasOutput] = useState();
    const [hasInput, setHasInput] = useState();
    const [contact, setContact] = useState();
    const [dataToSend, setDataToSend] = useState();
    const [coinId, setCoinId] = useState();
    const [tokenImported, setTokenImported] = useState();


    console.log("Hey just recieved a message");

    useEffect(() => {
        debugger;
        if (data.application === 'stampd-txndata') {
            txnImport(data.data, txnName);
        }
        getAddress(setAddress);
        getCoin(TOKEN_NAME, setCoinId);
    }, []);


    useEffect(() => {
        debugger;
        if (data.application === 'stampd-tokendata') {
            tokenImport(data.data, setTokenImported);
        }
    }, []);

    useEffect(() => {
        if (tokenImported) {
            getToken(TOKEN_NAME, setTokenId);
        }
    }, [tokenImported]);

    //signTxn();

    useEffect(() => {
        if (!contact) {
            addContact(contactHex, setContact);
        }
    }, [contact]);

    useEffect(() => {
        if (txnName && address && tokenId) {
            addTxnOutput(txnName, address, amount, tokenId, setHasOutput);
            getCoin(TOKEN_NAME, setCoinId);
        }
    }, [txnName, address, tokenId]);

    useEffect(() => {
        if (coinId) { addTxnInput(txnName, coinId, setHasInput); }
    }, [coinId]);

    useEffect(() => {
        if (hasOutput && hasInput) {
            exportTxn(txnName, setDataToSend);
        }
    }, [hasOutput, hasInput]);

    useEffect(() => {
        if (dataToSend) {
            sendTxn(dataToSend, contact);
        }
    }, [dataToSend]);

    return (
        <>Hello</>
    )
}

export default ReceiveTransaction;