import { PropTypes } from "prop-types";

export function createPendingTransaction({pendinguid, amount, purchaseCode, callback}) {
    let fullsql = `INSERT INTO transactions ("created_at", "pendinguid", "amount", "purchase_code", "status") VALUES (${Date.now()}, '${pendinguid}', '${amount}', '${purchaseCode}', 'pending')`;
    return new Promise((resolve, reject) => {
        window.MDS.sql(fullsql, (err) => {
            if (err) {
                callback(false, err);
            } else {
                callback(true);
            }
        });
    });
}

PropTypes.createPendingTransaction = {
    pendinguid: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    purchaseCode: PropTypes.string.isRequired,
    callback: PropTypes.func.isRequired
};

export function getTransactionWithExpiryDate(callback, error) {
    let fullsql = `SELECT * FROM transactions WHERE "status"='complete'`;
    window.MDS.sql(fullsql, (err, res) => {
        if (err) {
            error(err);
        } else {
            callback(res);
        }
    });
}
PropTypes.getTransactionWithExpiryDate = {
    callback: PropTypes.func.isRequired,
    error: PropTypes.func.isRequired
};