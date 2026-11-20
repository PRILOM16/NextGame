import axios from "axios";

// Адрес нашего бэкенд-сервера
export const API_URL = "http://localhost:3000";

// Базовый клиент для отправки HTTP-запросов на сервер
export const api = axios.create({
  baseURL: API_URL,
});

// Перехватчик: автоматически добавляет JWT-токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Помощник для получения полного URL картинки с сервера.
 * Например: "/uploads/covers/1.jpg" -> "http://localhost:3000/uploads/covers/1.jpg"
 */
export function getMediaUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

/**
 * Помощник для красивого отображения даты на русском языке.
 */
export function formatDate(
  date?: string | Date | null,
  withTime = false,
): string {
  if (!date) return "Не указана";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Не указана";

  if (withTime) {
    return parsed.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return parsed.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Помощник для получения понятного текста ошибки из ответа сервера.
 */
export function getErrorMessage(
  error: any,
  fallback = "Произошла ошибка",
): string {
  const msg = error?.response?.data?.message;
  if (Array.isArray(msg) && msg.length > 0) return msg[0];
  if (typeof msg === "string" && msg.trim()) return msg;
  if (error?.response?.data?.error) return error.response.data.error;
  return fallback;
}
