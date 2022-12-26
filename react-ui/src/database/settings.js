const SETTINGSTABLE = 'SETTINGS';

export function createSettingsTable() {
    const Q = `create table if not exists ${SETTINGSTABLE} (
        "pk" varchar(330),
        "name" varchar(50),
        CONSTRAINT AK_name UNIQUE("name"),
        CONSTRAINT AK_pk UNIQUE("pk")
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
export async function createHost(name, pk) {
    return new Promise(function (resolve, reject) {
        let fullsql = `insert into ${SETTINGSTABLE}("name", "pk") values('${name}', '${pk}');`;
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
export function getHost() {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`select "pk", "name" FROM SETTINGS;`, function (res) {
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