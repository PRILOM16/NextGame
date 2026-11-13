import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "../api";

export const useAuthStore = defineStore("auth", () => {
  // Данные текущего пользователя и его токен авторизации
  const user = ref<any>(null);
  const token = ref<string | null>(localStorage.getItem("token"));

  // 1. Вход в аккаунт (по почте или никнейму)
  const login = async (payload: {
    email?: string;
    name?: string;
    password: string;
  }) => {
    const response = await api.post("/auth/login", payload);
    const accessToken = response.data.access_token;

    token.value = accessToken;
    localStorage.setItem("token", accessToken);

    await fetchProfile();
  };

  // 2. Регистрация нового пользователя
  const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => {
    await api.post("/auth/register", { name, email, password, role });
    await login({ email, password });
  };

  // 3. Загрузка данных своего профиля с сервера
  const fetchProfile = async () => {
    if (!token.value) return;

    try {
      const response = await api.get("/users/me");
      user.value = response.data;
    } catch {
      // Если токен устарел или недействителен — выходим из аккаунта
      logout();
    }
  };

  // 4. Выход из аккаунта
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  };

  return { user, token, login, register, fetchProfile, logout };
});
