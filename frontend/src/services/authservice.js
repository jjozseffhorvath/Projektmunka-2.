import Axios from 'axios';

Axios.defaults.baseURL = 'http://localhost:3000';
Axios.defaults.withCredentials = true;

export default {
    async postLogin(user) {
        return await Axios.post('/api/auth/login', user, {
            headers: {
                'X-XSRF-TOKEN': user._csrf
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
    async postSignup(user, csrfToken) {
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