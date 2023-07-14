/*
*   Send minima to a wallet address
*/

import { PropTypes } from "prop-types";

const SETTINGSTABLE = 'SETTINGS';

/* returns store by pubkey */
export function getHost() {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`select "pk", "perm_address" FROM SETTINGS;`, function (res) {
            console.log("res_Host", res);
            if (res.status && res.rows.length > 0) {
                resolve(res.rows[0]);
            } else if (res.error) {
                console.log(res.error);
                resolve("No Tables Created");
            } else {
                reject(res.error);
            }
        });
    });
}

export function getName(callback) {
    const Q = `SELECT "name" FROM ${SETTINGSTABLE};`;
    window.MDS.sql(Q, function (res) {
        window.MDS.log(`Get Name response, ${Q}`);
        callback(res.rows[0].name);
    });
};

export function checkTableExists(tableName) {
    const Q = `SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo'
               AND TABLE_NAME = '${tableName}';`;
    return new Promise(function (resolve, reject) {
        window.MDS.sql(Q, function (res) {
            if (res.status && res.results) {
                resolve(true);
            } else {
                reject(res.error);
            }
        });
    });
}

PropTypes.checkTableExists = {
    tableName: PropTypes.string.isRequired
};

export function getServerP2PIdentity() {
    const Q = `SELECT "dmax_server_p2p_identity" FROM ${SETTINGSTABLE};`;
    return new Promise(function (resolve, reject) {
        window.MDS.sql(Q, function (res) {
            if (res.status) {
                console.log("Result of getServerP2PIdentity", JSON.stringify(res.rows[0]));
                resolve(res.rows[0].dmax_server_p2p_identity);
            } else {
                reject(res.error);
            }
        }
        );
    });
}

PropTypes.getServerP2PIdentity = {
    callback: PropTypes.func.isRequired
};