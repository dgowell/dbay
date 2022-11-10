//Insert into the DB
export function createListing(name, price, listingCallback) {

    let fullsql = `INSERT INTO listings (name,price) VALUES ('${name}','${price}')`;
    console.log(`name: ${name}, price: ${price}`);
    window.MDS.sql(fullsql, (res) => {
        if (res.status){
            listingCallback(null, true);
        } else {
           listingCallback(res, null);
        }
    });
}

export function readListing(data) {
    //Load the last message in each room..
    window.MDS.sql(`SELECT name, price FROM listings;`, function (sqlmsg) {
        //Get the data
        if (sqlmsg) {
            data(sqlmsg.rows);
        } else {
            console.error("Cannot select from listings");
        }
    });
}

export function getListingById(id, data) {
    window.MDS.sql(`SELECT * FROM listings WHERE id = ${id}`, function (sqlmsg) {
        if (sqlmsg) {
            data(sqlmsg.rows);
        }
    });
}