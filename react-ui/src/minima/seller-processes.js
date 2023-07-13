import { updateListing, getStatus } from '../database/listing';



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
