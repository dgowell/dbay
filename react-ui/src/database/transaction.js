
export function createPendingTransaction(pendinguid, amount, callback) {
    let fullsql = `INSERT INTO transactions ("created_at", "pending_uid", "amount", "status") VALUES (${Date.now()}, '${pendinguid}', '${amount}', 'pending')`;
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