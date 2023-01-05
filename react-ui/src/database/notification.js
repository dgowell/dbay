const NOTIFICATIONSTABLE = 'NOTIFICATION';


export function createListingTable() {
    const Q = `create table if not exists ${NOTIFICATIONSTABLE} (
        "notification_id" varchar(343) primary key,
        "name" varchar(50) NOT NULL,
        "price" INT NOT NULL,
        "created_by_pk" varchar(330) NOT NULL,
        "created_by_name" char(50),
        "sent_by_pk" varchar(330),
        "sent_by_name" char(50),
        "created_at" int not null,
        "wallet_address" varchar(80) not null,
        "status" char(12) not null default 'available',
        "buyer_message" varchar(1000),
        "buyer_name" char(50),
        "buyer_pk" varchar(330),
        "purchase_code" varchar(30),
        "coin_id" varchar(80),
        constraint UQ_listing_id unique("listing_id")
        )`;

    return new Promise((resolve, reject) => {
        window.MDS.sql(Q, function (res) {
            window.MDS.log(`MDS.SQL, ${Q}`);
            console.log(res);
            if (res.status) {
                resolve(true)
            } else {
                reject(Error(`Creating listing tables ${res.error}`));
            }
        })
    })
}
