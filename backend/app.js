var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const MONGODB_URI = "mongodb+srv://spatrik2001:projektmunka2@sandbox.zpzwgsx.mongodb.net/projektmunka2";
mongoose
    .connect(MONGODB_URI)
    .then(console.log("Csatlakozva a MongoDB adatbázishoz!"))
    .catch((err) => {
        console.log(err);
    });

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
