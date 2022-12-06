const CATEGORIESTABLE = `"CATEGORY"`;

export function createCategoryTable() {
    const Q = `create table if not exists ${CATEGORIESTABLE} (
            "category_id" int auto_increment primary key,
            "parent_category_id" INT NULL,
            "name" CHAR(50) NOT NULL,
            CONSTRAINT AK_category_name UNIQUE("name"),
            CONSTRAINT FK_FROM_category_TO_parent_category FOREIGN KEY("parent_category_id") REFERENCES category("category_id")
            )`;

    return new Promise((resolve, reject) => {
        window.MDS.sql(Q, function (res) {
            window.MDS.log(`MDS.SQL, ${Q}`);
            console.log(res);
            if (res.status) {
                resolve(true)
            } else {
                reject(`${res.error}`);
            }
        })
    })
}

export function preloadCategoryTable() {
    const Q = `insert into ${CATEGORIESTABLE}
            ("name")
            VALUES
            ("Audio & Stereo"),
            ("Baby & Kids Stuff"),
            ("Cameras, Camcorders & Studio Equipment"),
            ("Christmas Decorations"),
            ("Clothes, Footwear & Accessories"),
            ("Computers & Software"),
            ("DIY Tools & Materials"),
            ("Health & Beauty"),
            ("Home & Garden"),
            ("Musical Instruments & DJ Equipment"),
            ("Office Furniture & Equipment"),
            ("Phones, Mobile Phones & Telecoms"),
            ("Sports, Leisure & Travel"),
            ("Tickets");
            )`;

    return new Promise((resolve, reject) => {
        window.MDS.sql(Q, function (res) {
            window.MDS.log(`MDS.SQL, ${Q}`);
            console.log(res);
            if (res.status) {
                resolve(true)
            } else {
                reject(`${res.error}`);
            }
        })
    })
}

/* retrieves all categories */
export function getCategories() {
    return new Promise(function (resolve, reject) {
        window.MDS.sql(`SELECT "name", "category_id" FROM ${CATEGORIESTABLE};`, (res) => {
            if (res.status) {
                resolve(res.rows);
            } else {
                reject(res.error);
            }
        });
    });
}