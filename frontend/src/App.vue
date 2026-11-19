<template>
  <div class="min-h-screen bg-[#13141C] text-gray-100 font-sans flex flex-col">
    <!-- ВЕРХНЯЯ ПАНЕЛЬ -->
    <nav
      v-if="!isAuthPage"
      class="bg-[#13141C] border-b border-gray-800/50 sticky top-0 z-50"
    >
      <div class="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link
            to="/"
            class="text-xl font-bold italic tracking-wide w-64"
          >
            <span class="text-white">Next</span
            ><span class="text-[#8294FF]">Game</span>
          </router-link>

          <!-- ПОИСК ИГР -->
          <form
            @submit.prevent="searchGames"
            class="hidden md:flex flex-1 max-w-xl mx-4 relative"
          >
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <span class="text-gray-500 text-sm">🔍</span>
            </div>

            <input
              v-model="searchQuery"
              type="text"
              placeholder="Найти игру..."
              class="w-full bg-[#181A24] border border-gray-800 rounded-lg py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#8294FF] transition-colors placeholder-gray-500"
            />
          </form>

          <div class="flex items-center space-x-3 w-64 justify-end">
            <template v-if="authStore.user">
              <button
                class="w-8 h-8 rounded-full bg-[#1C1F2B] flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <span class="text-gray-400 text-xs">🔔</span>
              </button>

              <div class="relative">
                <button
                  @click="isDropdownOpen = !isDropdownOpen"
                  class="w-8 h-8 rounded-full bg-[#8294FF] flex items-center justify-center hover:bg-[#6c80ff] transition-colors text-white font-bold text-xs overflow-hidden"
                >
                  <img
                    v-if="authStore.user.avatar_url"
                    :src="`http://localhost:3000${authStore.user.avatar_url}`"
                    class="w-full h-full object-cover"
                    alt="Аватар"
                  />

                  <span v-else>
                    {{ authStore.user.name?.charAt(0).toUpperCase() }}
                  </span>
                </button>

                <Transition name="fade-slide-down">
                  <div
                    v-if="isDropdownOpen"
                    class="absolute right-0 mt-3 w-56 bg-[#1C1F2B] border border-gray-700/50 rounded-xl shadow-2xl py-2 z-50"
                  >
                    <div
                      class="fixed inset-0 z-40"
                      @click="isDropdownOpen = false"
                    ></div>

                    <div class="relative z-50">
                      <div class="px-4 py-3 border-b border-gray-800 mb-1">
                        <p class="text-sm text-white font-bold truncate">
                          {{ authStore.user.name }}
                        </p>
                        <p class="text-[10px] text-gray-400 truncate">
                          {{ authStore.user.email }}
                        </p>

                        <span
                          class="inline-block mt-1 px-2 py-0.5 bg-[#111111] border border-[#8294FF] text-[#8294FF] text-[8px] rounded-full uppercase tracking-wider font-semibold"
                        >
                          {{
                            authStore.user.role === "DEVELOPER"
                              ? "Разработчик"
                              : "Игрок"
                          }}
                        </span>
                      </div>

                      <router-link
                        to="/profile"
                        @click="isDropdownOpen = false"
                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2A2D3E] transition-colors"
                      >
                        <span class="opacity-70 text-xs">👤</span>
                        Мой профиль
                      </router-link>

                      <router-link
                        to="/profile/settings"
                        @click="isDropdownOpen = false"
                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2A2D3E] transition-colors"
                      >
                        <span class="opacity-70 text-xs">⚙️</span>
                        Настройки
                      </router-link>

                      <div class="border-t border-gray-800 mt-1 pt-1">
                        <button
                          @click="handleLogout"
                          class="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#2A2D3E] transition-colors text-left"
                        >
                          <span class="opacity-70 text-xs">🚪</span>
                          Выйти
                        </button>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </template>

            <template v-else>
              <router-link
                to="/login"
                class="text-sm font-semibold text-gray-400 hover:text-white transition-colors px-3 py-2"
              >
                Вход
              </router-link>

              <router-link
                to="/register"
                class="text-sm font-semibold bg-[#8294FF] hover:bg-[#6c80ff] text-white px-4 py-1.5 rounded-md transition-colors"
              >
                Регистрация
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- ОСНОВНАЯ ОБЛАСТЬ С БОКОВЫМ МЕНЮ -->
    <div
      :class="
        isAuthPage
          ? 'flex-1 flex'
          : 'w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex gap-6 items-start'
      "
    >
      <!-- ЛЕВАЯ ПАНЕЛЬ ПОЛЬЗОВАТЕЛЯ -->
      <aside
        v-if="!isAuthPage && !isDeveloper"
        class="hidden lg:flex w-64 flex-shrink-0 flex-col gap-4 sticky top-24"
      >
        <!-- БЛОК ПОДПИСОК -->
        <div
          class="bg-[#181A24] rounded-2xl p-5 border border-gray-800/50 shadow-lg"
        >
          <h2 class="text-white font-bold text-lg mb-1">Ваши подписки</h2>

          <p
            class="text-[11px] text-gray-500 mb-4 flex items-center justify-between font-semibold"
          >
            Отслеживаемые игры
            <span class="text-gray-600">↕</span>
          </p>

          <div
            v-if="!authStore.user"
            class="text-center py-4 border border-dashed border-gray-700 rounded-lg"
          >
            <p class="text-[11px] text-gray-500">
              Войдите, чтобы отслеживать игры.
            </p>
          </div>

          <div v-else-if="isLoadingSubs" class="flex justify-center py-4">
            <div
              class="w-4 h-4 border-2 border-[#1c1f2b] border-b-[#8294ff] rounded-full animate-spin"
            ></div>
          </div>

          <div
            v-else-if="mySubscriptions.length === 0"
            class="text-center py-4 border border-dashed border-gray-700 rounded-lg"
          >
            <p class="text-[11px] text-gray-500">У вас пока нет подписок.</p>
          </div>

          <div v-else>
            <div
              :class="
                isSubscriptionsExpanded
                  ? 'space-y-1.5 max-h-64 overflow-y-auto pr-1'
                  : 'space-y-1.5'
              "
            >
              <router-link
                v-for="sub in visibleSubscriptions"
                :key="sub.id || sub.game_id"
                :to="`/game/${sub.game_id || sub.game?.game_id}`"
                class="flex items-center gap-3 p-2 hover:bg-[#1C1F2B] rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-700/50 group"
              >
                <img
                  v-if="sub.cover_url || sub.game?.cover_url"
                  :src="`http://localhost:3000${sub.cover_url || sub.game?.cover_url}`"
                  class="w-8 h-8 rounded-md object-cover shadow-inner"
                />

                <div
                  v-else
                  class="w-8 h-8 rounded-md bg-[#222533] flex items-center justify-center text-sm shadow-inner group-hover:bg-[#2A2D3E] transition-colors"
                >
                  🎮
                </div>

                <span
                  class="text-sm font-bold text-gray-300 group-hover:text-white transition-colors truncate"
                >
                  {{ sub.title || sub.game?.title }}
                </span>
              </router-link>
            </div>

            <button
              v-if="mySubscriptions.length > 3"
              @click="isSubscriptionsExpanded = !isSubscriptionsExpanded"
              class="w-full mt-2 py-2 text-xs font-semibold text-[#8294FF] hover:text-white hover:bg-[#222533] rounded-lg transition-colors"
            >
              {{ isSubscriptionsExpanded ? "Свернуть" : "Показать ещё" }}

              <span class="ml-1">
                {{
                  isSubscriptionsExpanded
                    ? "↑"
                    : `(${mySubscriptions.length - 3}) ↓`
                }}
              </span>
            </button>
          </div>
        </div>

        <!-- НАВИГАЦИЯ ПОЛЬЗОВАТЕЛЯ -->
        <nav
          class="bg-[#181A24] rounded-2xl p-2.5 border border-gray-800/50 shadow-lg flex flex-col gap-1"
        >
          <router-link
            to="/"
            class="flex items-center gap-3 p-3 w-full text-left rounded-xl bg-[#222533] text-white font-bold text-sm transition-colors shadow-sm"
          >
            <span class="opacity-70 text-lg">🏠</span>
            Главная
          </router-link>

          <router-link
            to="/catalog"
            class="flex items-center gap-3 p-3 w-full text-left rounded-xl text-gray-400 hover:bg-[#1C1F2B] hover:text-gray-200 font-bold text-sm transition-colors"
          >
            <span class="opacity-70 text-lg">🧭</span>
            Каталог игр
          </router-link>

          <router-link
            to="/feed"
            class="flex items-center gap-3 p-3 w-full text-left rounded-xl text-gray-400 hover:bg-[#1C1F2B] hover:text-gray-200 font-bold text-sm transition-colors"
          >
            <span class="opacity-70 text-lg">📰</span>
            Лента
          </router-link>
        </nav>
      </aside>

      <!-- ЛЕВАЯ ПАНЕЛЬ РАЗРАБОТЧИКА -->
      <aside
        v-if="!isAuthPage && isDeveloper"
        class="hidden lg:flex w-64 flex-shrink-0 flex-col gap-4 sticky top-24"
      >
        <nav
          class="bg-[#181A24] rounded-2xl p-2.5 border border-gray-800/50 shadow-lg flex flex-col gap-1"
        >
          <p
            class="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-3 pt-2 pb-2"
          >
            Основные разделы
          </p>

          <router-link
            to="/"
            :class="
              route.path === '/'
                ? 'bg-[#222533] text-white'
                : 'text-gray-400 hover:bg-[#1C1F2B] hover:text-gray-200'
            "
            class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors"
          >
            <span class="text-lg">🏠</span>
            Главная
          </router-link>

          <router-link
            to="/catalog"
            :class="
              route.path === '/catalog'
                ? 'bg-[#222533] text-white'
                : 'text-gray-400 hover:bg-[#1C1F2B] hover:text-gray-200'
            "
            class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors"
          >
            <span class="text-lg">🧭</span>
            Каталог игр
          </router-link>

          <router-link
            to="/feed"
            :class="
              route.path === '/feed'
                ? 'bg-[#222533] text-white'
                : 'text-gray-400 hover:bg-[#1C1F2B] hover:text-gray-200'
            "
            class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors"
          >
            <span class="text-lg">📰</span>
            Лента
          </router-link>

          <template v-if="authStore.user?.role === 'DEVELOPER'">
            <div class="border-t border-gray-800/80 my-3 mx-2"></div>

            <p
              class="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-3 pb-2"
            >
              Инструменты разработчика
            </p>

            <router-link
              to="/developer/games"
              :class="
                route.path === '/developer/games'
                  ? 'bg-[#222533] text-white'
                  : 'text-gray-400 hover:bg-[#1C1F2B] hover:text-gray-200'
              "
              class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors"
            >
              <span class="text-lg">🎮</span>
              Мои игры
            </router-link>

            <router-link
              to="/developer/new-game"
              :class="
                route.path === '/developer/new-game'
                  ? 'bg-[#222533] text-white'
                  : 'text-gray-400 hover:bg-[#1C1F2B] hover:text-gray-200'
              "
              class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors"
            >
              <span class="text-lg">＋</span>
              Добавить игру
            </router-link>

            <router-link
              to="/developer/new-publication"
              class="group relative flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#5865E8]/20 to-[#8294FF]/5 border border-[#5865E8]/40 hover:border-[#8294FF] hover:shadow-[0_0_20px_rgba(88,101,232,0.18)] transition-all duration-300"
            >
              <div
                class="w-10 h-10 rounded-lg bg-[#5865E8] flex items-center justify-center group-hover:scale-110 transition-transform"
              >
                <span class="text-white text-2xl leading-none">+</span>
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-white">Создать публикацию</p>
                <p class="text-[10px] text-gray-400 mt-1">
                  Поделитесь новостями с игроками
                </p>
              </div>
            </router-link>
          </template>
        </nav>

        <!-- ДОПОЛНИТЕЛЬНАЯ НАВИГАЦИЯ -->
        <nav
          class="bg-[#181A24] rounded-2xl p-2.5 border border-gray-800/50 shadow-lg flex flex-col gap-1"
        >
          <router-link
            to="/profile"
            class="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-[#1C1F2B] hover:text-gray-200 font-bold text-sm transition-colors"
          >
            <span class="text-lg">👤</span>
            Мой профиль
          </router-link>

          <router-link
            to="/profile/settings"
            class="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-[#1C1F2B] hover:text-gray-200 font-bold text-sm transition-colors"
          >
            <span class="text-lg">⚙️</span>
            Настройки
          </router-link>
        </nav>
      </aside>

      <!-- ОСНОВНОЙ КОНТЕНТ -->
      <main class="flex-1 w-full min-w-0">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import { api } from "./api";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Состояние интерфейса
const isDropdownOpen = ref(false);
const isSubscriptionsExpanded = ref(false);
const searchQuery = ref("");

// Определение текущей страницы и роли пользователя
const isAuthPage = computed(() => {
  return route.name === "login" || route.name === "register";
});

const isDeveloper = computed(() => {
  return authStore.user?.role === "DEVELOPER";
});

// Подписки пользователя
const mySubscriptions = ref<any[]>([]);
const isLoadingSubs = ref(false);

// Показываем три подписки или весь список
const visibleSubscriptions = computed(() => {
  if (isSubscriptionsExpanded.value) {
    return mySubscriptions.value;
  }

  return mySubscriptions.value.slice(0, 3);
});

// Загрузка подписок с сервера
const fetchSubscriptions = async () => {
  if (!authStore.user || authStore.user.role !== "USER") {
    mySubscriptions.value = [];
    return;
  }

  isLoadingSubs.value = true;

  try {
    const response = await api.get("/subscriptions/my");
    mySubscriptions.value = response.data;
  } catch (error) {
    console.error("Ошибка загрузки подписок:", error);
  } finally {
    isLoadingSubs.value = false;
  }
};

// Поиск игр
const searchGames = () => {
  const query = searchQuery.value.trim();

  router.push({
    path: "/catalog",
    query: query ? { search: query } : {},
  });
};

// Обновляем строку поиска при изменении адреса страницы
watch(
  () => route.query.search,
  (value) => {
    searchQuery.value = typeof value === "string" ? value : "";
  },
  { immediate: true },
);

// Обновляем подписки при изменении пользователя
watch(() => authStore.user, fetchSubscriptions, { immediate: true });

// Выход из аккаунта
const handleLogout = () => {
  authStore.logout();
  isDropdownOpen.value = false;
  router.push("/login");
};

// Обработка изменения подписок
onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile();
  }

  window.addEventListener("subscriptions-changed", fetchSubscriptions);
});

// Удаляем обработчик при закрытии компонента
onUnmounted(() => {
  window.removeEventListener("subscriptions-changed", fetchSubscriptions);
});
</script>

<style scoped>
.fade-slide-down-enter-active,
.fade-slide-down-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-down-enter-from,
.fade-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
