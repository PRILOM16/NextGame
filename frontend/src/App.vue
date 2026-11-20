<template>
  <div class="min-h-screen bg-[#13141C] text-gray-100 font-sans flex flex-col">
    <!-- ВЕРХНЯЯ ПАНЕЛЬ НАВИГАЦИИ -->
    <nav
      v-if="!isAuthPage"
      class="bg-[#13141C] border-b border-gray-800/50 sticky top-0 z-50"
    >
      <div class="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Логотип -->
          <router-link
            to="/"
            class="text-xl font-bold italic tracking-wide w-64"
          >
            <span class="text-white">Next</span
            ><span class="text-[#8294FF]">Game</span>
          </router-link>

          <!-- Поиск игр по каталогу -->
          <form
            @submit.prevent="searchGames"
            class="hidden md:flex flex-1 max-w-xl mx-4 relative"
          >
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-sm"
            >
              🔍
            </span>

            <input
              v-model="searchQuery"
              type="text"
              placeholder="Найти игру в каталоге..."
              class="w-full bg-[#181A24] border border-gray-800 rounded-lg py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#8294FF] transition-colors placeholder-gray-500"
            />
          </form>

          <!-- Кнопки профиля или входа -->
          <div class="flex items-center space-x-3 w-64 justify-end">
            <template v-if="authStore.user">
              <div class="relative">
                <button
                  @click="isDropdownOpen = !isDropdownOpen"
                  class="w-9 h-9 rounded-full bg-[#8294FF] flex items-center justify-center hover:bg-[#6c80ff] transition-colors text-white font-bold text-xs overflow-hidden"
                >
                  <img
                    v-if="authStore.user.avatar_url"
                    :src="getMediaUrl(authStore.user.avatar_url)"
                    class="w-full h-full object-cover"
                    alt="Аватар"
                  />
                  <span v-else>
                    {{ authStore.user.name?.charAt(0).toUpperCase() }}
                  </span>
                </button>

                <!-- Выпадающее меню пользователя -->
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
                        class="inline-block mt-1 px-2 py-0.5 bg-[#111111] border text-[8px] rounded-full uppercase tracking-wider font-semibold"
                        :class="
                          authStore.isSuperuser
                            ? 'border-red-500 text-red-400'
                            : 'border-[#8294FF] text-[#8294FF]'
                        "
                      >
                        {{ authStore.roleLabel }}
                      </span>
                    </div>

                    <router-link
                      v-if="authStore.isSuperuser"
                      to="/superuser"
                      @click="isDropdownOpen = false"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#2A2D3E] transition-colors font-bold"
                    >
                      <span>👥</span> Управление пользователями
                    </router-link>

                    <router-link
                      to="/profile"
                      @click="isDropdownOpen = false"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2A2D3E] transition-colors"
                    >
                      <span>👤</span> Мой профиль
                    </router-link>

                    <router-link
                      v-if="authStore.canCreateContent"
                      to="/developer/analytics"
                      @click="isDropdownOpen = false"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2A2D3E] transition-colors"
                    >
                      <span>📊</span> Аналитика
                    </router-link>

                    <router-link
                      to="/profile/settings"
                      @click="isDropdownOpen = false"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2A2D3E] transition-colors"
                    >
                      <span>⚙️</span> Настройки
                    </router-link>

                    <div class="border-t border-gray-800 mt-1 pt-1">
                      <button
                        @click="handleLogout"
                        class="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#2A2D3E] transition-colors text-left"
                      >
                        <span>🚪</span> Выйти
                      </button>
                    </div>
                  </div>
                </div>
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
      <!-- ЛЕВАЯ БОКОВАЯ ПАНЕЛЬ -->
      <aside
        v-if="!isAuthPage"
        class="hidden lg:flex w-64 flex-shrink-0 flex-col gap-4 sticky top-24"
      >
        <!-- Блок подписок (показываем игрокам и гостям) -->
        <div
          v-if="!authStore.canCreateContent"
          class="bg-[#181A24] rounded-2xl p-5 border border-gray-800/50 shadow-lg"
        >
          <h2 class="text-white font-bold text-lg mb-1">Ваши подписки</h2>
          <p class="text-[11px] text-gray-500 mb-4 font-semibold">
            Отслеживаемые игры
          </p>

          <div
            v-if="!authStore.user"
            class="text-center py-4 border border-dashed border-gray-700 rounded-lg"
          >
            <p class="text-[11px] text-gray-500">
              Войдите, чтобы отслеживать игры.
            </p>
          </div>

          <div
            v-else-if="mySubscriptions.length === 0"
            class="text-center py-4 border border-dashed border-gray-700 rounded-lg"
          >
            <p class="text-[11px] text-gray-500">У вас пока нет подписок.</p>
          </div>

          <div v-else>
            <div class="space-y-1.5">
              <router-link
                v-for="sub in visibleSubscriptions"
                :key="sub.subscription_id || sub.game?.game_id"
                :to="`/game/${sub.game?.game_id || sub.game_id}`"
                class="flex items-center gap-3 p-2 hover:bg-[#1C1F2B] rounded-lg transition-colors group"
              >
                <img
                  v-if="sub.game?.cover_url"
                  :src="getMediaUrl(sub.game.cover_url)"
                  class="w-8 h-8 rounded-md object-cover"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-md bg-[#222533] flex items-center justify-center text-sm"
                >
                  🎮
                </div>

                <span
                  class="text-sm font-bold text-gray-300 group-hover:text-white truncate"
                >
                  {{ sub.game?.title || sub.title }}
                </span>
              </router-link>
            </div>

            <button
              v-if="mySubscriptions.length > 3"
              @click="isSubscriptionsExpanded = !isSubscriptionsExpanded"
              class="w-full mt-2 py-2 text-xs font-semibold text-[#8294FF] hover:text-white hover:bg-[#222533] rounded-lg transition-colors"
            >
              {{
                isSubscriptionsExpanded
                  ? "Свернуть ↑"
                  : `Показать ещё (${mySubscriptions.length - 3}) ↓`
              }}
            </button>
          </div>
        </div>

        <!-- Основное меню навигации -->
        <nav
          class="bg-[#181A24] rounded-2xl p-2.5 border border-gray-800/50 shadow-lg flex flex-col gap-1"
        >
          <p
            class="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-3 pt-2 pb-1"
          >
            Навигация
          </p>

          <router-link
            to="/"
            :class="getLinkClass('/')"
            class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors"
          >
            <span class="text-lg">🏠</span>
            Главная
          </router-link>

          <router-link
            to="/catalog"
            :class="getLinkClass('/catalog')"
            class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors"
          >
            <span class="text-lg">🧭</span>
            Каталог игр
          </router-link>

          <router-link
            to="/feed"
            :class="getLinkClass('/feed')"
            class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors"
          >
            <span class="text-lg">📰</span>
            Лента
          </router-link>

          <!-- Раздел для Суперюзера -->
          <template v-if="authStore.isSuperuser">
            <div class="border-t border-gray-800/80 my-2 mx-2"></div>

            <p
              class="text-[10px] text-red-400 uppercase font-bold tracking-widest px-3 pb-1"
            >
              Администрирование
            </p>

            <router-link
              to="/superuser"
              :class="getLinkClass('/superuser')"
              class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
            >
              <span class="text-lg">👥</span>
              Пользователи
            </router-link>
          </template>

          <!-- Раздел инструментов разработчика -->
          <template v-if="authStore.canCreateContent">
            <div class="border-t border-gray-800/80 my-2 mx-2"></div>

            <p
              class="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-3 pb-1"
            >
              Разработчику
            </p>

            <router-link
              to="/developer/games"
              :class="getLinkClass('/developer/games')"
              class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors"
            >
              <span class="text-lg">🎮</span>
              Мои игры
            </router-link>

            <router-link
              to="/developer/analytics"
              :class="getLinkClass('/developer/analytics')"
              class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors"
            >
              <span class="text-lg">📊</span>
              Аналитика
            </router-link>

            <router-link
              to="/developer/new-game"
              :class="getLinkClass('/developer/new-game')"
              class="flex items-center gap-3 p-3 w-full rounded-xl font-bold text-sm transition-colors"
            >
              <span class="text-lg">＋</span>
              Добавить игру
            </router-link>

            <router-link
              to="/developer/new-publication"
              class="mt-1 flex items-center gap-3 p-3 rounded-xl bg-[#5865E8]/20 border border-[#5865E8]/40 hover:border-[#8294FF] transition-all"
            >
              <div
                class="w-9 h-9 rounded-lg bg-[#5865E8] flex items-center justify-center text-white text-xl font-bold"
              >
                +
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-white">Создать публикацию</p>
                <p class="text-[10px] text-gray-400">Новость или опрос</p>
              </div>
            </router-link>
          </template>
        </nav>
      </aside>

      <!-- КОНТЕНТ ТЕКУЩЕЙ СТРАНИЦЫ -->
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
import { api, getMediaUrl } from "./api";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isDropdownOpen = ref(false);
const isSubscriptionsExpanded = ref(false);
const searchQuery = ref("");

// Скрываем шапку и меню на страницах входа и регистрации
const isAuthPage = computed(() => {
  return (
    route.name === "login" ||
    route.name === "register" ||
    route.name === "superuser-login"
  );
});

// Подсветка активного пункта меню
const getLinkClass = (path: string) => {
  return route.path === path
    ? "bg-[#222533] text-white"
    : "text-gray-400 hover:bg-[#1C1F2B] hover:text-gray-200";
};

// Список подписок игрока в боковой панели
const mySubscriptions = ref<any[]>([]);

const visibleSubscriptions = computed(() => {
  return isSubscriptionsExpanded.value
    ? mySubscriptions.value
    : mySubscriptions.value.slice(0, 3);
});

// Загружаем список подписок игрока для левой боковой панели
const fetchSubscriptions = async () => {
  if (!authStore.user || authStore.user.role !== "USER") {
    mySubscriptions.value = [];
    return;
  }

  try {
    const response = await api.get("/subscriptions/my");
    mySubscriptions.value = response.data;
  } catch (error) {
    console.error("Ошибка загрузки подписок:", error);
  }
};

// Переход в каталог с поисковым запросом
const searchGames = () => {
  const query = searchQuery.value.trim();
  router.push({
    path: "/catalog",
    query: query ? { search: query } : {},
  });
};

// Синхронизируем поле поиска с адресной строкой
watch(
  () => route.query.search,
  (value) => {
    searchQuery.value = typeof value === "string" ? value : "";
  },
  { immediate: true },
);

watch(() => authStore.user, fetchSubscriptions, { immediate: true });

// Выход из системы
const handleLogout = () => {
  authStore.logout();
  isDropdownOpen.value = false;
  router.push("/login");
};

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile();
  }
  window.addEventListener("subscriptions-changed", fetchSubscriptions);
});

onUnmounted(() => {
  window.removeEventListener("subscriptions-changed", fetchSubscriptions);
});
</script>
