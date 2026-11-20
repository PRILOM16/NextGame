import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "../api";

export const useAuthStore = defineStore("auth", () => {
  // Данные текущего пользователя и его токен авторизации
  const user = ref<any>(null);
  const token = ref<string | null>(localStorage.getItem("token"));

  // Удобные проверки роли текущего пользователя
  const isUser = computed(() => user.value?.role === "USER");
  const isDeveloper = computed(() => user.value?.role === "DEVELOPER");
  const isSuperuser = computed(() => user.value?.role === "SUPERUSER");
  const canCreateContent = computed(
    () => isDeveloper.value || isSuperuser.value,
  );

  const roleLabel = computed(() => {
    if (isSuperuser.value) return "Суперюзер";
    if (isDeveloper.value) return "Разработчик";
    return "Игрок";
  });

  // Общий метод для отправки запроса входа и сохранения токена
  const authenticate = async (
    endpoint: string,
    payload: { email?: string; name?: string; password: string },
  ) => {
    const response = await api.post(endpoint, payload);
    const accessToken = response.data.access_token;

    token.value = accessToken;
    localStorage.setItem("token", accessToken);

    await fetchProfile();
  };

  // 1. Вход в аккаунт (по почте или никнейму)
  const login = (payload: {
    email?: string;
    name?: string;
    password: string;
  }) => authenticate("/auth/login", payload);

  // 1.1. Отдельный вход ТОЛЬКО для суперюзера
  const superuserLogin = (payload: {
    email?: string;
    name?: string;
    password: string;
  }) => authenticate("/auth/superuser/login", payload);

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

  return {
    user,
    token,
    isUser,
    isDeveloper,
    isSuperuser,
    canCreateContent,
    roleLabel,
    login,
    superuserLogin,
    register,
    fetchProfile,
    logout,
  };
});
