import axios from "axios";

// Создаем базовый клиент. Теперь нам не нужно писать http://localhost:3000 в каждом запросе
export const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Перехватчик (Interceptor): срабатывает автоматически перед каждым запросом
api.interceptors.request.use((config) => {
  // Ищем токен в памяти браузера
  const token = localStorage.getItem("token");
  if (token) {
    // Если токен есть, приклеиваем его в заголовок (как пропуск)
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
