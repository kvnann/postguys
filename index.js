var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const fs = require("fs");

const http = require("http");
const https = require("https");

const _data = require("./lib/data");
const config = require("./lib/config");

var privateKey  = fs.readFileSync('./https/newkey.pem', 'utf8');
var certificate = fs.readFileSync('./https/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};

const port = process.env.PORT || 3001

const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var api = require("./routers/api");

app.use('/api',api);

const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/',(req,res)=>{
    res.send("It is running :D");
});


var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(port);