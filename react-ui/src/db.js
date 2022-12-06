



/* adds a listing to the database */
export function createListing(name, price, category, store, listingId) {
    return new Promise(function (resolve, reject) {
        let fullsql = listingId ? `INSERT INTO "listing" ("name","price","category_id","store_pubkey","listing_id") VALUES ("${name}","${price}","${category}", "${store}", "${listingId}");`
        : `INSERT INTO listing ("name","price","category_id","store_pubkey") VALUES ("${name}","${price}","${category}", "${store}");`;
        console.log(`name: ${name}, price: ${price}`);
        window.MDS.sql(fullsql, (res) => {
            if (res.status) {
                resolve(true);
            } else {
                reject(res.error);
            }
        });
    });
}

/* retrieves all listings */
export function getAllListings() {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "listing_id", "name", "price" FROM "listing";`, (res) => {
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
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "listing_id", "name", "price" FROM "listing" WHERE "store_pubkey"="${storeId}";`, (res) => {
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
        window.MDS.sql(`SELECT * FROM "listing" WHERE "listing_id"="${id}" AND "store_pubkey"=${storeId};`, function (res) {
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

/* returns store by id */
export function getStoreById(id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "store_id", "store_pubkey", "name" FROM "store" WHERE "store_id"="${id}";`, function (res) {
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
        window.MDS.sql(`SELECT "store_id", "store_pubkey", "name" FROM "store" WHERE "store_pubkey"="${id}";`, function (res) {
            if (res.status) {
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
        window.MDS.sql(`SELECT "store_id", "store_pubkey", "name" FROM "store";`, (res) => {
            if (res.status) {
                resolve(res.rows);
            } else {
                reject(res.error);
            }
        });
    });
}

/* retrieves all categories */
export function getCategories() {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "name", "category_id" FROM "category";`, (res) => {
            if (res.status) {
                resolve(res.rows);
            } else {
                reject(res.error);
            }
        });
    });
}

