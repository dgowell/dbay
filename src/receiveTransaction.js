/*
* When user B receives a message from MAxima and checks that it is for the correct application it will then follow the following steps
1. Check the token that you are expecting is there
2. take the data from the message
3. add output to the transactoin
4. add input to the txn
5. sign it
6. export it
7. send it back
*/

function receiveTRansaction(data) {
    console.log("Hey just recieved a message");
    console.log(data);
    //checkToken();
    //addOutput();
    //addInput();
    //signTxn();
    //exportTxn();
}

export default receiveTRansaction;