import PropTypes from 'prop-types';
import { getSellersAddress, send, sendMoney, isContact } from './index';
import { updateListing, getStatus, removeListing, resetListingState, getCreatedByNameById } from '../database/listing';
import { buyerConstants } from '../constants';
import { Decimal } from 'decimal.js';
import { getHost } from '../database/settings';

async function getSellerAddress(address) {
    //get name of node that create item
    const e = address.split('#');
    const pk = e[1];

    return new Promise(async function (resolve, reject) {
        //find out if they're a contact
        const currentAddress = await isContact(pk);
        if (currentAddress && currentAddress.includes('@')) {
            resolve(currentAddress);
        } else {
            const currentAddress = await getSellersAddress(address);
            resolve(currentAddress);
        }
    });
}

export async function sendPurchaseReceipt({ message, listingId, coinId, seller, transmissionType }) {
    const host = await getHost();
    const data = {
        "type": "purchase_receipt",
        "message": message,
        "listing_id": listingId,
        "coin_id": coinId,
        "transmission_type": transmissionType,
        "buyer_name": host.name
    }
    const sellerAddress = await getSellerAddress(seller, listingId);

    return new Promise(function (resolve, reject) {
        send(data, sellerAddress).then(
            () => {
                console.log(`sent customer message to seller: ${message}`);
                resolve(true);
            }).catch((e) => reject(Error(`Could not send purchase recipt to seller ${e}`)));
    });
}

async function sendCollectionConfirmation({ message, listingId, seller, transmissionType }) {
    const host = await getHost();
    const data = {
        "type": "collection_confirmation",
        "message": message,
        "listing_id": listingId,
        "transmission_type": transmissionType,
        "buyer_name": host.name
    }
    return new Promise(function (resolve, reject) {
        send(data, seller).then(
            () => {
                console.log(`sent customer message to seller: ${message}`);
                return resolve(true);
            }).catch((e) => reject(Error(`Could not send collection confirmation to seller ${e}`)));
    });
}

async function sendCancellationNotification({ listingId, seller }) {
    const host = await getHost();
    const data = {
        "type": "cancel_collection",
        "listing_id": listingId,
        "buyer_name": host.name
    }
    return new Promise(function (resolve, reject) {
        send(data, seller).then(
            () => {
                console.log(`sent cancellation to seller.`);
                resolve(true);
            }).catch((e) => reject(Error(`Could not send customer message to seller ${e}`)));
    });
}

/**
* Send's buyers delivery address to seller
* @param {string} seller - Sellers hex address
* @param {string} message - message from buyer
* @param {string} listingId - The id of the listing that is being purchased
* @param {string} purchaseCode - code sent from seller to confirm transaction
* @param {int} amount - cost of purchase
* @param {string} transmissionType - collection or delivery
*/
export function purchaseListing({ seller, message, listingId, walletAddress, purchaseCode, amount, transmissionType }) {
    return new Promise(function (resolve, reject) {
        sendMoney({ walletAddress, amount, purchaseCode })
            .then((coinId) => {
                if (coinId.includes('0x')) {
                    updateListing(listingId, 'status', 'purchased').catch((e) => console.error(e));
                    updateListing(listingId, 'transmission_type', transmissionType).catch((e) => console.error(e));
                    console.log(`Money sent, coin id: ${coinId}`);
                    console.log(`Sending purchase receipt to seller..`);
                    return sendPurchaseReceipt({ message, listingId, coinId, seller, transmissionType })
                        .catch(Error(`Couldn't send purchase receipt`));
                } else {
                    console.error(`Error sending money ${JSON.stringify(coinId)}`);
                    resetListingState(listingId);
                    reject(Error(`There was a problem with the payment`));
                }
            }).catch((error) => {
                if (error.message.includes('Insufficient funds')) {
                    resetListingState(listingId)
                        .then(() => console.log('listing state reset because of error'))
                        .catch((e) => console.error(`Couldn't reset listing state: ${e}`));
                    reject(Error(`Insufficient funds`));
                } else {
                    resetListingState(listingId)
                        .then(() => console.log('listing state reset because of error'))
                        .catch((e) => console.error(`Couldn't reset listing state: ${e}`));
                    console.error(error);
                    reject(Error(error));
                }
            }).then(resolve(true));
    })
}
purchaseListing.proptypes = {
    seller: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    listingId: PropTypes.string.isRequired,
    walletAddress: PropTypes.string.isRequired,
    purchaseCode: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    transmissionType: PropTypes.string.isRequired,
}

/**
* Send's buyers details to seller for collection of listing
* @param {string} seller - Sellers hex address
* @param {string} address - Buyers physical address to send item to
* @param {string} listingId - The id of the listing that is being purchased
*/
export function collectListing({ seller, message, listingId, transmissionType }) {
    return new Promise(function (resolve, reject) {
        updateListing(listingId, 'status', 'in progress').catch((e) => console.error(e));
        updateListing(listingId, 'transmission_type', transmissionType).catch((e) => console.error(e));
        console.log(`Sending collection confirmation and phone numeber to seller.. ${message}`);
        sendCollectionConfirmation({ message, listingId, seller, transmissionType })
            .then(() => resolve(true))
            .catch(Error(`Couldn't send collection confirmation`)
            );
    });
}
collectListing.proptypes = {
    seller: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    listingId: PropTypes.string.isRequired,
    walletAddress: PropTypes.string.isRequired,
    transmissionType: PropTypes.string.isRequired,
}

/**
* Update listing on sellers response of availability
* @param {object} entity - Sellers hex address
*/
export function processAvailabilityResponse(entity) {
    console.log("processing availability response...");
    updateListing(entity.listing_id, "status", entity.status)
        .catch((e) => console.error(`Couldn't update listing status ${e}`))
    updateListing(entity.listing_id, "purchase_code", entity.purchase_code)
        .catch((e) => console.error(`Couldn't update listing purchase code ${e}`))
}
processAvailabilityResponse.proptypes = {
    entity: PropTypes.object.isRequired
}

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
    console.log(`checking availability`);

    return new Promise(async function (resolve, reject) {
        //get sellers address from permanent address
        let sellerCurrentPk = await getSellersAddress(seller).catch(e => Error(console.error(e)));

        //send request to seller
        send(data, sellerCurrentPk)
            .then(() => console.log(`successfully sent check request to seller`))
            .catch(error => reject(Error(error)));

        const time = Date.now();
        let i = 0;
        let interval = setInterval(() => {
            i++;
            console.log(`Listing status check ${i}`);
            getStatus(listingId).then((response) => {
                if (response) {
                    const listing = response.rows[0];
                    console.log(listing);
                    switch (listing.status) {
                        case "unchecked":
                            console.log("Still waiting for response from seller...");
                            break;
                        case "available":
                            clearInterval(interval);
                            resolve(true);
                            break;
                        case "unavailable":
                            clearInterval(interval);
                            removeListing(listingId)
                                .then(() => console.log('Sucessfully removed listing'))
                                .catch((e) => console.error(e));
                            resolve('This item is unavailable');
                            break;
                        case "pending":
                            clearInterval(interval);
                            updateListing(listingId, 'status', 'unchecked')
                                .catch((e) => console.error(`Couldn't update listing status to unchecked ${e}`))
                            resolve('Item not currently available, please try again later')
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
* Checks the buyers balance and returns true if it's more than the price give
* @param {int} price - Price of item to compare balance to
*/
export function hasSufficientFunds(price) {
    return new Promise(function (resolve, reject) {
        window.MDS.cmd('balance', function (balance) {
            if (balance.response) {
                const minimaToken = balance.response.find(token => token.token === 'Minima');
                const bal = new Decimal(minimaToken.sendable);
                if (bal.gte(new Decimal(price))) {
                    resolve(true);
                }
                else {
                    reject(Error('Insufficient funds'));
                    console.log('Insufficient funds');
                    window.MDS.log('Insufficient funds');
                }
            } else {
                reject(Error('Problem checking balance'));
                console.log('Problem checking balance');
                window.MDS.log('Problem checking balance');
            }
        });
    });
}
hasSufficientFunds.PropTypes = {
    price: PropTypes.number.isRequired
}

/**
* Send's cancel notification to seller
* @param {string} seller - Sellers hex address
* @param {string} listingId - The id of the listing that is being cancelled
*/
export function cancelCollection({ seller, listingId }) {
    return new Promise(function (resolve, reject) {
        updateListing(listingId, 'status', 'unchecked').catch((e) => console.error(e));
        console.log(`Sending cancel notification to seller..`);
        sendCancellationNotification({ listingId, seller })
    })
}
cancelCollection.proptypes = {
    seller: PropTypes.string.isRequired,
    listingId: PropTypes.string.isRequired,
    walletAddress: PropTypes.string.isRequired,
    purchaseListing: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    transmissionType: PropTypes.string.isRequired,
}
