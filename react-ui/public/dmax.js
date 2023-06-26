// CREATE TXN TABLE
var TRANSACTIONSTABLE = 'TRANSACTIONS';

function createTransactionTable(callback) {
    const Q = `create table if not exists ${TRANSACTIONSTABLE} (
            "txn_id" INT AUTO_INCREMENT PRIMARY KEY,
            "created_at" bigint not null,
            "pendinguid" varchar(34),
            "amount" int not null,
            "purchase_code" varchar(20) not null,
            "status" varchar(50) not null
            )`;

    MDS.sql(Q, function (res) {
        if (logs) { MDS.log(`MDS.SQL, ${Q}`); }
        if (res.status && callback) {
            callback(true);
        } else {
            return Error(`${res.error}`);
        }
    })
}

/**
 * Add transaction to the transaction table

 */

function addTransaction({created_at, pendinguid, amount, status, callback}) {
    const Q = `INSERT INTO ${TRANSACTIONSTABLE} (txn_id, created_at, pendinguid, amount, status) VALUES ('${created_at}', '${pendinguid}', '${amount}', '${status}')`;
    MDS.sql(Q, function (res) {
        if (logs) {
            MDS.log(`MDS.SQL, ${Q}`);
        }

        MDS.log(`Adding transaction ${res.status}`);

        if (res.status && callback) {
            callback(true);
        } else {
            throw new Error(`Adding transaction ${res.error}`);
        }
    });
}




/**
 * Send message via Maxima to contat address or permanent address
 * @param {*} message
 * @param {*} address
 * @param {*} app
 * @param {*} callback
 */
function sendMessage({data, address, app, callback}) {
    MDS.log("Sending message to " + address);
    const formatAddress = address.includes('MAX') || address.includes('Mx') ? `to:${address}` : `publickey:${address}`;
    var maxcmd = "maxima action:send poll:true " + formatAddress + " application:" + app + " data:" + JSON.stringify(data);
    MDS.log(maxcmd);
    MDS.cmd(maxcmd, function (msg) {
        MDS.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
        }
    });
}

/**
 * Confirm coin exists and return the coin data response
 * @param {*} coinId
 * @param {*} callback
 * @returns coin data
 */
function confirmPayment(coinId, callback) {
    var maxcmd = "coins coinid:" + coinId;
    MDS.cmd(maxcmd, function (msg) {
        MDS.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
        }
    });
}

/**
 * Get Public Key
 * @param {*} callback
*/
function getPublicKey(callback) {
    var maxcmd = "maxima";
    MDS.cmd(maxcmd, function (msg) {
        MDS.log(JSON.stringify(msg));
        if (callback) {
            callback(msg.response.publickey);
        }
    });
}




/*
* Generate a random code of given length
* @param {*} length
*/
function generateCode(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}