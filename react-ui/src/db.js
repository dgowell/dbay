/* adds a listing to the database */
export function createStore(name) {
    return new Promise(function (resolve, reject) {
        let fullsql = `INSERT INTO store (name) VALUES ('${name}');`;
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


/* adds a listing to the database */
export function createListing(name, price) {
    return new Promise(function (resolve, reject) {
        let fullsql = `INSERT INTO listing (name,price,store_id,category_id) VALUES ('${name}','${price}','${1}', '${1}');`;
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
        window.MDS.sql(`SELECT listing_id, name, price FROM listing;`, (res) => {
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
        window.MDS.sql(`SELECT listing_id, name, price FROM listing WHERE store_id = ${storeId};`, (res) => {
            if (res.status) {
                resolve(res.rows);
            } else {
                reject(res.error);
            }
        });
    });
}


/* returns listing by id */
export function getListingById(id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT * FROM listing WHERE listing_id = ${id};`, function (res) {
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
        window.MDS.sql(`SELECT * FROM store WHERE store_id = ${id};`, function (res) {
            if (res.status) {
                if (res.count > 1) {
                    reject(`More than one store with id ${id}`, null);
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
        window.MDS.sql(`SELECT store_id, name FROM store;`, (res) => {
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
        window.MDS.sql(`SELECT name, category_id FROM category;`, (res) => {
            if (res.status) {
                resolve(res.rows);
            } else {
                reject(res.error);
            }
        });
    });
}
