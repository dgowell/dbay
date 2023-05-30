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
function sendMaximaMessage(message, address, app, callback) {
    MDS.log("Sending message to " + address);
    var maxcmd = "maxima action:send poll:true to:" + address + " application:" + app + " data:" + JSON.stringify(message);
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
function sendMinima(amount, address, callback) {
    var maxcmd = "send amount:" + amount + " address:" + address;
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