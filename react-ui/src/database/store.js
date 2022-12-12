const STORESTABLE = 'STORE';

export function createStoresTable() {
    const Q = `create table if not exists ${STORESTABLE} (
            "store_id" int auto_increment primary key,
            "store_pubkey" varchar(330) NOT NULL,
            "name" CHAR(50) NOT NULL,
            CONSTRAINT AK_store_name UNIQUE("name"),
            CONSTRAINT AK_store_publickey UNIQUE("store_pubkey")
            )`;

    return new Promise((resolve, reject) => {
        window.MDS.sql(Q, function (res) {
            window.MDS.log(`MDS.SQL, ${Q}`);
            console.log(res);
            if (res.status) {
                resolve(true)
            } else {
                reject(`${res.error}`);
            }
        })
    })
}

/* adds a listing to the database */
export async function createStore(name, storeId) {
    return new Promise(function (resolve, reject) {
        let fullsql = `insert into ${STORESTABLE}("name", "store_pubkey") values('${name}', '${storeId}');`;
        console.log(`Store added: ${name}`);
        window.MDS.sql(fullsql, (res) => {
            if (res.status) {
                resolve(true);
            } else {
                reject(res.error);
            }
        });
    });
}
/* returns store by id */
export function getStoreById(id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "store_id", "store_pubkey", "name" FROM ${STORESTABLE} WHERE "store_id"='${id}';`, function (res) {
            if (res.status) {
                if (res.count > 1) {
                    reject(`More than one store with id: ${id}`, null);
                } else {
                    resolve(res.rows[0]);
                }
            } else {
                reject(res.error);
            }
        });
    });
}

/* returns store by pubkey */
export function getStoreByPubkey(id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "store_id", "store_pubkey", "name" FROM ${STORESTABLE} WHERE "store_pubkey"='${id}';`, function (res) {
            if (res.status) {
                if (res.count === 0) {
                    resolve('No stores with that public key');
                }
                if (res.count > 1) {
                    reject(`More than one store with publickey: ${id}`, null);
                } else {
                    resolve(res.rows[0]);
                }
            } else {
                reject(res.error);
            }
        });
    });
}

/* retrieves all listings */
export function getAllStores() {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "store_id", "store_pubkey", "name" FROM ${STORESTABLE};`, (res) => {
            if (res.status) {
                resolve(res.rows);
            } else {
                reject(res.error);
            }
        });
    });
}