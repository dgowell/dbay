var NOTIFICATIONSTABLE = 'NOTIFICATIONS';

var logs = true;

//create a Notifications table
function createNotificationsTable(callback) {
    const Q = `create table if not exists ${NOTIFICATIONSTABLE} (
            "notification_id" INT AUTO_INCREMENT PRIMARY KEY,
            "listing" varchar(666) not null,
            "message" varchar(1000),
            "created_at" int not null,
            "status" char(40) not null default 'unread'
            )`;

    MDS.sql(Q, function (res) {
        if (logs) { MDS.log(`MDS.SQL, ${Q}`); }
        MDS.log(`The response from Creating notifications table ${res}`);
        if (res.status && callback) {
            callback(true);
        } else {
            return Error(`${res.error}`);
        }
    })
}

/**
 * Add notification to the notifications table
 * @param {*} notification_id
 * @param {*} message
 * @param {*} created_at
 * @param {*} status
 * @param {*} callback
 */

function addNotification({ listing_id, message, created_at, status, callback }) {
    MDS.log(`Adding notification ${listing_id}, ${message}, ${created_at}, ${status}`);
    const Q = `insert into ${NOTIFICATIONSTABLE} ("listing","message","created_at","status") values('${listing_id}','${message}','${created_at}','${status}');`;
    MDS.sql(Q, function (res) {
        if (logs) {
            MDS.log(`MDS.SQL, ${Q}`);
        }
        MDS.log(`Response from adding notification: ${JSON.stringify(res)}`);
        MDS.log(`Adding notification ${res.status}`);

        if (res.status && callback) {
            callback(true);
        } else {
            throw new Error(`Adding notification ${res.error}`);
        }
    });
}

/**
 * Get all notifications from the notifications table
 * @param {*} callback
 * @returns
 */

function getNotifications(callback) {
    const Q = `SELECT * FROM ${NOTIFICATIONSTABLE}`;
    MDS.sql(Q, function (res) {
        if (logs) {
            MDS.log(`MDS.SQL, ${Q}`);
        }

        if (res.status && callback) {
            callback(res.result);
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

function getNotification({ notification_id, callback }) {
    const Q = `SELECT * FROM ${NOTIFICATIONSTABLE} WHERE notification_id='${notification_id}'`;
    MDS.sql(Q, function (res) {
        if (logs) {
            MDS.log(`MDS.SQL, ${Q}`);
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

function getNotificationByListingId({ listing_id, callback }) {
    const Q = `SELECT * FROM ${NOTIFICATIONSTABLE} WHERE listing_id='${listing_id}'`;
    MDS.sql(Q, function (res) {
        if (logs) {
            MDS.log(`MDS.SQL, ${Q}`);
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

function getNotificationByStatus({ status, callback }) {
    const Q = `SELECT * FROM ${NOTIFICATIONSTABLE} WHERE status='${status}'`;
    MDS.sql(Q, function (res) {
        if (logs) {
            MDS.log(`MDS.SQL, ${Q}`);
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

function updateNotification({ notification_id, status, callback }) {
    const Q = `UPDATE ${NOTIFICATIONSTABLE} SET status='${status}' WHERE notification_id='${notification_id}'`;
    MDS.sql(Q, function (res) {
        if (logs) {
            MDS.log(`MDS.SQL, ${Q}`);
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

function deleteNotification({ notification_id, callback }) {
    const Q = `DELETE FROM ${NOTIFICATIONSTABLE} WHERE notification_id='${notification_id}'`;
    MDS.sql(Q, function (res) {
        if (logs) {
            MDS.log(`MDS.SQL, ${Q}`);
        }

        if (res.status && callback) {
            callback(true);
        } else {
            throw new Error(`Deleting notification ${res.error}`);
        }
    });
}
