import PropTypes from 'prop-types';
import { send } from './index';
import { updateListing, getStatus } from '../database/listing';
import { getListingById } from '../database/listing';

import { generate } from '@wcj/generate-password';

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
        const listingStatus = await getStatus(entity.listing_id);
        if (listingStatus) {
            data.status = listingStatus;
            //generate unique identifier for transaction
            const purchaseCode = generate({ length: 20, special: false });
            data.purchase_code = purchaseCode;
            await send(data, entity.buyer_pk);
            await updateListing(entity.listing_id, {"status": "pending"});
            resetListingStatusTimeout(entity.listing_id);
        }
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
        if (status === 'unavailble' || status === 'pending') {
            updateListing(listingId, {"status": "available"})
                .then(console.log('listing reset to availble'))
                .catch((e) => console.error(e));
        }
    }
    setTimeout(resetListing(listingId), 600000);
}

export function processPurchaseReceipt(entity) {
    //TODO: rewrite function that updates the listing all at once instead of hitting database x times
    console.log(`Message received for purchased listing, updating..`);
    if (entity.transmission_type === 'delivery') {
        updateListing(entity.listing_id, {'buyer_message': entity.buyer_message}).then(
            () => console.log('customer message added succesfully'),
            error => console.error(`Couldn't add message to listing ${error}`)
        );
        updateListing(entity.listing_id, {'status': 'sold'}).then(
            () => console.log('listing sold'),
            error => console.error(`Couldn't update listing status to sold ${error}`)
        );
    } else {
        updateListing(entity.listing_id, {'status': 'completed'}).then(
            () => console.log('listing completed'),
            error => console.error(`Couldn't update listing status to completed ${error}`)
        );
    }
    updateListing(entity.listing_id, {'coin_id': entity.coin_id}).then(
        () => console.log('coin id added to listing'),
        error => console.error(`Couldn't add coin id to listing ${error}`)
    );
    updateListing(entity.listing_id, {'notification': 'true'}).then(
        () => console.log('notification triggered'),
        error => console.error(`Couldn't update listing notification status: ${error}`)
    );
    updateListing(entity.listing_id, {'transmission_type': entity.transmission_type}).then(
        () => console.log(`update transmission type to ${entity.transmission_type}`),
        error => console.error(`Couldn't update transmission type: ${error}`)
    );
    updateListing(entity.listing_id, {'buyer_name': entity.buyer_name}).then(
        () => console.log(`update buyers name to ${entity.buyer_name}`),
        error => console.error(`Couldn't update buyers name: ${error}`)
    );
}

export function processCollectionConfirmation(entity) {
    console.log(`Message received for collection of listing, updating..`);
    updateListing(entity.listing_id, {'buyer_message': entity.message}).then(
        () => console.log('customer message added succesfully'),
        error => console.error(`Couldn't add message to listing ${error}`)
    );
    updateListing(entity.listing_id, {'status': 'sold'}).then(
        () => console.log('listing sold'),
        error => console.error(`Couldn't update listing status to sold ${error}`)
    );
    updateListing(entity.listing_id, {'notification': 'true'}).then(
        () => console.log('notification triggered'),
        error => console.error(`Couldn't update listing notification status: ${error}`)
    );
    updateListing(entity.listing_id, {'transmission_type': entity.transmission_type}).then(
        () => console.log(`update transmission type to ${entity.transmission_type}`),
        error => console.error(`Couldn't update transmission type: ${error}`)
    );
    updateListing(entity.listing_id, {'buyer_name': entity.buyer_name}).then(
        () => console.log(`update buyers name to ${entity.buyer_name}`),
        error => console.error(`Couldn't update buyers name: ${error}`)
    );
}

export async function processCancelCollection(entity) {
    //TODO: rewrite function that updates the listing all at once instead of hitting database x times
    console.log(`Message received for cancelling collection`);
    const listing = await getListingById(entity.listing_id);
    if (listing.buyer_name === entity.buyer_name) {
        updateListing(entity.listing_id, {'status': 'available'}).then(
            () => console.log('listing now available again'),
            error => console.error(`Couldn't update listing status to available ${error}`)
        );
    } else {
        console.log("buyer name not the same as on listing so cancel averted!");
    }
}