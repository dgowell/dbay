import { getHost } from "./settings";
import { send } from "../comms";
import PropTypes from "prop-types";
import { generate } from '@wcj/generate-password';


const LISTINGSTABLE = 'LISTING';

//there are 3 states 1.unknown 2.available 3.unavailable

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
        "status" char(12) not null default 'available',
        "buyer_message" varchar(1000),
        "buyer_name" char(50),
        "buyer_pk" varchar(330),
        "purchase_code" varchar(30),
        "sent" boolean default false,
        constraint UQ_listing_id unique("listing_id")
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
export function createListing({ name, price, createdByPk, createdByName, listingId, sentByName, sentByPk, walletAddress, createdAt }) {
    const randomId = Math.trunc(Math.random() * 10000000000000000);
    const id = `${randomId}${createdByPk}`;
    const timestamp = Math.floor(Date.now() / 1000);

    return new Promise(function (resolve, reject) {
        let fullsql = `insert into ${LISTINGSTABLE}
        (
            "listing_id",
            "name",
            "price",
            "created_by_pk",
            "created_by_name",
            ${sentByName ? '"sent_by_name",' : ''}
            ${sentByPk ? '"sent_by_pk",' : ''}
            "wallet_address",
             ${sentByPk ? '"status",' : ''} 
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
            ${sentByPk ? `'unknown',` : ''}
            ${createdAt ? `'${createdAt}'` : `'${timestamp}'`}

        );`;

        console.log(`name: ${name}, price: ${price}`);
        window.MDS.sql(fullsql, (res) => {
            window.MDS.log(`MDS.SQL, ${fullsql}`);
            if (res.status) {
                resolve(listingId ? listingId : id);
            } else {
                reject(res.error);
                window.MDS.log(`MDS.SQL ERROR, could not create listing ${res.error}}`);
                console.error(`MDS.SQL ERROR, could not create listing ${res.error}}`);
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
    const store = `where "created_by_pk"='${storeId}'`;
    const Q = `select * from ${LISTINGSTABLE} ${storeId ? `${store}` : ''};`
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

export function getUnavailableListings(storeId) {
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
export function updateStatus(listing_id, status) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`UPDATE ${LISTINGSTABLE} SET "status"='${status}' WHERE "listing_id"='${listing_id}';`, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(res.error);
            }
        });
    });
}

export function updateBuyerMessage(listing_id, message) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`UPDATE ${LISTINGSTABLE} SET "buyer_message"='${message}' WHERE "listing_id"='${listing_id}';`, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(res.error);
            }
        });
    });
}

export function updateListing(listing_id, key, value) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`UPDATE ${LISTINGSTABLE} SET "${key}"='${value}' WHERE "listing_id"='${listing_id}';`, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(res.error);
            }
        });
    });
}

export function resetListingState(listing_id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`UPDATE ${LISTINGSTABLE} SET "status"='unknown' WHERE "listing_id"='${listing_id}';`, function (res) {
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
            if (res.count === 1) {
                const listing = res.rows[0];
                if (listing.status === "unknown" || listing.status === "available") {
                    resolve(true);
                } else if (listing.status === "unavailable") {
                    reject(false);
                }
            } else {
                reject(res.error);
            }
        });
    });
}

export function getStatus(listing_id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "status" FROM ${LISTINGSTABLE} WHERE "listing_id"='${listing_id}';`, function (res) {
            if (res) {
                resolve(res);
            }
            else {
                reject(res.error);
            }
        });
    });
}

export function getListingByPurchaseCode(purchaseCode) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT * FROM ${LISTINGSTABLE} WHERE "purchase_code"='${purchaseCode}';`, function (res) {
            if (res.status && res.count === 1) {
                resolve(res.rows[0]);
            }
            else {
                reject(res.error);
            }
        });
    });
}

export async function processListing(entity) {

    //check it's not one of your own
    const host = await getHost();
    if (host.pk === entity.created_by_pk) {
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
    console.log(`received availability check for listing: ${entity.listing_id}`)
    const data = {
        "type": "availability_response",
        "status": "unavailable",
        "listing_id": entity.listing_id
    }
    try {
        const available = await isAvailable(entity.listing_id);
        if (available) {
            data.status = "available";
        }
        const purchaseCode = generatePurchaseCode();
        data.purchase_code = purchaseCode;
        send(data, entity.buyer_pk).then(e => {
            console.error(e);
            updateListing(entity.listing_id, "purchase_code", purchaseCode)
                .catch((e) => console.error(e));
            updateListing(entity.listing_id, "status", "unavailable")
                .catch((e) => console.error(e));
            resetListingStatusTimeout(entity.listing_id);
        });
    } catch (error) {
        console.error(error);
    };
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

function generatePurchaseCode() {
    return generate({ length: 20, special: false });
}

function resetListingStatusTimeout(listingId) {
    //after timeout time check that the listing has been sold if not reset it to available
    async function resetListing(listingId) {
        const status = await getStatus(listingId);
        if (status === 'unavailble') {
            updateListing(listingId, "status", "available")
        }
    }
    setTimeout(resetListing(listingId), 600000);
}