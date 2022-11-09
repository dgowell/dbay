const {
    MongoClient
} = require("mongodb");
const env = process.env.NODE_ENV || 'development';
let Db = process.env.ATLAS_URI;
if (env === 'test') {
    Db = process.env.LOCAL_DATABASE;
}

const client = new MongoClient(Db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

var _db;

module.exports = {
    connectToServer: function (callback) {
        client.connect(function (err, db) {
            // Verify we got a good "db" object
            if (db) {
                _db = db.db("Marketplace");
                console.log("Successfully connected to MongoDB.");
            }
            return callback(err);
        });
    },

    getDb: function () {
        return _db;
    },
};