exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'A keresett oldal nem található!', // Ez módosulhat
        path: '/404'
    });
};