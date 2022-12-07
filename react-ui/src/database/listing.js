
const LISTINGSTABLE = 'LISTING';

export function createListingTable() {
    const Q = `create table if not exists ${LISTINGSTABLE} (
        "listing_id" int auto_increment primary key,
        "name" varchar(50) NOT NULL,
        "price" INT NOT NULL,
        "store_pubkey" varchar(330) NOT NULL,
        "category_id" INT NOT NULL,
        CONSTRAINT FK_FROM_listing_TO_store FOREIGN KEY("store_pubkey") REFERENCES store("store_pubkey"),
        CONSTRAINT FK_FROM_listing_TO_category FOREIGN KEY("category_id") REFERENCES category("category_id")
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
export function createListing(name, price, category, store, listingId) {
    return new Promise(function (resolve, reject) {
        let fullsql = listingId ? `insert into ${LISTINGSTABLE}("name","price","category_id","store_pubkey","listing_id") values('${name}','${price}','${category}', '${store}', '${listingId}');` :
            `insert into ${LISTINGSTABLE}("name","price","category_id","store_pubkey") values('${name}','${price}','${category}', '${store}');`;
        console.log(`name: ${name}, price: ${price}`);
        window.MDS.sql(fullsql, (res) => {
            window.MDS.log(`MDS.SQL, ${fullsql}`);
            if (res.status) {
                resolve(true);
            } else {
                reject(res.error);
                window.MDS.log(`MDS.SQL ERROR, ${res.error}}`);
            }
        });
    });
}

/* retrieves all listings */
export function getAllListings() {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`selkect "listing_id", "name", "price" from ${LISTINGSTABLE};`, (res) => {
            if (res.status) {
                resolve(res.rows);
            } else {
                reject(res.error);
            }
        });
    });
}

/* retrieves all listings */
export function getListings(storeId) {
    let Q;
    if (storeId) {
        Q = `SELECT "listing_id", "name", "price" FROM ${LISTINGSTABLE} WHERE "store_pubkey"='${storeId}';`
    } else {
        Q = `SELECT "listing_id", "name", "price" FROM ${LISTINGSTABLE};`
    }
    return new Promise(function (resolve, reject) {
        window.MDS.sql(Q, (res) => {
            if (res.status) {
                resolve(res.rows);
            } else {
                reject(res.error);
            }
        });
    });
}


/* returns listing by id has to be passed store id too*/
export function getListingById(id, storeId) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT * FROM ${LISTINGSTABLE} WHERE "listing_id"="${id}" AND "store_pubkey"=${storeId};`, function (res) {
            if (res.status) {
                if (res.count > 1) {
                    reject(`More than one listing with id ${id}`, null);
                } else {
                    resolve(res.rows[0]);
                }
            } else {
                reject(res.error);
            }
        });
    });
}