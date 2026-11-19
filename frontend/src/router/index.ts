import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AuthView from "../views/AuthView.vue";
import ProfileView from "@/views/ProfileView.vue";
import SettingsView from "@/views/SettingsView.vue";
import AddGameView from "../views/AddGameView.vue";
import GameDetailView from "../views/GameDetailView.vue";
import DeveloperGamesView from "@/views/DeveloperGames.vue";
import AddPublicationView from "../views/AddPublicationView.vue";
import FeedView from "@/views/FeedView.vue";
import { useAuthStore } from "@/stores/auth.ts";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: () => {
        const token = localStorage.getItem("token");
        return token ? "/feed" : "/catalog";
      },
    },
    { path: "/login", name: "login", component: AuthView },
    { path: "/register", name: "register", component: AuthView },
    { path: "/profile", name: "profile", component: ProfileView },
    { path: "/profile/settings", name: "settings", component: SettingsView },
    {
      path: "/developer/new-game",
      name: "add-game",
      component: AddGameView,
      meta: { requiresDeveloper: true },
    },
    { path: "/game/:id", name: "game-detail", component: GameDetailView },
    {
      path: "/developer/games",
      name: "developer-games",
      component: DeveloperGamesView,
    },
    {
      path: "/developer/new-publication",
      name: "developer-new-publication",
      component: AddPublicationView,
      meta: { requiresDeveloper: true },
    },
    {
      path: "/feed",
      name: "feed",
      component: FeedView,
    },
    { path: "/catalog", name: "catalog", component: HomeView },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile();
  }

  if (to.meta.requiresDeveloper) {
    if (!authStore.token) return "/login";

    if (authStore.user?.role !== "DEVELOPER") {
      return "/catalog";
    }
  }
});

export default router;
