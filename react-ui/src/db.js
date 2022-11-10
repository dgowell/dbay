/* adds a listing to the database */
export function createListing(name, price, listingCallback) {
    let fullsql = `INSERT INTO listings (name,price) VALUES ('${name}','${price}');`;
    console.log(`name: ${name}, price: ${price}`);
    window.MDS.sql(fullsql, (res) => {
        if (res.status){
            listingCallback(null, true);
        } else {
           listingCallback(res.error, null);
        }
    });
}

/* retrieves all listings */
export function getAllListings(allListingsCallback) {
    window.MDS.sql(`SELECT id, name, price FROM listings;`, (res) =>{
        if (res.status) {
            allListingsCallback(null, res.rows);
        } else {
            allListingsCallback(res.error, null);
        }
    });
}

export function getListingById(id, listingsIdCallback) {
    window.MDS.sql(`SELECT * FROM listings WHERE id = ${id};`, function (res) {
        if (res.status) {
            if (res.count >1) {
                listingsIdCallback(`More than one listing with id ${id}`, null);
            } else {
                listingsIdCallback(null, res.rows[0]);
            }
        } else {
            listingsIdCallback(res.error, null);
        }
    });
}