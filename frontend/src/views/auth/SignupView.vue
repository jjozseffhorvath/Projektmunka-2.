<template>
    <div class="signup">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <div class="login-form shadow">
            <form method="post" @submit.prevent="signup">
                <!--<img src="@/assets/img/logo.png" class="img-fluid">-->
                <h4>Regisztráljon webáruházunkra!</h4>
                <div class="mb-3">
                    <input v-model="nev" type="text" class="mezo" name="nev" id="nev" placeholder="Név" required>
                </div>
                <div class="mb-3">
                    <input v-model="email" type="email" class="mezo" name="email" id="email" placeholder="Email" required>
                </div>
                <div class="mb-3">
                    <input v-model="password" type="password" class="mezo" name="password" id="password" placeholder="Jelszó" required>
                </div>
                <div class="mb-3">
                    <input v-model="confirmPassword" type="password" class="mezo" name="confirmPassword" id="confirmPassword" placeholder="Jelszó újra" required>
                </div>
                <div class="mb-3">
                    <input v-model="taj" type="number" maxlength="9" class="mezo" name="taj" id="taj" placeholder="Taj szám" required>
                </div>
                <input type="hidden" name="_csrf" value="{{csrfToken}}">
                <button class="specialButton btn-sm" type="submit">Regisztráció</button>
                <div class="pt-3 text-muted">
                    Már van fiókja? <a class="text-decoration-none" href="/login">Bejelentkezés</a>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import AuthService from '@/services/authservice';

export default {
    name: 'SignupView',
    data() {
        return {
            nev: '',
            email: '',
            password: '',
            confirmPassword: '',
            taj: '',
            error: ''
        };
    },
    methods: {
        getCsrfToken() {
            const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
            return csrfCookie ? csrfCookie.split('=')[1] : null;
        },
        async signup() {
            try {
                const csrfToken = this.getCsrfToken();
                const user = {
                    nev: this.nev,
                    email: this.email,
                    password: this.password,
                    confirmPassword: this.confirmPassword,
                    taj: this.taj,
                    _csrf: csrfToken
                };
                await AuthService.postSignup(user);
                this.$router.push('/login');
            } catch (err) {
                if (err.response && err.response.data && err.response.data.message) {
                    this.error = err.response.data.message;
                } else {
                    this.error = 'Hiba történt a regisztráció során.';
                }
            }
        }
    },
    created() {
        document.title = 'SpaceY · Regisztráció';
    }
};
</script>