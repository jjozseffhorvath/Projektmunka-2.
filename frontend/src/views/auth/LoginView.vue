<template>
    <div class="login">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <div class="login-form shadow">
            <form method="post" @submit.prevent="login">
                <!--<img src="@/assets/img/logo.png" class="img-fluid">-->
                <h4>Jelentkezzen be webáruházunkba!</h4>
                <div class="mb-3 mt-5">
                    <input type="email" v-model="email" class="mezo" name="email" id="email" placeholder="Email" required>
                </div>
                <div class="mb-3">
                    <input type="password" v-model="password" class="mezo" name="password" id="password" placeholder="Jelszó" required>
                </div>
                <div class="mb-3 d-flex justify-content-end">
                    <a class="text-decoration-none" href="/reset">Elfelejtett jelszó</a>
                </div>
                <input type="hidden" name="_csrf" value="{{ csrfToken }}">
                <button class="specialButton btn-sm" type="submit">Bejelentkezés</button>
                <div class="pt-3 text-muted">
                    Nincs még fiókja? <a class="text-decoration-none" href="/signup">Regisztráció</a>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import AuthService from '@/services/authservice';

export default {
    name: 'LoginView',
    data() {
        return {
            email: '',
            password: '',
            isLoggedIn: false,
            error: ''
        }
    },
    methods: {
        async login() {
            try {
                const csrfToken = this.getCsrfToken();
                console.log('Kérés előtt CSRF token:', this.getCsrfToken());
                const user = { email: this.email, password: this.password, _csrf: csrfToken };
                const response = await AuthService.postLogin(user);

                // Responseból frissítjük a CSRF tokent
                document.cookie = `XSRF-TOKEN=${response.csrfToken}; path=/`;
                
                this.$router.push("/");
                this.isLoggedIn = true;
            } catch(err) {
                if (err.response && err.response.data && err.response.data.message) {
                    this.error = err.response.data.message;
                } else {
                    this.error = "Hiba történt a bejelentkezés során.";
                }
            }
        },
        getCsrfToken() {
            const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
            return csrfCookie ? csrfCookie.split('=')[1] : null;
        },
    },
    created() {
        document.title = 'SpaceY · Bejelentkezés';
    }
}
</script>