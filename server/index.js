const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const cors = require('cors');
require("dotenv").config();
const app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(require("body-parser").json());

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 9003;

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
    console.error(`Node cluster master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
    });

} else {  
    app.use(cors());

    app.use(require("./routes/listing"));
    // get driver connection
    const dbo = require("./db/conn");

    // Priority serve any static files.
    app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

    // Answer API requests.
    app.get('/api', function (req, res) {
        res.set('Content-Type', 'application/json');
        res.send('{"message":"Hello from the custom server!"}');
    });

    // All remaining requests return the React app, so it can handle routing.
    app.get('*', function (request, response) {
        response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
    });

    app.listen(PORT, function () {
        // perform a database connection when server starts
        dbo.connectToServer(function (err) {
            if (err) console.error(err);

        });
        console.log(`Server is running on port: ${PORT}`);
        console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
    });
}
