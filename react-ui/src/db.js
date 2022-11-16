/* adds a listing to the database */
export function createStore(name) {
    return new Promise(function (resolve, reject) {
        let fullsql = `INSERT INTO shop (name) VALUES ('${name}');`;
        console.log(`Shop added: ${name}`);
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
        let fullsql = `INSERT INTO listing (name,price,shop_id,category_id) VALUES ('${name}','${price}','${1}', '${1}');`;
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

/* returns listing by id */
export function getListingById(id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT * FROM listing WHERE id = ${id};`, function (res) {
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