import { getHostStore } from "./settings";

const LISTINGSTABLE = 'LISTING';

export function createListingTable() {
    const Q = `create table if not exists ${LISTINGSTABLE} (
        "listing_id" int auto_increment primary key,
        "name" varchar(50) NOT NULL,
        "price" INT NOT NULL,
        "created_by_pk" varchar(330) NOT NULL,
        "created_by_name" char(50),
        "sent_by_pk" varchar(330),
        "sent_by_name" char(50),
        "created_at" int not null,
        "wallet_address" varchar(80) not null,
        "active" boolean default TRUE,
        "purchase_requested" boolean default FALSE,
        "purchase_text" varchar(1000),
        "customer_name" char(50),
        "customer_pk" varchar(330),
        "merchant_confirmed" boolean default FALSE,
        "payment_sent" boolean default FALSE,
        "payment_received" boolean default FALSE,
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
    const timestamp = Math.floor(Date.now()/1000);
    return new Promise(function (resolve, reject) {
        let fullsql =`insert into ${LISTINGSTABLE}
        (
            "name",
            "price",
            "created_by_pk",
            "created_by_name",
            ${listingId ? '"listing_id",' : ''}
            ${sentByName ? '"sent_by_name",' : ''}
            ${sentByPk ? '"sent_by_pk",' : ''}
            ${walletAddress ? '"wallet_address",' : ''}
            "created_at"
        )

        values(
            '${name}',
            '${price}',
            '${createdByPk}',
            '${createdByName}',
            ${listingId ? `'${listingId}',` : ''}
            ${sentByName ? `'${sentByName}',` : ''}
            ${sentByPk ? `'${sentByPk}',` : ''}
            ${walletAddress ? `'${walletAddress}',` : ''}
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
    const Q = `select "listing_id", "name", "price" from ${LISTINGSTABLE} where ${storeId ? `${store}` : ''} "active"='TRUE';`
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

export function getInactiveListings(storeId){
    let Q;
    if (storeId) {
        Q = `select "listing_id", "name", "price" from ${LISTINGSTABLE} where "created_by_pk"='${storeId}' and "active"='FALSE';`
    } else {
        Q = `select "listing_id", "name", "price" from ${LISTINGSTABLE} where "active"='FALSE';`
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

/* Updates the listing as inactive so that it can be taken off the listings page */
function deactivateListing(id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`UPDATE ${LISTINGSTABLE} SET "active"='FALSE' WHERE "listing_id"='${id}';`, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(res.error);
            }
        });
    });
}

function setPurchaseRequested({createdAt, msg, customerName, customerPk}) {
    const Q = `UPDATE ${LISTINGSTABLE} SET "purchase_requested"=TRUE, "purchase_text"='${msg}', "customer_name"='${customerName}', "customer_pk"='${customerPk}' WHERE "created_at"=${createdAt};`
    return new Promise(function (resolve, reject) {
        window.MDS.sql(Q, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(res.error);
            }
        });
    });
}

function updatePurchaseRequested({ id }) {
    const Q = `UPDATE ${LISTINGSTABLE} SET "purchase_requested"='TRUE' WHERE "listing_id"='${id}';`
    return new Promise(function (resolve, reject) {
        window.MDS.sql(Q, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(res.error);
            }
        });
    });
}

function isActive(createdAt) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "active" FROM ${LISTINGSTABLE} WHERE "created_at"='${createdAt}';`, function (res) {
            if (res.status) {
                resolve(res);
            } else {
                reject(res.error);
            }
        });
    });
}

export function updateMerchantConfirmation(id) {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`UPDATE ${LISTINGSTABLE} SET "merchant_confirmed"='TRUE' WHERE "listing_id"='${id}';`, function (res) {
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
    const host = await getHostStore();
    if (host.host_store_pubkey === entity.created_by_pk){
        return;
    }

    createListing({
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
 export async function processPurchaseRequest(entity) {
    //check product is active on merchant side
    //if no return message sayting product is not active
    //if yes get merchant to confirm that the product can be sent
    //by setting purchase_reuqest flag
    if (await isActive(entity.created_at)) {
        setPurchaseRequested({
            createdAt: entity.created_at,
            msg: entity.message,
            customerName: entity.customer_name,
            customerPk: entity.customer_pk
        }).then()
    } else {
        //send message to consumer that the product is no longer available
    }
 }


/* This function hadles what happens when you purchase a listing */
export function handlePurchase(listingId) {
    //set listing to purchase_requested
    updatePurchaseRequested({id: listingId}).then(()=>{
        console.log("set purchase requested");
    })
    //options:
    //1. remove the item from the listing
    //2. flag the item as purchased
    //update value in listing directly
    //deactivateListing(listingId).then((r)=> {
    //    console.log(r);
    //})

}