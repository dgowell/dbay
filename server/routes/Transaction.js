const express = require("express");

// itemRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /item.
const txnRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;


// This section will help you get a list of all the items.
txnRoutes.route("/transaction").get(function (req, res) {
    let db_connect = dbo.getDb("Marketplace");
    db_connect
        .collection("transaction")
        .find({})
        .toArray(function (err, result) {
            if (err) throw err;
            res.json(result);
        });
});

// This section will help you get a single item by id
txnRoutes.route("/transaction/:id").get(function (req, res) {
    let db_connect = dbo.getDb();
    let myquery = {
        _id: ObjectId(req.params.id)
    };
    db_connect
        .collection("transaction")
        .findOne(myquery, function (err, result) {
            if (err) throw err;
            res.json(result);
        });
});

// This section will help you create a new item.
txnRoutes.route("/transaction/add").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myobj = {
        item_id: req.body.item_id,
        txnName: req.body.txnName,
        buyersAddress: req.body.buyersAddress,
        data: req.body.data,
        amount: req.body.amount,
        tokenId: req.body.tokenId,
        coinId: req.body.coinId,
        published_date: new Date(),
    }
    db_connect.collection("transaction").insertOne(myobj, function (err, res) {
        if (err) throw err;
        response.json(res);
    });
});

// This section will help you create a new item.
txnRoutes.route("/transaction/upload").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myobj = {
        item_id: req.body.item_id,
        txnName: req.body.txnName,
        buyersAddress: req.body.buyersAddress,
        data: req.body.data,
        amount: req.body.amount,
        tokenId: req.body.tokenId,
        coinId: req.body.coinId,
        published_date: new Date(),
    }
    db_connect.collection("transaction").insertOne(myobj, function (err, res) {
        if (err) throw err;
        response.json(res);
    });
});

// This section will help you update a item by id.
txnRoutes.route("transaction/update/:id").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myquery = {
        _id: ObjectId(req.params.id)
    };
    let newvalues = {
        $set: {
            item: req.body.item_id,
            txnName: req.body.txnName,
            buyersAddress: req.body.buyersAddress,
            data: req.body.data,
            amount: req.body.amount,
            tokenId: req.body.tokenId,
            coinId: req.body.coinId
        },
    };
    db_connect
        .collection("transaction")
        .updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            response.json(res);
        });
});

// This section will help you delete a item
txnRoutes.route("transaction/:id").delete((req, response) => {
    let db_connect = dbo.getDb();
    let myquery = {
        _id: ObjectId(req.params.id)
    };
    db_connect.collection("transaction").deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        response.json(obj);
    });
});

module.exports = txnRoutes;