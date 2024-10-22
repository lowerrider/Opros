import "./assets/main.css";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import Main from "./components/Main.vue";
import Questions from "./components/Questions.vue";

const routes = [
  { path: "/", name: "Main", component: Main },
  { path: "/questions", name: "Questions", component: Questions },
];

const router = createRouter({
  history: createWebHistory("/Opros/"), // Установите здесь базовый путь
  routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
