var NOTIFICATIONSTABLE = 'NOTIFICATIONS';

var logs = process.env.REACT_APP_LOGS;


/**
 * Get all notifications from the notifications table
 * @param {*} callback
 * @returns
 */

export function getNotifications(callback) {
    const Q = `SELECT * FROM ${NOTIFICATIONSTABLE}`;
    window.MDS.sql(Q, function (res) {
        if (logs) {
            window.MDS.log(`window.MDS.SQL, ${Q}`);
        }

        if (res.status && callback) {
            callback(res.rows);
        } else {
            throw new Error(`Getting notifications ${res.error}`);
        }
    });
}

/**
 * Get notification by notification_id
 * @param {*} notification_id
 * @param {*} callback
 * @returns
 */

export function getNotification({ notification_id, callback }) {
    const Q = `SELECT * FROM ${NOTIFICATIONSTABLE} WHERE notification_id='${notification_id}'`;
    window.MDS.sql(Q, function (res) {
        if (logs) {
            window.MDS.log(`window.MDS.SQL, ${Q}`);
        }

        if (res.status && callback) {
            callback(res.rows);
        } else {
            throw new Error(`Getting notification ${res.error}`);
        }
    });
}

/**
 * Get notification by listing_id
 * @param {*} listing_id
 * @param {*} callback
 * @returns
 */

export function getNotificationByListingId({ listing_id, callback }) {
    const Q = `SELECT * FROM ${NOTIFICATIONSTABLE} WHERE listing_id='${listing_id}'`;
    window.MDS.sql(Q, function (res) {
        if (logs) {
            window.MDS.log(`window.MDS.SQL, ${Q}`);
        }

        if (res.status && callback) {
            callback(res.rows);
        } else {
            throw new Error(`Getting notification ${res.error}`);
        }
    });
}

/**
 * Get notification by status
 * @param {*} status
 * @param {*} callback
 * @returns
 */

export function getNotificationByStatus({ status, callback }) {
    const Q = `SELECT * FROM ${NOTIFICATIONSTABLE} WHERE status='${status}'`;
    window.MDS.sql(Q, function (res) {
        if (logs) {
            window.MDS.log(`window.MDS.SQL, ${Q}`);
        }

        if (res.status && callback) {
            callback(res.rows);
        } else {
            throw new Error(`Getting notification ${res.error}`);
        }
    });
}

/**
 * Update notification by notification_id
 * @param {*} notification_id
 * @param {*} status
 * @param {*} callback
 * @returns
 */

export function updateNotification({ notification_id, status, callback }) {
    const Q = `UPDATE ${NOTIFICATIONSTABLE} SET status='${status}' WHERE notification_id='${notification_id}'`;
    window.MDS.sql(Q, function (res) {
        if (logs) {
            window.MDS.log(`window.MDS.SQL, ${Q}`);
        }

        if (res.status && callback) {
            callback(true);
        } else {
            throw new Error(`Updating notification ${res.error}`);
        }
    });
}

/**
 * Delete notification by notification_id
 * @param {*} notification_id
 * @param {*} callback
 * @returns
 */

export function deleteNotification({ notification_id, callback }) {
    const Q = `DELETE FROM ${NOTIFICATIONSTABLE} WHERE notification_id='${notification_id}'`;
    window.MDS.sql(Q, function (res) {
        if (logs) {
            window.MDS.log(`window.MDS.SQL, ${Q}`);
        }

        if (res.status && callback) {
            callback(true);
        } else {
            throw new Error(`Deleting notification ${res.error}`);
        }
    });
}
