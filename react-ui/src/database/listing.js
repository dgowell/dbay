
const LISTINGSTABLE = 'LISTING';

export function createListingTable() {
    const Q = `create table if not exists ${LISTINGSTABLE} (
        "listing_id" int auto_increment primary key,
        "name" varchar(50) NOT NULL,
        "price" INT NOT NULL,
        "created_by" varchar(330) NOT NULL,
        "created_at" timestamp with time zone not null,
        "sent_by" varchar(330),
        "sent_by_name" char(50),
        "category_id" INT NOT NULL,
        constraint UQ_listing_id_and_store unique("listing_id", "created_by"),
        CONSTRAINT FK_FROM_listing_TO_store FOREIGN KEY("created_by") REFERENCES store("store_pubkey"),
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
        let fullsql = listingId ? `insert into ${LISTINGSTABLE}("name","price","category_id","created_by","listing_id", "created_at") values('${name}','${price}','${category}', '${store}', '${listingId}', CURRENT_TIMESTAMP);` :
            `insert into ${LISTINGSTABLE}("name","price","category_id","created_by", "created_at") values('${name}','${price}','${category}', '${store}', CURRENT_TIMESTAMP);`;
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
        Q = `SELECT "listing_id", "name", "price" FROM ${LISTINGSTABLE} WHERE "created_by"='${storeId}';`
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
export function getListingById(id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT * FROM ${LISTINGSTABLE} WHERE "listing_id"='${id}';`, function (res) {
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