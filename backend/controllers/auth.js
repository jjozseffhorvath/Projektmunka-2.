const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const Patient = require('../models/patient');

// Figyelni kell, mert régebben sendgrid tiltotta a szolgáltatás használatát spamre hivatkozva
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: 'Generált API kulcs'
    }
}));

// Authentikációs műveletek
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Bejelentkezés', // Ez módosulhat
        errorMessage: req.flash('error')
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: 'signup',
        pageTitle: 'Regisztráció', // Ez módosulhat
        errorMessage: req.flash('error')
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    // Ellenőrzés, hogy a felhasználó a regisztrációkor megadott adatait adta meg és nem gépelte el
    Patient.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Helytelen email vagy jelszó.');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            res.redirect('/');
                        });
                    }
                    res.redirect('/login');
                })
        })
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    // Ellenőrzés, hogy a felhasználó olyan email címet adott-e meg, ami még nem szerepel az adatbázisban,
    // a jelszó és a confirmPassword összehasonlítása, hogy egyeznek-e, valamint jelszó hash
    Patient.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'Ezzel az email címmel már regisztráltak.');
                return res.redirect('/signup');
            }
            else if (password != confirmPassword) {
                req.flash('error', 'A jelszavak nem egyeznek meg.');
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new Patient({
                        email: email,
                        password: hashedPassword,
                        appointments: { dates: [] },
                        role: 'Paciens'
                    })
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                    // Egyszerű email, ami tájékoztat a sikeres regisztrációról
                    return transporter.sendMail({
                        to: email,
                        from: 'scheuer.patrik@hallgato.sze.hu',
                        subject: 'Sikeres regisztráció',
                        html: '<h1>Köszönjük, hogy regisztrált az időpontfoglaló rendszerünkre!</h1>'
                    })
                })
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/');
    });
};

// TODO
// Elfelejtett jelszó kérés, illetve új jelszó beállítása