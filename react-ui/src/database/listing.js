import { getHost } from "./settings";
import { send } from "../comms";
import PropTypes from "prop-types";

const LISTINGSTABLE = 'LISTING';

export function createListingTable() {
    const Q = `create table if not exists ${LISTINGSTABLE} (
        "listing_id" varchar(343) primary key,
        "name" varchar(50) NOT NULL,
        "price" INT NOT NULL,
        "created_by_pk" varchar(330) NOT NULL,
        "created_by_name" char(50),
        "sent_by_pk" varchar(330),
        "sent_by_name" char(50),
        "created_at" int not null,
        "wallet_address" varchar(80) not null,
        "status" char(12) not null default 'unknown',
        "purchase_text" varchar(1000),
        "customer_name" char(50),
        "customer_pk" varchar(330),
        constraint UQ_timestamp_and_creator unique("created_at", "created_by_pk")
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
export function createListing({name, price, createdByPk, createdByName, listingId, sentByName, sentByPk, walletAddress, createdAt}) {
    const randomId = Math.trunc(Math.random() * 10000000000000000);
    const id = `${randomId}#${createdByPk}`;
    const timestamp = Math.floor(Date.now()/1000);

    return new Promise(function (resolve, reject) {
        let fullsql =`insert into ${LISTINGSTABLE}
        (
            "listing_id",
            "name",
            "price",
            "created_by_pk",
            "created_by_name",
            ${sentByName ? '"sent_by_name",' : ''}
            ${sentByPk ? '"sent_by_pk",' : ''}
            "wallet_address",
            "created_at"
        )

        values(
            ${listingId ? `'${listingId}',` : `'${id}',`}
            '${name}',
            '${price}',
            '${createdByPk}',
            '${createdByName}',
            ${sentByName ? `'${sentByName}',` : ''}
            ${sentByPk ? `'${sentByPk}',` : ''}
            '${walletAddress}',
            ${createdAt ? `'${createdAt}'` : `'${timestamp}'`}
        );`;

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
createListing.propTypes = {
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    createdByPk: PropTypes.string.isRequired,
    createdByName: PropTypes.string.isRequired,
    listingId: PropTypes.string,
    sentByName: PropTypes.string,
    sentByPk: PropTypes.string,
    walletAddress: PropTypes.string.isRequired,
    createdAt: PropTypes.number
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
    const store = `"created_by_pk"='${storeId}' and`;
    const Q = `select "listing_id", "name", "price" from ${LISTINGSTABLE} where ${storeId ? `${store}` : ''} "status"='unknown';`
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

export function getUnavailableListings(storeId){
    let Q;
    if (storeId) {
        Q = `select "listing_id", "name", "price" from ${LISTINGSTABLE} where "created_by_pk"='${storeId}' and "status"='unavailable';`
    } else {
        Q = `select "listing_id", "name", "price" from ${LISTINGSTABLE} where "status"='unavailable';`
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

/* Updates the listing as instatus so that it can be taken off the listings page */
function deactivateListing(id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`UPDATE ${LISTINGSTABLE} SET "status"='' WHERE "listing_id"='${id}';`, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(res.error);
            }
        });
    });
}


function isAvailable(listing_id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "status" FROM ${LISTINGSTABLE} WHERE "listing_id"='${listing_id}';`, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(res.error);
            }
        });
    });
}

export async function processListing(entity){

    //check it's not one of your own
    const host = await getHost();
    if (host.pk === entity.created_by_pk){
        return;
    }

    createListing({
        listingId: entity.listing_id,
        name: entity.name,
        price: entity.price,
        createdByPk: entity.created_by_pk,
        createdByName: entity.created_by_name,
        sentByName: entity.sent_by_name,
        sentByPk: entity.sent_by_pk,
        walletAddress: entity.wallet_address,
        createdAt: entity.created_at
    }).then(() => {
        console.log(`Listing ${entity.name} added!`);
    }).catch((e) => console.error(`Could not create listing: ${e}`));
}
 export async function processAvailabilityCheck(entity) {
    const data = {
        "type": "availability_response",
        "status": "unavailable",
        "listing_id": entity.listing_id
    }
    const available = await isAvailable(entity.listing_id);
    if (available) {
        data.status = true;
    }
    send(data, entity.customer_pk).then(e => {
        console.log(e);
    });
 }

/* This function hadles what happens when you purchase a listing */
export function handlePurchase(listingId) {
    //set listing to purchuarse_requested

    //options:
    //1. remove the item from the listing
    //2. flag the item as purchased
    //update value in listing directly
    //deactivateListing(listingId).then((r)=> {
    //    console.log(r);
    //})

}