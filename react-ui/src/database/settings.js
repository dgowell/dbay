const SETTINGSTABLE = 'SETTINGS';

export function createSettingsTable() {
    const Q = `create table if not exists ${SETTINGSTABLE} (
        "host_store_pubkey" varchar(330),
        "host_store_name" varchar(50),
        CONSTRAINT AK_host_store_name UNIQUE("host_store_name"),
        CONSTRAINT AK_host_store_publickey UNIQUE("host_store_pubkey")
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

/* adds a setting to the database */
export async function createStoreHost(name, storeId) {
    return new Promise(function (resolve, reject) {
        let fullsql = `insert into ${SETTINGSTABLE}("host_store_name", "host_store_pubkey") values('${name}', '${storeId}');`;
        console.log(`Store added to settings: ${name}`);
        window.MDS.sql(fullsql, (res) => {
            if (res.status) {
                resolve(true);
            } else {
                reject(res.error);
            }
        });
    });
}

/* returns store by pubkey */
export function getHostStore() {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`select "host_store_pubkey", "host_store_name" FROM SETTINGS;`, function (res) {
            if (res.status && res.count === 1) {
                resolve(res.rows[0]);
            } else if (res.error.includes('Table \"SETTINGS\" not found')) {
                resolve("No Tables Created");
            } else {
                reject(res.error);
            }
        });
    });
}