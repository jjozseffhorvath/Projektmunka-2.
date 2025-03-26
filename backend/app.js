const path = require('path');

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const Patient = require('./models/patient');

var projectRouter = require('./routes/project');

var corsOptions = {
    origin: "http://localhost:8080",
    credentials: true
};

const MONGODB_URI = "mongodb+srv://spatrik2001:<titkos jelszó>@sandbox.zpzwgsx.mongodb.net/projektmunka2";
mongoose
    .connect(MONGODB_URI)
    .then(console.log("Csatlakozva a MongoDB adatbázishoz!"))
    .catch((err) => {
        console.log(err);
    });

var app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        }
    })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    Patient.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/api', projectRouter);

module.exports = app;