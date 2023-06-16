// CREATE TXN TABLE
var TRANSACTIONSTABLE = 'TRANSACTIONS';

function createTransactionTable(callback) {
    const Q = `create table if not exists ${TRANSACTIONSTABLE} (
            "txn_id" varchar(50) primary key,
            "created_at" int not null,
            "pending_uid" varchar(34),
            "amount" int not null,
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

function addTransaction(created_at, pending_uid, amount, status, callback) {
    const Q = `INSERT INTO ${TRANSACTIONSTABLE} (txn_id, created_at, pending_uid, amount, status) VALUES ('${created_at}', '${pending_uid}', '${amount}', '${status}')`;
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


/*
* Set Static MLS
* @param {*} callback
*/
function setStaticMLS(p2pidentity, callback) {
    MDS.log("Setting static MLS to " + p2pidentity);
    var maxcmd = `maxextra action:staticmls host:${p2pidentity}`;
    MDS.cmd(maxcmd, function (msg) {
        MDS.log(JSON.stringify(msg));
        if (callback) {
            callback(msg);
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
function sendMessage(message, address, app, callback) {
    MDS.log("Sending message to " + address);
    const formatAddress = address.includes('MAX') || address.includes('Mx') ? `to:${address}` : `publickey:${address}`;
    var maxcmd = "maxima action:send poll:true " + formatAddress + " application:" + app + " data:" + JSON.stringify(message);
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


/**
 * Send minima to address
 * @param {*} amount
 * @param {*} address
 * @param {*} callback
 * @returns coin data
 */
function sendMinima(amount, address, password, purchaseCode, callback) {
    const passwordPart = password ? `password:${password}` : "";
    const purchaseCodePart = purchaseCode ? `state:{"99":"[${purchaseCode}]"}` : "";
    var maxcmd = `send address:${address} amount:${amount} ${passwordPart} ${purchaseCodePart}`;
    MDS.cmd(maxcmd, function (msg) {
        MDS.log(`sendMinima function response: ${JSON.stringify(msg)}`);
        if (callback) {
            //return the coinid
            if (msg.status) {
                MDS.log(`coinid returned: ${JSON.stringify(msg.response.body.txn.outputs[0].coinid)}`);
                callback(msg.response.body.txn.outputs[0].coinid);
            } else {
                MDS.log(msg.error);
                callback(false, msg.error)
            }
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