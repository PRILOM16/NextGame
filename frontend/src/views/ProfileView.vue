<template>
  <div class="w-full max-w-5xl mx-auto animate-fade-in pb-12">
    <!-- Загрузка профиля -->
    <div v-if="!authStore.user" class="flex justify-center items-center py-20">
      <div class="loader"></div>
    </div>

    <div v-else>
      <!-- Шапка профиля -->
      <div
        class="bg-[#181A24] rounded-2xl border border-gray-800/50 overflow-hidden mb-6 relative shadow-lg"
      >
        <div
          class="h-48 bg-gradient-to-r from-[#1E254A] via-[#13141C] to-[#1C1F2B] relative border-b border-gray-800"
        >
          <div
            class="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]"
          ></div>
        </div>

        <div class="px-6 md:px-10 pb-8 relative">
          <!-- Аватар -->
          <div
            class="absolute -top-16 border-4 border-[#181A24] w-32 h-32 rounded-2xl bg-[#1C2341] overflow-hidden flex items-center justify-center shadow-xl"
          >
            <img
              v-if="profileAvatarUrl"
              :src="profileAvatarUrl"
              alt="Аватар пользователя"
              class="w-full h-full object-cover"
            />

            <span v-else class="text-5xl font-bold text-[#8294FF]">
              {{ authStore.user.name?.charAt(0).toUpperCase() || "?" }}
            </span>
          </div>

          <!-- Настройки -->
          <div class="flex justify-end pt-4 mb-2">
            <router-link
              to="/profile/settings"
              class="bg-[#1C1F2B] hover:bg-[#2A2D3E] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>⚙️</span>
              Настройки
            </router-link>
          </div>

          <!-- Имя и роль -->
          <div class="mt-2">
            <h1
              class="text-3xl font-bold text-white mb-1 flex items-center gap-3 flex-wrap"
            >
              {{ authStore.user.name }}

              <span
                :class="
                  authStore.user.role === 'DEVELOPER'
                    ? 'bg-[#27326B]/30 border-[#3A4A99] text-[#8294FF]'
                    : 'bg-[#1C1F2B] border-gray-700 text-gray-400'
                "
                class="px-3 py-1 border text-[10px] rounded-md uppercase tracking-wider font-bold"
              >
                {{
                  authStore.user.role === "DEVELOPER" ? "Разработчик" : "Игрок"
                }}
              </span>
            </h1>

            <p class="text-gray-400 text-sm mb-8">
              {{ authStore.user.email }}
            </p>
          </div>

          <!-- Реальная статистика -->
          <div
            class="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-gray-800/50"
          >
            <div>
              <p
                class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1"
              >
                Подписки
              </p>
              <p class="text-2xl font-bold text-white">
                {{ subscriptions.length }}
              </p>
            </div>

            <div>
              <p
                class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1"
              >
                Дата регистрации
              </p>
              <p class="text-lg font-medium text-white">
                {{ formattedRegistrationDate }}
              </p>
            </div>

            <div>
              <p
                class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1"
              >
                ID профиля
              </p>
              <p class="text-lg font-mono text-gray-400">
                #{{ authStore.user.id || authStore.user.user_id }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Нижняя часть -->
      <div class="flex flex-col md:flex-row gap-6 items-start">
        <!-- О себе -->
        <aside
          class="w-full md:w-1/3 bg-[#181A24] rounded-2xl p-6 border border-gray-800/50"
        >
          <h3 class="text-white font-bold text-lg mb-6">О пользователе</h3>

          <div class="space-y-5">
            <!-- Роль -->
            <div>
              <p class="text-xs text-gray-500 mb-2">Тип учётной записи</p>
              <p class="text-sm text-gray-200 font-medium">
                {{
                  authStore.user.role === "DEVELOPER"
                    ? "Разработчик"
                    : authStore.user.role === "USER"
                      ? "Игрок"
                      : "Не определён"
                }}
              </p>
            </div>

            <div class="border-t border-gray-800/70"></div>

            <!-- Дата регистрации -->
            <div>
              <p class="text-xs text-gray-500 mb-2">Дата регистрации</p>
              <p class="text-sm text-gray-200 font-medium">
                {{ formattedRegistrationDate }}
              </p>
            </div>

            <div class="border-t border-gray-800/70"></div>

            <!-- Статус аккаунта -->
            <div>
              <p class="text-xs text-gray-500 mb-2">Статус аккаунта</p>
              <p
                class="text-sm text-green-400 font-medium flex items-center gap-2"
              >
                <span class="w-2 h-2 rounded-full bg-green-400"></span>
                Активен
              </p>
            </div>
          </div>
        </aside>

        <!-- Правая колонка -->
        <main
          class="flex-1 w-full bg-[#181A24] rounded-2xl p-6 border border-gray-800/50"
        >
          <!-- Вкладки -->
          <div class="flex gap-6 border-b border-gray-800 mb-6">
            <button
              @click="activeTab = 'activity'"
              :class="
                activeTab === 'activity'
                  ? 'text-[#8294FF] border-[#8294FF]'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              "
              class="pb-3 text-sm font-bold border-b-2 transition-colors"
            >
              Активность
            </button>

            <button
              @click="activeTab = 'subscriptions'"
              :class="
                activeTab === 'subscriptions'
                  ? 'text-[#8294FF] border-[#8294FF]'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              "
              class="pb-3 text-sm font-bold border-b-2 transition-colors"
            >
              Отслеживаемое
              <span class="ml-1 text-xs"> ({{ subscriptions.length }}) </span>
            </button>
          </div>

          <!-- Активность -->
          <div v-if="activeTab === 'activity'" class="py-12 text-center">
            <span class="text-4xl block mb-4 opacity-50">📊</span>

            <h4 class="text-xl font-bold text-white mb-2">
              История активности
            </h4>

            <p class="text-sm text-gray-400 max-w-md mx-auto mb-6">
              Здесь будут отображаться ваши действия: участие в опросах,
              комментарии и другие события.
            </p>

            <router-link
              to="/catalog"
              class="inline-block bg-[#8294FF] hover:bg-[#6c80ff] text-white px-6 py-2.5 rounded-md text-sm font-bold transition-colors"
            >
              Перейти в каталог
            </router-link>
          </div>

          <!-- Отслеживаемые игры -->
          <div v-if="activeTab === 'subscriptions'">
            <div
              v-if="isLoadingSubscriptions"
              class="py-12 flex justify-center"
            >
              <div class="loader"></div>
            </div>

            <div v-else-if="subscriptionsError" class="py-10 text-center">
              <p class="text-sm text-red-400 mb-4">
                {{ subscriptionsError }}
              </p>

              <button
                @click="fetchSubscriptions"
                class="text-sm text-[#8294FF] hover:text-white"
              >
                Попробовать снова
              </button>
            </div>

            <div
              v-else-if="subscriptions.length === 0"
              class="py-12 text-center"
            >
              <span class="text-4xl block mb-4 opacity-50">🎮</span>

              <h4 class="text-xl font-bold text-white mb-2">
                Пока нет подписок
              </h4>

              <p class="text-sm text-gray-400 max-w-md mx-auto mb-6">
                Подпишитесь на интересующие вас игры, чтобы следить за их
                новостями и опросами.
              </p>

              <router-link
                to="/catalog"
                class="inline-block bg-[#8294FF] hover:bg-[#6c80ff] text-white px-6 py-2.5 rounded-md text-sm font-bold transition-colors"
              >
                Найти игры
              </router-link>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <router-link
                v-for="sub in subscriptions"
                :key="
                  sub.id ||
                  sub.subscription_id ||
                  sub.game_id ||
                  sub.game?.game_id
                "
                :to="`/game/${sub.game_id || sub.game?.game_id}`"
                class="flex items-center gap-3 p-3 bg-[#11131B] border border-gray-800 rounded-xl hover:border-[#8294FF]/50 hover:bg-[#1C1F2B] transition-colors"
              >
                <img
                  v-if="getSubscriptionCover(sub)"
                  :src="getMediaUrl(getSubscriptionCover(sub))"
                  :alt="getSubscriptionTitle(sub)"
                  class="w-12 h-12 rounded-lg object-cover"
                />

                <div
                  v-else
                  class="w-12 h-12 rounded-lg bg-[#222533] flex items-center justify-center text-xl"
                >
                  🎮
                </div>

                <div class="min-w-0">
                  <p class="text-sm font-bold text-white truncate">
                    {{ getSubscriptionTitle(sub) }}
                  </p>
                  <p class="text-xs text-gray-500">Подписка</p>
                </div>
              </router-link>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { api } from "../api";

const authStore = useAuthStore();
const activeTab = ref("activity");

const subscriptions = ref<any[]>([]);
const userRole = ref("");
const isLoadingSubscriptions = ref(false);
const subscriptionsError = ref("");

const profileAvatarUrl = computed(() => {
  const avatar = authStore.user?.avatar_url;

  if (!avatar) return "";

  return getMediaUrl(avatar);
});

const formattedRegistrationDate = computed(() => {
  const date = authStore.user?.created_at;

  if (!date) return "Не указана";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Не указана";
  }

  return parsedDate.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

// Формирование адреса изображения
const getMediaUrl = (path: string) => {
  if (!path) return "";

  if (path.startsWith("http")) {
    return path;
  }

  return `${api.defaults.baseURL}${path}`;
};

// Получение названия игры из подписки
const getSubscriptionTitle = (sub: any) => {
  return sub.title || sub.game?.title || "Без названия";
};

// Получение обложки игры из подписки
const getSubscriptionCover = (sub: any) => {
  return sub.cover_url || sub.game?.cover_url || "";
};

// Получение подписок пользователя
const fetchSubscriptions = async () => {
  isLoadingSubscriptions.value = true;
  subscriptionsError.value = "";

  try {
    const response = await api.get("/subscriptions/my");

    subscriptions.value = Array.isArray(response.data)
      ? response.data
      : response.data.subscriptions || [];
  } catch (error: any) {
    console.error("Ошибка загрузки подписок:", error);

    subscriptionsError.value =
      error.response?.data?.message || "Не удалось загрузить список подписок.";
  } finally {
    isLoadingSubscriptions.value = false;
  }
};

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile();
  }

  if (authStore.user) {
    await fetchSubscriptions();
  }
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid #1c1f2b;
  border-bottom-color: #8294ff;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
