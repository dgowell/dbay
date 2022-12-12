import {
    createListingTable
} from "./listing";
import {
    createCategoryTable,
    preloadCategoryTable
} from "./category";
import {
    createStore,
    createStoresTable
} from "./store";
import {
    createSettingsTable,
    createStoreHost
} from "./settings";
import {
    getPublicKey,
    getMaximaContactName
} from "../comms";

export async function setup() {
    //register the store name and public key
    //if no store then create it
    //store name = maxima contact name
    //store id = current public key
    let storeId = await getPublicKey();
    let storeName = await getMaximaContactName();

    //return the store name
    return new Promise((resolve, reject) => {
        createCategoryTable().then(() => {
            preloadCategoryTable().then(() => {
                createStoresTable().then(() => {
                    createListingTable().then(() => {
                        createSettingsTable().then(() => {
                            createStoreHost(storeName, storeId).then(() => {
                                createStore(storeName, storeId).then(() => {
                                    resolve({storeName, storeId});
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}