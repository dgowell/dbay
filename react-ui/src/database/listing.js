
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