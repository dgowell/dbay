/**
* dMAX Utility Functions
*
* @dgowell
*/

/**
 * Global variables
 */
//mini address when typing getaddress on the command line
//var SERVER_WALLET = "MxG087TM1WDYC0QP2HVTU4788UBQMZCR07AH3FTACF7UZWV2MAV8RJKJ1HM313N"; //blue-node
//var SERVER_WALLET = 'MxG0839Q2E0JWS0R7VB7DA8CF1Q3ZGUP5NS9RK2E9056N1N2FA4S2U6GKP26K2D'; //barrys server
var SERVER_WALLET = 'MxG083U3R8H31Z30H7Z6T0KM1Z9GJ978NCDGBJU42JTSZS18ZW4GFDF43EH519U'; //dmax server


//var SERVER_ADDRESS = "MAX#0x30819F300D06092A864886F70D010101050003818D003081890281810087916B30523665FF05A8554F5B0BECE54D8FD420DD82C46219E809027F51126196CF419EAD94B022DBF97123E02A677201115216AD225AC4F3E08AC8D3D9DAF76D629143D557448573B7F53C31D56E90F3D7DAFE752A27AD659FD903BD52B89ABBBC0DF97AD81C7B2E27D32E75588520DD44A2386E8FA79A9F9A405A541394750203010001#MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G16KD3ADUVWE789VEVFHC9A9Z4YC2T1JFQYCWNRS41VPQWJFKW2BMGQFRJ6GDMT0TG5KVNG2WQ0PVCE99Z30BCH85KAV1B7PNY8E4A45BCQYP4PU3AQ06BESHA9YWBQND6YVEF74P9FW7EHCUT31ZDTZ4145F5EWURCD91HEP8VY2P4F2SY808PYABMZVKK6R4M72TCKCSRHN1K10608006C2AE9F@31.125.188.214:9001"; //perm address of dmax server
//var SERVER_ADDRESS = "MAX#0x30819F300D06092A864886F70D010101050003818D0030818902818100BC9E165D8782CCEE0AF164F582F59B5B7FE64CD012CDFCA6F89594BF197EF7295E83A2220E91115D2E1B285573166AAE758CBF18113464ED5B5AF8F46144C0810DAA9E983575AECB871FBB986B0FE2579C3A6A97BED5AB81584F917E639F39DEE41F3ABBEF6925A32ADACFEAB8949F159D568E0DC66AAF779F184646B11B32730203010001#MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G16KD3ADUVWE789VEVFHC9A9Z4YC2T1JFQYCWNRS41VPQWJFKW2BMGQFRJ6GDMT0TG5KVNG2WQ0PVCE99Z30BCH85KAV1B7PNY8E4A45BCQYP4PU3AQ06BESHA9YWBQND6YVEF74P9FW7EHCUT31ZDTZ4145F5EWURCD91HEP8VY2P4F2SY808PYABMZVKK6R4M72TCKCSRHN1K10608006C2AE9F@31.125.188.214:9001"; //perm address of joels local node
//var SERVER_ADDRESS = 'MAX#0x30819F300D06092A864886F70D010101050003818D0030818902818100BD6EC365409E583F8E9C7FD6E0E15CE464AED09FA4CDFCDC52958FA2A9F5F8708AB9241356F219897462662514843828118F37514636EB979AB48A7EAB60EA14D8D0E1D333509D290ADFA37610666274FAAB15709D1AA252CC8158BABC4A3DFBB4A9D7B795D8718E2E085B5E998852A1D09A887ABFAC6C26923CFD751814C4F70203010001#MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G15GUQJMSGJP765V0BW8JSNNKQN8FTZ6FRTS4HYZ2AMKFKYWS1R6ARV4CM5B7F1NN4MFBEGH3BNP20SN6UB2U21E46UC8PEKWZ1T6P1GTF76QANFERE44P8ST0E4SWFVK30N8KYF3YQ3SQ3D55JYT7S6PRPT5DA1P0PM9BSNHQ95RG6VMK244K6TCPAR3FM5R8BS8B0KPE3BUPC10608004JJCSD4@78.141.238.36:9001'; //barrys server
var SERVER_ADDRESS = 'MAX#0x30819F300D06092A864886F70D010101050003818D0030818902818100B4D30A8C0A1D1EA48DE04CA803D0A9D75453E6E9732D6575F4A06330EEF733DF7DF496E33BA46BB195C5826ED32264FE69E4C809C544F9859CF543932CB5A6ED347052F33B50F3A2D424C1BE384CA9B5E0DD0DFFECE2286E4D0311CDF30F3B5E343369CDA8AC8E5DBB1B2EDADD7E9053B9393F4AA021224BF4AA41568403D82D0203010001#MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G15GUQJMSGJP765V0BW8JSNNKQN8FTZ6FRTS4HYZ2AMKFKYWS1R6ARV4CM5B7F1NN4MFBEGH3BNP20SN6UB2U21E46UC8PEKWZ1T6P1GTF76QANFERE44P8ST0E4SWFVK30N8KYF3YQ3SQ3D55JYT7S6PRPT5DA1P0PM9BSNHQ95RG6VMK244K6TCPAR3FM5R8BS8B0KPE3BUPC10608004JJCSD4@78.141.238.36:9001';//dmax server
/* client side app draft. allows client to send requests to server and receive responses from server also allows for payment and confirmation */

/**
* Called when form is submitted
* @param amount
*/

function onSubmit(amount) {

    //get the clients contact address
    getContactAddress(function (address) {

        //create p2pidentity request
        sendMaximaMessage({ "type": "P2P_REQUEST", "data": { "amount": amount, "contact": address  } }, SERVER_ADDRESS, function (msg) {
            MDS.log("Sent P2P request to " + SERVER_ADDRESS);

            //remove the form from the UI and replace with a message
            document.getElementById("js-main").innerHTML = "Your request has been sent to the MLS server. Please wait for confirmation.";
        });
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
* Get Contact Address
* @param {*} callback
*/
function getContactAddress(callback) {
    var maxcmd = "maxima";
    MDS.cmd(maxcmd, function (msg) {
        MDS.log(`Get Contact Address: ${JSON.stringify(msg)}`);
        if (callback) {
            MDS.log(`Contact Address: ${msg.response.contact}`); 
            callback(msg.response.contact);
        }
    });
}
/**
 * Send message via Maxima to contat address or permanent address
 * @param {*} message
 * @param {*} address
 * @param {*} callback
 */
function sendMaximaMessage(message, address, callback) {
    MDS.log("Sending message to " + address);
    var maxcmd = "maxima action:send poll:true to:" + address + " application:dmax data:" + JSON.stringify(message);
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
    var maxcmd = "  send amount:" + amount + " address:" + address;
    MDS.cmd(maxcmd, function (msg) {
        MDS.log(`sendMinima function response: ${JSON.stringify(msg)}`);
        if (callback) {
            //return the coinid
            if (msg.status) {
                MDS.log(`coindid returned: ${JSON.stringify(msg.response.body.txn.outputs[0].coinid)}`);
                callback(msg.response.body.txn.outputs[0].coinid);
            } else {
                MDS.log(msg.error);
                callback(false, msg.error)
            }
        }
    });
}