import PropTypes from 'prop-types';
import { send } from './index';
import { updateListing } from '../database/listing';

/**
* Send's buyers delivery address to seller
* @param {string} seller - Sellers hex address
* @param {string} address - Buyers physical address to send item to
* @param {string} listingId - The id of the listing that is being purchased
*/
export function sendDeliveryAddress({ seller, address, listing_id }) {
    return new Promise(function (resolve, reject) {
        const data = {
            "type": "add_delivery_address",
            "address": address,
            "listing_id": listing_id
        }
        send(data, seller).then(e => {
            console.log(`sent delivery address to seller: ${address}`);
            resolve(true);
        }).catch(reject());
    })
}
sendDeliveryAddress.proptypes = {
    seller: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired
}

/**
* Update listing on sellers response of availability
* @param {object} entity - Sellers hex address
*/
export function processAvailabilityResponse(entity) {
    console.log("processing availability response...");
    Promise.all(
        updateListing(entity.listing_id, "status", entity.status),
        updateListing(entity.listing_id, "purchase_code", entity.purchase_code)
    ).catch((e)=> console.error(e));
}
processAvailabilityResponse.proptypes = {
    entity: PropTypes.object.isRequired
}