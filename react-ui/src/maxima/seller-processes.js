import PropTypes from 'prop-types';
import { send } from './index';
import { updateListing, getStatus, getListingByPurchaseCode} from '../database/listing';
import { buyerConstants } from '../constants';

/**
* Sends availablity check to the seller node then checks the databse for an updated response
* @param {string} seller - Sellers hex address
* @param {string} buyerPk - Buyers primary key to identify the buyer
* @param {string} listingId - The id of the listing that is being purchased
*/
export function checkAvailability({
    seller,
    buyerPk,
    listingId
}) {
    const data = {
        "type": "availability_check",
        "listing_id": listingId,
        "buyer_pk": buyerPk,
    };
    console.log(`checking availability ${listingId} for buyer: ${buyerPk}`);

    return new Promise(function (resolve, reject) {
        //send request to seller
        send(data, seller)
            .then(success => console.log(`successfully sent check request ${success}`))
            .catch(error => reject(Error(error)));

        const time = Date.now();
        let interval = setInterval(() => {
            getStatus(listingId).then((response) => {
                if (response) {
                    const listing = response.rows[0];
                    switch(listing.status) {
                        case "available":
                            clearInterval(interval);
                            resolve(true);
                            break;
                        case "unavailable":
                            clearInterval(interval);
                            reject(Error('This item is unavailable'));
                            break;
                        case "pending":
                            clearInterval(interval);
                            reject(Error('Item not currently available, please try again later'))
                            break;
                        default:
                            reject(Error('Something went wrong checking availability'))
                    }
                }
                //stop checking the db timeout
                if (time - Date.now() > buyerConstants.AVAILABILITY_TIMEOUT * 1000) {
                    console.error(`Availabilty check timedout after ${buyerConstants.AVAILABILITY_TIMEOUT} seconds`);
                    clearInterval(interval);
                    reject(Error("No response from the seller, try again later"));
                }
            }).catch((e) => console.error(e));
        }, buyerConstants.AVAILABILITY_CHECK_FREQ * 1000); //every 2 seconds
    });
}
checkAvailability.propTypes = {
    seller: PropTypes.string.isRequired,
    buyerPk: PropTypes.string.isRequired,
    listingId: PropTypes.string.isRequired
}


/**
* When new block 
* @param {string} seller - Sellers hex address
*/
export function processNewBlock(data) {
    try {
        //get the code and transaction amount
        let purchaseCode = data.txpow.body.txn.state[0].data;
        purchaseCode = purchaseCode.replace('[', '');
        purchaseCode = purchaseCode.replace(']', '');
        console.log(`Purchase Code: ${purchaseCode}`);
        const txnAmount = data.txpow.body.txn.outputs[0].amount;
        console.log(`Purchase Code: ${txnAmount}`);
        //check if the seller has a listing that matches these values
        getListingByPurchaseCode(purchaseCode).then((listing) => {
            //check the amount is the same
            if (listing.price === txnAmount) {
                console.log(`A buyer has paid for your item: ${listing.name}`);
                return updateListing(listing.listing_id, 'status', 'sold');
            }
        }).catch((e) => console.error(`Couldn't find listing with this pruchase code: ${e}`))
    } catch {
        //console.error("No purchase code data attached to event");
    }
}