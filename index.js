var express = require('express');
var app = express();
const bodyParser = require('body-parser');

const _data = require("./lib/data");
const config = require("./lib/config");

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

app.listen(3001);