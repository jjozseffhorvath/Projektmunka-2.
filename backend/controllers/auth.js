const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const Patient = require('../models/patient');
const Doctor = require('../models/doctor');

// Figyelni kell, mert régebben sendgrid tiltotta a szolgáltatás használatát spamre hivatkozva
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: 'Generált API kulcs'
    }
}));

// Authentikációs műveletek
// Itt kicsit egyszerűbb nevet kaptak a metódusok, mivel backenden úgymond felesleges a login/signup műveletek get kérése
exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    
    try {
        console.log('Bejelentkezési kérés:', req.body);
        console.log('CSRF token a sütiben:', req.cookies._csrf);
        console.log('CSRF token a fejlécben:', req.headers['x-xsrf-token']);
        console.log('Generált token:', req.csrfToken());

        // Ellenőrzés, hogy a felhasználó a regisztrációkor megadott adatait adta meg és nem gépelte el
        const user = await Patient.findOne({ email }) || await Doctor.findOne({ email });
        if (!user) {
            console.log('Felhasználó nem található!', email);
            return res.status(401).json({ message: 'Helytelen email vagy jelszó.'});
        }

        const doMatch = await bcrypt.compare(password, user.password);
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

            })
        } else {
            console.log('Helytelen email vagy jelszó!');
            return res.status(401).json({ message: 'Helytelen email vagy jelszó.' });
        }
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Hiba történt a bejelentkezés során.' });
    }
};

exports.signup = async (req, res, next) => {
    /*const nev = req.body.nev;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const taj = req.body.taj;*/
    const { nev, email, password, confirmPassword, taj, isOrvos } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'A jelszavak nem egyeznek meg.' });
    }

    try {
        // Ellenőrzés, hogy a felhasználó olyan email címet adott-e meg, ami még nem szerepel az adatbázisban,
        // a jelszó és a confirmPassword összehasonlítása, hogy egyeznek-e, valamint jelszó hash
        const userDoc = await Patient.findOne({ email }) || await Doctor.findOne({ email });
        if (userDoc) {
            return res.status(400).json({ message: 'Ezzel az email címmel már regisztráltak.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = isOrvos
            ? new Doctor({ nev, email, password: hashedPassword, taj })
            : new Patient({ nev, email, password: hashedPassword, taj });
        
        await user.save();
        res.status(201).json({ message: 'Sikeres regisztráció!' });
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Hiba történt a regisztráció során.' });
    }
};

// TODO
// A lentebbi metódusok, valamint mongodb adatbázis újrapakolás
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