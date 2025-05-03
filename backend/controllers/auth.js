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
        path: '/signup',
        pageTitle: 'Regisztráció', // Ez módosulhat
        errorMessage: req.flash('error')
    });
};

/*exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!req.body._csrf || req.body._csrf !== req.csrfToken()) {
        return res.status(403).json({ message: 'Hibás CSRF token!' });
    }

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
};*/

exports.postLogin = (req, res, next) => {
    console.log('Bejelentkezési kérés:', req.body);
    console.log('CSRF token a sütiben:', req.cookies._csrf);
    console.log('CSRF token a fejlécben:', req.headers['x-xsrf-token']);
    console.log('Generált token:', req.csrfToken());

    const email = req.body.email;
    const password = req.body.password;

    // Ellenőrzés, hogy a felhasználó a regisztrációkor megadott adatait adta meg és nem gépelte el
    Patient.findOne({ email: email })
        .then(user => {
            if (!user) {
                console.log('Felhasználó nem található!', email);
                return res.status(401).json({ message: 'Helytelen email vagy jelszó.' });
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        console.log('Sikeres bejelentkezés!');
                        return req.session.save(err => {
                            if (err) {
                                console.log(err);
                                return res.status(500).json({ message: 'Hiba történt a munkamenet mentésekor.' });
                            }
                            res.status(200).json({
                                message: 'Sikeres bejelentkezés!',
                                csrfToken: req.csrfToken()
                            });
                        });
                    } else {
                        res.status(401).json({ message: 'Helytelen email vagy jelszó.' });
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ message: 'Hiba történt a bejelentkezés során.' });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Hiba történt az adatbázis lekérdezése során.' });
        });
};

exports.postSignup = (req, res, next) => {
    const nev = req.body.nev;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const taj = req.body.taj;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'A jelszavak nem egyeznek meg.' });
    }

    // Ellenőrzés, hogy a felhasználó olyan email címet adott-e meg, ami még nem szerepel az adatbázisban,
    // a jelszó és a confirmPassword összehasonlítása, hogy egyeznek-e, valamint jelszó hash
    Patient.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                return res.status(400).json({ message: 'Ezzel az email címmel már regisztráltak.' });
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new Patient({
                        nev: nev,
                        email: email,
                        password: hashedPassword,
                        taj: taj,
                        appointments: { dates: [] },
                        isOrvos: false
                    })
                    return user.save();
                })
                .then(result => {
                    // Egyszerű email, ami tájékoztat a sikeres regisztrációról
                    /*return transporter.sendMail({
                        to: email,
                        from: 'scheuer.patrik@hallgato.sze.hu',
                        subject: 'Sikeres regisztráció',
                        html: '<h1>Köszönjük, hogy regisztrált az időpontfoglaló rendszerünkre!</h1>'
                    })*/
                })
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/');
    });
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Elfelejtett jelszó',
        errorMessage: req.flash('error')
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        Patient.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'Ezzel az email címmel még nem regisztráltak.');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                transporter.sendMail({
                    to: req.body.email,
                    from: 'scheuer.patrik@hallgato.sze.hu',
                    subject: 'Jelszó helyreállítás',
                    html: `
                        <p>Jelszó helyreállítást kezdeményeztél.</p>
                        <p>Kattints az <a href="http://localhost:8080/reset/${token}">alábbi linkre</a> az új jelszavad beállításához.</p>`
                })
            })
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    Patient.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() }})
        .then(user => {
            if (!user) {
                return res.redirect('/');
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'Új jelszó igénylés',
                errorMessage: req.flash('error'),
                userId: user._id.toString(),
                passwordToken: token
            });
        })
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    Patient.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId})
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
};