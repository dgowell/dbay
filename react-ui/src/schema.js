export const schema = `
CREATE TABLE IF NOT EXISTS category
    (
        category_id IDENTITY PRIMARY KEY,
        parent_category_id INT NULL,
        name CHAR(30) NOT NULL,
        CONSTRAINT AK_category_name UNIQUE(name),
        CONSTRAINT FK_FROM_category_TO_parent_category FOREIGN KEY(parent_category_id) REFERENCES category(category_id)
    );

CREATE TABLE IF NOT EXISTS shop
    (
        shop_id IDENTITY PRIMARY KEY,
        name CHAR(30) NOT NULL,
        CONSTRAINT AK_shop_name UNIQUE(name)
    );

CREATE TABLE IF NOT EXISTS listing
    (
        listing_id IDENTITY PRIMARY KEY,
        name CHAR(30) NOT NULL,
        price INT NOT NULL,
        shop_id INT NOT NULL,
        category_id INT NOT NULL,
        CONSTRAINT AK_listing_name UNIQUE(name),
        CONSTRAINT FK_FROM_listing_TO_shop FOREIGN KEY(shop_id) REFERENCES shop(shop_id),
        CONSTRAINT FK_FROM_listing_TO_category FOREIGN KEY(category_id) REFERENCES category(category_id)
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