import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView";
import LoginView from "../views/auth/LoginView";
import SignupView from "../views/auth/SignupView";

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/about", name: "about", component: () => import("../views/AboutView.vue") },
  { path: "/login", name: "login", component: LoginView },
  { path: "/signup", name: "signup", component: SignupView },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
