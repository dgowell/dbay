const SETTINGSTABLE = 'SETTINGS';

/* returns store by pubkey */
export function getHost() {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`select "pk", "perm_address" FROM SETTINGS;`, function (res) {
            console.log("res_Host",res);
            if (res.status && res.count === 1) {
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

/*
*   Send minima to a wallet address
*/

export function getServerP2PIdentity() {
    const Q = `SELECT "dmax_server_p2p_identity" FROM ${SETTINGSTABLE};`;
    return new Promise(function (resolve, reject) {
        window.MDS.sql(Q, function (res) {
            if (res.status) {
                console.log("Result of getServerP2PIdentity", JSON.stringify(res.rows[0]));
                resolve(res.rows[0]);
            } else {
                reject(res.error);
            }
        }
        );
    });
}
