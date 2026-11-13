import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CatalogView from "../views/CatalogView.vue";
import AuthView from "../views/AuthView.vue";
import ProfileView from "../views/ProfileView.vue";
import SettingsView from "../views/SettingsView.vue";
import AddGameView from "../views/AddGameView.vue";
import GameDetailView from "../views/GameDetailView.vue";
import DeveloperGamesView from "../views/DeveloperGames.vue";
import DeveloperAnalyticsView from "../views/DeveloperAnalyticsView.vue";
import AddPublicationView from "../views/AddPublicationView.vue";
import FeedView from "../views/FeedView.vue";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 1. Главная страница платформы
    {
      path: "/",
      name: "home",
      component: HomeView,
    },

    // 2. Каталог всех игр
    {
      path: "/catalog",
      name: "catalog",
      component: CatalogView,
    },

    // 3. Лента новостей и опросов по подпискам
    {
      path: "/feed",
      name: "feed",
      component: FeedView,
    },

    // 4. Страница конкретной игры
    {
      path: "/game/:id",
      name: "game-detail",
      component: GameDetailView,
    },

    // 5. Вход и регистрация
    { path: "/login", name: "login", component: AuthView },
    { path: "/register", name: "register", component: AuthView },

    // 6. Профиль и настройки пользователя
    { path: "/profile", name: "profile", component: ProfileView },
    { path: "/profile/settings", name: "settings", component: SettingsView },

    // 7. Разделы для разработчика игр
    {
      path: "/developer/games",
      name: "developer-games",
      component: DeveloperGamesView,
      meta: { requiresDeveloper: true },
    },
    {
      path: "/developer/analytics",
      name: "developer-analytics",
      component: DeveloperAnalyticsView,
      meta: { requiresDeveloper: true },
    },
    {
      path: "/developer/new-game",
      name: "add-game",
      component: AddGameView,
      meta: { requiresDeveloper: true },
    },
    {
      path: "/developer/new-publication",
      name: "developer-new-publication",
      component: AddPublicationView,
      meta: { requiresDeveloper: true },
    },
  ],
});

// Проверка прав доступа перед каждым переходом по страницам
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Если есть токен, но профиль ещё не загружен — подгружаем его
  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile();
  }

  // Если страница доступна только разработчикам — проверяем роль
  if (to.meta.requiresDeveloper) {
    if (!authStore.token) return "/login";

    if (authStore.user?.role !== "DEVELOPER") {
      return "/";
    }
  }
});

export default router;
