import PropTypes from "prop-types";
import { getHost } from "./settings";

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
        "status" char(12) not null default 'available',
        "buyer_message" varchar(1000),
        "buyer_name" char(50),
        "buyer_pk" varchar(330),
        "purchase_code" varchar(30),
        "coin_id" varchar(80),
        "notification" boolean default false,
        constraint UQ_listing_id unique("listing_id")
        )`;

    return new Promise((resolve, reject) => {
        window.MDS.sql(Q, function (res) {
            window.MDS.log(`MDS.SQL, ${Q}`);
            console.log(res);
            if (res.status) {
                resolve(true)
            } else {
                reject(Error(`Creating listing tables ${res.error}`));
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
            ${sentByPk ? `'unchecked',` : ''}
            ${createdAt ? `'${createdAt}'` : `'${timestamp}'`}

        );`;

        console.log(`name: ${name}, price: ${price}`);
        window.MDS.sql(fullsql, (res) => {
            window.MDS.log(`MDS.SQL, ${fullsql}`);
            if (res.status) {
                resolve(listingId ? listingId : id);
            } else {
                reject(Error(res.error));
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

/**
* Fetches all listings listings using a particular Id
* @param {string} storeId - The Id of the store/creator
*/
export function getListings(storeId) {
    const store = `where "created_by_pk"='${storeId}'`;
    const Q = `select * from ${LISTINGSTABLE} ${storeId ? `${store}` : ''};`
    return new Promise(function (resolve, reject) {
        window.MDS.sql(Q, (res) => {
            if (res.status) {
                resolve(res.rows);
            } else {
                reject(Error(`MDS.SQL ERROR, could get listings ${res.error}`));
                window.MDS.log(`MDS.SQL ERROR, could get listings ${res.error}`);
            }
        });
    });
}
getListings.propTypes = {
    storeId: PropTypes.string,
}

/**
* Fetches all listings that are the user has purchased
*/
export function getMyPurchases() {
    const Q = `select "listing_id", "name", "price" from ${LISTINGSTABLE} where "status"='purchased';`
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


/**
* Fetches a listing with a particular Id
* @param {string} id - The id of the listing
*/
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
                reject(Error(`MDS.SQL ERROR, could get listing by Id ${res.error}`));
                window.MDS.log(`MDS.SQL ERROR, could get listing by Id ${res.error}`);
            }
        });
    });
}
getListingById.propTypes = {
    id: PropTypes.string.isRequired,
}


/**
* Fetches a listing using a pourchase code
* @param {string} purchaseCode - Code created by selller and given to buyer to confirm transaction
*/
export function getListingByPurchaseCode(purchaseCode) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT * FROM ${LISTINGSTABLE} WHERE "purchase_code"='${purchaseCode}';`, function (res) {
            if (res.status && res.count === 1) {
                resolve(res.rows[0]);
            }
            else {
                reject(Error(`MDS.SQL ERROR, could get listings ${res.error}`));
                window.MDS.log(`MDS.SQL ERROR, could get listings ${res.error}`);
            }
        });
    });
}
getListingByPurchaseCode.propTypes = {
    purchaseCode: PropTypes.string.isRequired
}

/**
* Updates a listing with given key and value
* @param {string} listingId - The id of the listing
* @param {string} key - The key in the database
* @param {string} value - The value that's being updated
*/
export function updateListing(listingId, key, value) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`UPDATE ${LISTINGSTABLE} SET "${key}"='${value}' WHERE "listing_id"='${listingId}';`, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(Error(`MDS.SQL ERROR, could get update listing ${res.error}`));
                window.MDS.log(`MDS.SQL ERROR, could get update listing ${res.error}`);
            }
        });
    });
}
updateListing.PropTypes = {
    listingId: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
}


/**
* Deletes a listing with given id
* @param {string} listingId - The id of the listing
*/
export function deleteListing(listingId) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`DELETE FROM ${LISTINGSTABLE} WHERE "listing_id"='${listingId}';`, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(Error(`MDS.SQL ERROR, could not delete listing ${res.error}`));
                window.MDS.log(`MDS.SQL ERROR, could not delete listing ${res.error}`);
            }
        });
    });
}
updateListing.PropTypes = {
    listingId: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
}

/**
* Sets a listing to unchecked
* @param {string} listingId - The id of the listing
*/
export function resetListingState(listingId) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`UPDATE ${LISTINGSTABLE} SET "status"='unchecked' WHERE "listing_id"='${listingId}';`, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(Error(`MDS.SQL ERROR, could get reset listing state ${res.error}`));
                window.MDS.log(`MDS.SQL ERROR, could get reset listing state ${res.error}`);
            }
        });
    });
}
resetListingState.proptypes = {
    listingId: PropTypes.string.isRequired
}


/**
* Returns the stratus of a a listing
* @param {string} listingId - The id of the listing
*/
export function getStatus(listingId) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "status" FROM ${LISTINGSTABLE} WHERE "listing_id"='${listingId}';`, function (res) {
            if (res) {
                resolve(res);
            }
            else {
                reject(`MDS.SQL ERROR, could get status of listing ${res.error}`);
                window.MDSlog(`MDS.SQL ERROR, could get status of listing ${res.error}`);
            }
        });
    });
}
getStatus.proptypes = {
    listingId: PropTypes.string.isRequired
}


export function removeListing(listingId) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`DELETE FROM ${LISTINGSTABLE} WHERE "listing_id"='${listingId}';`, function (res) {
            if (res.status === true) {
                resolve(true);
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

/**
* Returns the status of notification on a a listing
* @param {string} listingId - The id of the listing
*/
export function getNotificationStatus(listingId) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "notification" FROM ${LISTINGSTABLE};`, function (res) {
            if (res) {
                const isTrue = (element) => element.notification === 'true';
                const results = res.rows.some(isTrue);
                //get all notification statuses
                //if at least one if true
                console.log(results);
                //return true
                return results ? resolve(true) : resolve(false);
            }
            else {
                reject(`MDS.SQL ERROR, could get status of listing ${res.error}`);
                window.MDSlog(`MDS.SQL ERROR, could get status of listing ${res.error}`);
            }
        });
    });
}
getNotificationStatus.proptypes = {
    listingId: PropTypes.string.isRequired
}