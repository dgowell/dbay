import {
    createListingTable
} from "./listing";
import {
    createSettingsTable,
    createHost
} from "./settings";
import {
    getPublicKey,
    getMaximaContactName,
    getMLS
} from "../minima";

/*
*  register the store name and public key
*  if no store then create it
*  host name = maxima contact name
*  pk = current public key
*  mls  = current and permanent mls
*  permanentaddress is an address that can be used by anyone to contact the vendor
*/
export async function setup() {
    const pk = await getPublicKey();
    const mls = await getMLS();
    debugger;
    const permanentAddress = `MAX#${pk}#${mls}`;
    const hostName = await getMaximaContactName();

    //return the store name
    return new Promise((resolve, reject) => {
        createListingTable().then((r) => {
            console.log('Listing table created or exists');
            createSettingsTable().then((r) => {
                console.log('Settings table created or exists');
                createHost(hostName, permanentAddress).then((r) => {
                    console.log('Local hosting info stored in database');
                    resolve({
                        hostName,
                        permanentAddress
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