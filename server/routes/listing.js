const express = require("express");

// listingRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listing.
const listingRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;


// This section will help you get a list of all the listings.
listingRoutes.route("/listing").get(function (req, res) {
    let db_connect = dbo.getDb("Marketplace");
    db_connect
        .collection("listings")
        .find({})
        .limit(20)
        .toArray(function (err, result) {
            if (err) throw err;
            res.json(result);
        });
});

// This section will help you get a single listing by id
listingRoutes.route("/listing/:id").get(function (req, res) {
    let db_connect = dbo.getDb();
    let myquery = {
        _id: ObjectId(req.params.id)
    };
    db_connect
        .collection("listings")
        .findOne(myquery, function (err, result) {
            if (err) throw err;
            res.json(result);
        });
});

// This section will help you create a new listing.
listingRoutes.route("/listing/add").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myobj = {
        name: req.body.name,
        asking_price: req.body.asking_price,
    };
    db_connect.collection("listings").insertOne(myobj, function (err, res) {
        if (err) throw err;
        response.json(res);
    });
});

// This section will help you update a listing by id.
listingRoutes.route("/update/:id").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myquery = {
        _id: ObjectId(req.params.id)
    };
    let newvalues = {
        $set: {
            name: req.body.name,
            asking_price: req.body.asking_price,
        },
    };
    db_connect
        .collection("listings")
        .updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            response.json(res);
        });
});

// This section will help you delete a listing
listingRoutes.route("/:id").delete((req, response) => {
    let db_connect = dbo.getDb();
    let myquery = {
        _id: ObjectId(req.params.id)
    };
    db_connect.collection("listings").deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        response.json(obj);
    });
});

module.exports = listingRoutes;