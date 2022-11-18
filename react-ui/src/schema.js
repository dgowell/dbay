export const schema = `
CREATE TABLE IF NOT EXISTS category
    (
        category_id IDENTITY PRIMARY KEY,
        parent_category_id INT NULL,
        name CHAR(50) NOT NULL,
        CONSTRAINT AK_category_name UNIQUE(name),
        CONSTRAINT FK_FROM_category_TO_parent_category FOREIGN KEY(parent_category_id) REFERENCES category(category_id)
    );

CREATE TABLE IF NOT EXISTS store
    (
        store_id IDENTITY PRIMARY KEY,
        store_pubkey CHAR(330) NOT NULL,
        name CHAR(50) NOT NULL,
        CONSTRAINT AK_store_name UNIQUE(name),
        CONSTRAINT AK_store_publickey UNIQUE(store_pubkey)
    );

CREATE TABLE IF NOT EXISTS listing
    (
        listing_id IDENTITY PRIMARY KEY,
        name CHAR(50) NOT NULL,
        price INT NOT NULL,
        store_pubkey CHAR(330) NOT NULL,
        category_id INT NOT NULL,
        CONSTRAINT AK_listing_name UNIQUE(name),
        CONSTRAINT FK_FROM_listing_TO_store FOREIGN KEY (store_pubkey) REFERENCES store (store_pubkey),
        CONSTRAINT FK_FROM_listing_TO_category FOREIGN KEY (category_id) REFERENCES category (category_id)
    );

    INSERT INTO category
    (name)
    VALUES
    ('Appliances'),
    ('Audio & Stereo'),
    ('Baby & Kids Stuff'),
    ('Cameras, Camcorders & Studio Equipment'),
    ('Christmas Decorations'),
    ('Clothes, Footwear & Accessories'),
    ('Computers & Software'),
    ('DIY Tools & Materials'),
    ('Health & Beauty'),
    ('Home & Garden'),
    ('Musical Instruments & DJ Equipment'),
    ('Office Furniture & Equipment'),
    ('Phones, Mobile Phones & Telecoms'),
    ('Sports, Leisure & Travel'),
    ('Tickets');
`;