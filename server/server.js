const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({
    path: "./config.env"
});
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json({
    limit: '25mb'
}));
app.use(express.urlencoded({
    limit: '25mb'
}));
app.use(require("./routes/item"));
app.use(require("./routes/transaction"));
// get driver connection
const dbo = require("./db/conn");

app.listen(port, () => {
    // perform a database connection when server starts
    dbo.connectToServer(function (err) {
        if (err) console.error(err);

    });
    console.log(`Server is running on port: ${port}`);
});