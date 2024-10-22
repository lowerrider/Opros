import "./assets/main.css";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import Main from "./components/Main.vue";
import Questions from "./components/Questions.vue";

import App from "./App.vue";

const app = createApp(App);

const routes = [
  { path: "/", name: "Main", component: Main },
  { path: "/questions", name: "Questions", component: Questions },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

app.use(router);

app.mount("#app");
