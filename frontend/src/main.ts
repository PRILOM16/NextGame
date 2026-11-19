import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/index"; // Подключаем наш будущий роутер

import "./assets/main.css"; // Подключаем Tailwind

const app = createApp(App);

app.use(createPinia()); // Включаем хранилище
app.use(router); // Включаем навигацию

app.mount("#app");
