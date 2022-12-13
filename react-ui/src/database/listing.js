import { getHostStore } from "./settings";
import { getStoreByPubkey, createStore } from "./store";

const LISTINGSTABLE = 'LISTING';

export function createListingTable() {
    const Q = `create table if not exists ${LISTINGSTABLE} (
        "listing_id" int auto_increment primary key,
        "name" varchar(50) NOT NULL,
        "price" INT NOT NULL,
        "created_by_pk" varchar(330) NOT NULL,
        "created_by_name" char(50),
        "created_at" timestamp with time zone not null,
        "sent_by_pk" varchar(330),
        "sent_by_name" char(50),
        "category_id" INT NOT NULL,
        constraint UQ_listing_name_and_store unique("name", "created_by_pk"),
        CONSTRAINT FK_FROM_listing_TO_store FOREIGN KEY("created_by_pk") REFERENCES store("store_pubkey"),
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
export function createListing({name, price, category, createdByPk, createdByName, listingId, sentByName, sentByPk}) {
    return new Promise(function (resolve, reject) {
        let fullsql =`insert into ${LISTINGSTABLE}
        ("name",
        "price",
        "category_id",
        "created_by_pk",
        "created_by_name",
        ${listingId ? '"listing_id",' : ''}
        ${sentByName ? '"sent_by_name",' : ''}
        ${sentByPk ? '"sent_by_pk",' : ''}
        "created_at")

        values('${name}',
        '${price}',
        '${category}',
        '${createdByPk}',
        '${createdByName}',
        ${listingId ? `'${listingId}',` : ''}
        ${sentByName ? `'${sentByName}',` : ''}
        ${sentByPk ? `'${sentByPk}',` : ''}
        CURRENT_TIMESTAMP);`;

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
        window.MDS.sql(`select "listing_id", "name", "price" from ${LISTINGSTABLE};`, (res) => {
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
        Q = `select "listing_id", "name", "price" from ${LISTINGSTABLE} where "created_by_pk"='${storeId}';`
    } else {
        Q = `select "listing_id", "name", "price" from ${LISTINGSTABLE};`
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

export async function processListing(entity){

    //check it's not one of your own
    const host = await getHostStore();
    if (host.host_store_pubkey === entity.created_by_pk){
        return;
    }

    //create store if you don't already have it
    try {
        const res = await getStoreByPubkey(entity.created_by_pk);
        if (res === 'No stores with that public key') {
            await createStore(entity.created_by_name, entity.created_by_pk);
        }
    }
    catch (err) {
        alert(err); // TypeError: failed to fetch
    }

    createListing({
        name: entity.name,
        price: entity.price,
        category: entity.category_id,
        createdByPk: entity.created_by_pk,
        createdByName: entity.created_by_name,
        sentByName: entity.sent_by_name,
        sentByPk: entity.sent_by_pk
    }).then(() => {
        console.log(`Listing ${entity.name} added!`);
    }).catch((e) => console.error(`Could not create listing: ${e}`));
}