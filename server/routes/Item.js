const express = require("express");

// itemRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /item.
const itemRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;


// This section will help you get a list of all the item.
itemRoutes.route("/item").get(function (req, res) {
    let db_connect = dbo.getDb("Marketplace");
    db_connect
        .collection("item")
        .find({})
        .toArray(function (err, result) {
            if (err) throw err;
            res.json(result);
        });
});

// This section will help you get a single item by id
itemRoutes.route("/item/:id").get(function (req, res) {
    let db_connect = dbo.getDb();
    let myquery = {
        _id: ObjectId(req.params.id)
    };
    db_connect
        .collection("item")
        .findOne(myquery, function (err, result) {
            if (err) throw err;
            res.json(result);
        });
});

// This section will help you create a new item.
itemRoutes.route("/item/add").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myobj = {
        name: req.body.name,
        brand: req.body.brand,
        model: req.body.model,
        description: req.body.description,
        original_price: req.body.original_price,
        sale_price: req.body.sale_price,
        vendor_link: req.body.vendor_link,
        condition_state: req.body.condition_state,
        condition_description: req.body.condition_description,
        image: req.body.image,
        published_date: new Date(),
    }
    db_connect.collection("item").insertOne(myobj, function (err, res) {
        if (err) throw err;
        response.json(res);
    });
});

// This section will help you update a item by id.
itemRoutes.route("/update/:id").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myquery = {
        _id: ObjectId(req.params.id)
    };
    let newvalues = {
        $set: {
            txnName: req.body.txnName,
            buyersAddress: req.body.buyersAddress,
            sellersAddress: req.body.sellersAddress,
            data: req.body.data,
            amount: req.body.amount,
            tokenId: req.body.tokenId,
            coinId: req.body.coinId,
            transactionStatus: req.body.txnStatus,
        },
    };
    db_connect
        .collection("item")
        .updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            response.json(res);
        });
});

// This section will help you delete a item
itemRoutes.route(":id").delete((req, response) => {
    let db_connect = dbo.getDb();
    let myquery = {
        _id: ObjectId(req.params.id)
    };
    db_connect.collection("item").deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        response.json(obj);
    });
});

module.exports = itemRoutes;