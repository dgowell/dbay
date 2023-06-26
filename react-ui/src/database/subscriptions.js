import { PropTypes } from "prop-types";
import { getMaximaContactAddress, sendMessage } from "../minima";
import { getListingIds } from "../database/listing";

const SUBSCRIPTIONSTABLE = 'subscriptions';
const logs = process.env.REACT_APP_LOGS;

export function createSubscription({ permanentAddress, storeName, storeDescription = '', storeImage = '', callback }) {
    let fullsql = `INSERT INTO subscriptions ("seller_permanent_address", "seller_store_name", "seller_store_description", "seller_store_image") VALUES ('${permanentAddress}', '${storeName}', '${storeDescription}', '${storeImage}')`;
    window.MDS.sql(fullsql, (res) => {
        if (res.error) {
            callback(false, res.error);
        } else {
            callback(true);
        }
    });
}

PropTypes.createSubscription = {
    permanentAddress: PropTypes.string.isRequired,
    storeNme: PropTypes.string.isRequired,
    storeDescription: PropTypes.string,
    storeImage: PropTypes.string,
    callback: PropTypes.func.isRequired
};

export function getSubscriptions(callback) {
    let fullsql = `SELECT * FROM subscriptions`;
    window.MDS.sql(fullsql, (res) => {
        if (res.error) {
            callback(false, res.error);
        } else {
            callback(res);
        }
    });
}

PropTypes.getSubscriptions = {
    callback: PropTypes.func.isRequired,
    error: PropTypes.func.isRequired
};

export function deleteSubscription({ permanent_address, callback }) {
    let fullsql = `DELETE FROM subscriptions WHERE seller_permanent_address = '${permanent_address}'`;
    window.MDS.sql(fullsql, (res) => {
        if (res.error) {
            callback(false, res.error);
        } else {
            callback(true);
        }
    });
}

PropTypes.deleteSubscription = {
    permanent_address: PropTypes.string.isRequired,
    callback: PropTypes.func.isRequired
};



function sendSubscriptionRequests() {
    getMaximaContactAddress(function (maximaContactAddress, err) {
        if (err) {
            if (logs) { window.MDS.log(`Error retrieving Maxima contact address: ${err}`); }
            return false;
        }

        window.MDS.sql(`SELECT seller_permanent_address FROM ${SUBSCRIPTIONSTABLE}`, function (res) {
            if (res.status) {
                if (logs) { window.MDS.log(`MDS.SQL, SELECT seller_permanent_address FROM ${SUBSCRIPTIONSTABLE}`); }
                window.MDS.log(JSON.stringify(res));

                res.data.forEach(function (sellerInfo) {
                    var seller = sellerInfo.seller_permanent_address;

                    if (seller.includes('MAX')) {
                        processSubscriptionRequest(seller, maximaContactAddress);
                    }
                });
            } else {
                if (logs) { window.MDS.log(`Error retrieving subscriptions: ${res.error}`); }
                return false;
            }
        });
    });

    function processSubscriptionRequest(seller, maximaContactAddress) {
        var sellerAddress = seller.split('#')[1];
        getListingIds(sellerAddress, function (listings, err) {
            if (err) {
                if (logs) { window.MDS.log(`Error retrieving subscriptions: ${err}`); }
                return false;
            }

            var data = {
                type: 'SUBSCRIPTION_REQUEST',
                data: {
                    listing_inventory: listings,
                    subscriber_address: maximaContactAddress
                }
            };

            sendMessage({
                data: data,
                address: seller,
                app: 'dbay',
                callback: function (res) {
                    if (res.status) {
                        if (logs) { window.MDS.log(`Successfully sent subscription request to ${seller}`); }
                        return true;
                    } else {
                        if (logs) { window.MDS.log(`Error sending subscription request: ${res.error}`); }
                        return false;
                    }
                }
            });
        });
    }
}
