import PropTypes from 'prop-types';
import { send } from './index';
import { updateListing, getStatus, getListingByPurchaseCode} from '../database/listing';

import { generate } from '@wcj/generate-password';


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


/**
* Sends availability status of listing to buyer along with unique pruchase code
* @param {object} entity - Availability request from buyer that contains listingId
*/
export async function processAvailabilityCheck(entity) {
    console.log(`received availability check for listing: ${entity.listing_id}`);

    const data = {
        "type": "availability_response",
        "status": "unavailable",
        "listing_id": entity.listing_id
    }

    try {
        //is listing available
        const available = await getStatus(entity.listing_id);
        if (available) {
            data.status = "available";
        }
        //generate unique identifier for transaction
        const purchaseCode = generate({ length: 20, special: false });
        data.purchase_code = purchaseCode;

        await send(data, entity.buyer_pk);
        await updateListing(entity.listing_id, "purchase_code", purchaseCode);
        await updateListing(entity.listing_id, "status", "unavailable");
        resetListingStatusTimeout(entity.listing_id);
    } catch (error) {
        console.error(`There was an error processing availability check: ${error}`);
    };
}
processAvailabilityCheck.propTypes = {
    entity: PropTypes.object.isRequired
}



function resetListingStatusTimeout(listingId) {
    //after timeout time check that the listing has been sold if not reset it to available
    async function resetListing(listingId) {
        const status = await getStatus(listingId);
        if (status === 'unavailble') {
            updateListing(listingId, "status", "available")
                .then(console.log('listing reset to availble'))
                .catch((e)=> console.error(e));
        }
    }
    setTimeout(resetListing(listingId), 600000);
}