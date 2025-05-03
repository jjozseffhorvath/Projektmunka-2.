const path = require('path');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const Patient = require('./models/patient');

var projectRouter = require('./routes/project');

const MONGODB_URI = "mongodb+srv://spatrik2001:<jelszó>@sandbox.zpzwgsx.mongodb.net/projektmunka2";
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

app.use(cookieParser());

app.use((req, res, next) => {
    console.log('Fejléc:', req.headers); // Debug miatt kell csak
    console.log('Menő cookie:', req.cookies); // Debug miatt kell csak

    console.log('CSRF token a sütiben:', req.cookies._csrf);
    console.log('CSRF token a fejlécben:', req.headers['x-xsrf-token']);
    next();
});

const csrfProtection = csrf({ cookie: true });

var corsOptions = {
    origin: "http://localhost:8080",
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store,
        // cookie: {
        //     httpOnly: false,
        //     secure: false,
        //     sameSite: 'lax'
        // }
    })
);

app.use(csrfProtection);
app.use(flash());

// CSRF token generálásának logolása
app.use((req, res, next) => {
    try {
        console.log('Generált CSRF token:', req.csrfToken());
    } catch(err) {
        console.error('Hiba', err);
    }
    //console.log('Generált CSRF token:', req.csrfToken());
    next();
});

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
    res.cookie('_csrf', req.csrfToken(), {
        httpOnly: false,
        secure: false,
        sameSite: 'lax'
    });
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/api', projectRouter);

module.exports = app;