import Axios from 'axios';

Axios.defaults.baseURL = 'http://localhost:3000'; // Backend URL
Axios.defaults.withCredentials = true; // Engedélyezi a sütik küldését

function getCsrfToken() {
    console.log('Süti:', document.cookie);
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('_csrf='));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
}

export default {
    async postLogin(user) {
        const csrfToken = getCsrfToken();
        console.log('Fejléc CSRF token:', csrfToken);
        return await Axios.post('/api/auth/login', user, {
            headers: {
                'X-XSRF-TOKEN': csrfToken
            }
        })
        .then(res => {
            if (res.status === 200) {
                localStorage.setItem('token', res.data.token);
                return res.data;
            }
        })
        .catch(err => {
            console.log(err);
        })
    },
    async postSignup(user) {
        const csrfToken = getCsrfToken();
        return await Axios.post('/api/auth/signup', user, {
            headers: {
                'X-XSRF-TOKEN': csrfToken
            }
        })
        .then(res => {
            if (res.status === 201) {
                return res.data;
            }
        })
        .catch(err => {
            console.log(err);
        })
    }
};