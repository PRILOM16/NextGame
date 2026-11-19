import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "../api";

export const useAuthStore = defineStore("auth", () => {
  // --- СОСТОЯНИЕ (Переменные) ---
  const user = ref<any>(null); // Здесь будут лежать данные (никнейм, роль)
  const token = ref<string | null>(localStorage.getItem("token"));

  // --- ДЕЙСТВИЯ (Функции) ---

  // 1. Авторизация
  // 1. Авторизация (теперь принимает identifier вместо email)
  // 1. Авторизация (теперь принимает либо email, либо name)
  const login = async (payload: {
    email?: string;
    name?: string;
    password: string;
  }) => {
    // Отправляем объект целиком: { email, password } или { name, password }
    const response = await api.post("/auth/login", payload);

    const accessToken = response.data.access_token;
    token.value = accessToken;
    localStorage.setItem("token", accessToken);

    await fetchProfile();
  };

  // 2. Регистрация
  const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => {
    await api.post("/auth/register", { name, email, password, role });

    await login({ email: email, password: password });
  };

  // 3. Загрузка профиля (кто я?)
  const fetchProfile = async () => {
    if (!token.value) return;
    try {
      const response = await api.get("/users/me");
      user.value = response.data;
    } catch (error) {
      // Если токен протух, выходим из аккаунта
      logout();
    }
  };

  // 4. Выход
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  };

  // Возвращаем всё наружу, чтобы компоненты могли этим пользоваться
  return { user, token, login, register, fetchProfile, logout };
});
