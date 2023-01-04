import {
    createListingTable
} from "./listing";
import {
    createSettingsTable,
    createHost
} from "./settings";
import {
    getPublicKey,
    getMaximaContactName
} from "../minima";

export async function setup() {
    //register the store name and public key
    //if no store then create it
    //store name = maxima contact name
    //store id = current public key
    let storeId = await getPublicKey();
    let storeName = await getMaximaContactName();

    //return the store name
    return new Promise((resolve, reject) => {
        createListingTable().then((r) => {
            console.log('Listing table created or exists');
            createSettingsTable().then((r) => {
                console.log('Settings table created or exists');
                createHost(storeName, storeId).then((r) => {
                    console.log('Local hosting info stored in database');
                    resolve({
                        storeName,
                        storeId
                    });
                }).catch((e) => {
                    if (e.includes('Unique index or primary key violation')){
                        resolve(true);
                    } else {
                        console.error(e);
                        reject(e);
                    }
                })
            });
        });
    });
}