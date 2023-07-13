import PropTypes from "prop-types";
import { getHost } from "./settings";
import { getPublicKey } from "../minima";

const LISTINGSTABLE = 'LISTING';
const logs = process.env.REACT_APP_LOGS;

/* adds a listing to the database */

export async function createListing({
    title,
    price,
    createdByPk,
    createdByName,
    sellerHasPermAddress,
    sellerPermAddress,
    listingId,
    sentByName,
    sentByPk,
    walletAddress,
    createdAt,
    image,
    description,
    collection,
    delivery,
    location,
    locationDescription,
    shippingCost,
}) {
    let id = '';
    if (!listingId) {
        const randomId = Math.trunc(Math.random() * 10000000000000000);
        const pk = await getPublicKey();
        id = `${randomId}${pk}`;
    }
    const timestamp = Math.floor(Date.now() / 1000);

    return new Promise(function (resolve, reject) {
        let fullsql = `insert into ${LISTINGSTABLE}
        (
            "listing_id",
            "title",
            "price",
            "collection",
            "delivery",
            "created_by_pk",
            "created_by_name",
            "seller_has_perm_address",
            ${sellerHasPermAddress ? '"seller_perm_address",' : ''}
            ${sentByName ? '"sent_by_name",' : ''}
            ${sentByPk ? '"sent_by_pk",' : ''}
            "wallet_address",
             ${sentByPk ? '"status",' : ''}
            "image",
            "description",
            ${location ? '"location",' : ''}
            ${locationDescription ? '"location_description",' : ''}
            ${(typeof shippingCost === 'number') ? '"shipping_cost",' : ''}
            "created_at"
        )

        values(
            ${listingId ? `'${listingId}',` : `'${id}',`}
            '${title}',
            '${price}',
            '${collection}',
            '${delivery}',
            '${createdByPk}',
            '${createdByName}',
            '${sellerHasPermAddress}',
            ${sellerHasPermAddress ? `'${sellerPermAddress}',` : ''}
            ${sentByName ? `'${sentByName}',` : ''}
            ${sentByPk ? `'${sentByPk}',` : ''}
            '${walletAddress}',
            ${sentByPk ? `'unchecked',` : ''}
            '${image}',
            '${description}',
            ${location ? `'${location}',` : ''}
            ${locationDescription ? `'${locationDescription}',` : ''}
            ${(typeof shippingCost === 'number') ? `'${shippingCost}',` : ''}
            ${createdAt ? `'${createdAt}'` : `'${timestamp}'`}
        );`;

        console.log(`title: ${title}, price: ${price}`);
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
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    createdByPk: PropTypes.string.isRequired,
    createdByName: PropTypes.string.isRequired,
    sellerHasPermAddress: PropTypes.bool,
    sellerPermAddress: PropTypes.string,
    listingId: PropTypes.string,
    sentByName: PropTypes.string,
    sentByPk: PropTypes.string,
    walletAddress: PropTypes.string.isRequired,
    createdAt: PropTypes.number,
    image:PropTypes.string,
    description:PropTypes.string,
    location:PropTypes.string,
    locationDescription: PropTypes.string,
    shippingCost:PropTypes.number,
    shippingCountries:PropTypes.string
}


/**
* Fetches all listings listings using a particular Id
* @param {string} pk - The id of the creator
*/
export function getListings(pk) {
    //order them by latest at the top
    const store = `where "created_by_pk"='${pk}' order by "created_at" desc`;
    const Q = `select * from ${LISTINGSTABLE} ${pk ? `${store}` : ''};`
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
* Fetches all listings listings using a particular Id
* @param {string} pk - The id of the creator
*/
export function getAvailableListings(pk) {
    const store = `where "created_by_pk"='${pk}' and "status"='unchecked' or "status"='available'`;
    const Q = `select * from ${LISTINGSTABLE} ${pk ? `${store}` : ''};`
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
export function getMyPurchases(pk) {
    //order by most recent first
    const Q = `SELECT * FROM ${LISTINGSTABLE} WHERE "created_by_pk" <> '${pk}' AND ("status" = 'completed' OR "status" = 'in_progress' OR "status" = 'pending_confirmation' OR "status" = 'collection_rejected') ORDER BY "created_at" DESC;`;

    return new Promise((resolve, reject) => {
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
* Fetches created_by_name from listing
* @param {string} id - The id of the listing
*/
export function getCreatedByNameById(id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT 'created_by_name' FROM ${LISTINGSTABLE} WHERE "listing_id"='${id}';`, function (res) {
            if (res.status) {
                if (res.count > 1) {
                    reject(`More than one listing with id ${id}`, null);
                } else {
                    resolve(res.rows[0]);
                }
            } else {
                reject(Error(`MDS.SQL ERROR, could not get created by name by Id ${res.error}`));
                window.MDS.log(`MDS.SQL ERROR, could not get create by name by Id ${res.error}`);
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

export function updateListing(listingId, data) {
    return new Promise(function (resolve, reject) {
        //loop through data object and return all values in one long string
        var formattedData = '';

        var keys = Object.keys(data);
        var totalKeys = keys.length;

        for (var i = 0; i < totalKeys; i++) {
            var key = keys[i];

            // Check if it's the last iteration
            if (i === totalKeys - 1) {
                formattedData += `"${key}"='${data[key]}'`;
            } else {
                formattedData += `"${key}"='${data[key]}',`;
            }
        }
        window.MDS.sql(`UPDATE ${LISTINGSTABLE} SET ${formattedData} WHERE "listing_id"='${listingId}';`, function (res) {
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
            if (res.status) {
                resolve(res.rows[0]);
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
        title: entity.title,
        price: entity.price,
        createdByPk: entity.created_by_pk,
        createdByName: entity.created_by_name,
        sentByName: entity.sent_by_name,
        sentByPk: entity.sent_by_pk,
        walletAddress: entity.wallet_address,
        createdAt: entity.created_at,
        image:entity.image,
        description:entity.description,
        collection:entity.collection,
        delivery:entity.delivery,
        location:entity.location,
        locationDescription:entity.location_description,
        shippingCost:entity.shipping_cost,
        shippingCountries:entity.shipping_countries
    }).then(() => {
        console.log(`Listing ${entity.title} added!`);
    }).catch((e) => console.error(`Could not create listing: ${e}`));
}
processListing.PropTypes = {
    entity: PropTypes.object.isRequired
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


export function getListingIds(seller_address, callback) {
    window.MDS.sql(`SELECT "listing_id" FROM ${LISTINGSTABLE} WHERE "created_by_pk"='${seller_address}';`, function (res) {
        if (res.status) {
            if (res.rows.length > 0) {
                if (logs) { window.MDS.log(`MDS.SQL, SELECT "listing_id" FROM ${LISTINGSTABLE} WHERE "seller_permanent_address"='${seller_address}';`); }
                callback(res.rows);
            } else {
                if (logs) { window.MDS.log(`MDS.SQL, SELECT "listing_id" FROM ${LISTINGSTABLE} WHERE "seller_permanent_address"='${seller_address}';`); }
                callback(null);
            }
        } else {
            if (logs) { window.MDS.log(`MDS.SQL ERROR, could get listing ids ${res.error}`); }
            callback(false, (Error(`Couldn't fetch listing ids ${res.error}`)));
        }
    });
}