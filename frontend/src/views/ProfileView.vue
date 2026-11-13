<template>
  <div class="w-full max-w-5xl mx-auto animate-fade-in pb-12">
    <!-- Загрузка профиля -->
    <div v-if="!authStore.user" class="flex justify-center items-center py-20">
      <div class="loader"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Шапка профиля -->
      <div
        class="bg-[#181A24] rounded-2xl border border-gray-800/50 overflow-hidden shadow-lg"
      >
        <div
          class="h-36 bg-gradient-to-r from-[#1E254A] via-[#13141C] to-[#1C1F2B] border-b border-gray-800"
        ></div>

        <div class="px-6 md:px-10 pb-8 relative">
          <!-- Аватар -->
          <div
            class="absolute -top-14 border-4 border-[#181A24] w-28 h-28 rounded-2xl bg-[#1C2341] overflow-hidden flex items-center justify-center shadow-xl"
          >
            <img
              v-if="authStore.user.avatar_url"
              :src="getMediaUrl(authStore.user.avatar_url)"
              alt="Аватар"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-4xl font-bold text-[#8294FF]">
              {{ authStore.user.name?.charAt(0).toUpperCase() || "?" }}
            </span>
          </div>

          <!-- Кнопка перехода в настройки -->
          <div class="flex justify-end pt-4 mb-2">
            <router-link
              to="/profile/settings"
              class="bg-[#1C1F2B] hover:bg-[#2A2D3E] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ⚙️ Настройки
            </router-link>
          </div>

          <!-- Имя, роль и почта -->
          <div class="mt-2">
            <h1 class="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              {{ authStore.user.name }}

              <span
                class="px-3 py-1 border text-[10px] rounded-md uppercase font-bold border-[#3A4A99] text-[#8294FF] bg-[#27326B]/30"
              >
                {{
                  authStore.user.role === "DEVELOPER" ? "Разработчик" : "Игрок"
                }}
              </span>
            </h1>

            <p class="text-gray-400 text-sm mb-6">
              {{ authStore.user.email }}
            </p>
          </div>

          <!-- Краткая статистика профиля -->
          <div
            class="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-gray-800/50"
          >
            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">
                Подписки
              </p>
              <p class="text-2xl font-bold text-white">
                {{ subscriptions.length }}
              </p>
            </div>

            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">
                Дата регистрации
              </p>
              <p class="text-base font-medium text-white">
                {{ formatDate(authStore.user.created_at) }}
              </p>
            </div>

            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">
                ID профиля
              </p>
              <p class="text-base font-mono text-gray-400">
                #{{ authStore.user.user_id }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Список отслеживаемых игр -->
      <div
        class="bg-[#181A24] rounded-2xl p-6 border border-gray-800/50 shadow-lg"
      >
        <h2 class="text-lg font-bold text-white mb-4">
          Отслеживаемые игры ({{ subscriptions.length }})
        </h2>

        <div
          v-if="subscriptions.length === 0"
          class="py-8 text-center text-gray-400 text-sm"
        >
          У вас пока нет подписок на игры.
          <router-link to="/catalog" class="text-[#8294FF] ml-1 hover:underline">
            Перейти в каталог →
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <router-link
            v-for="sub in subscriptions"
            :key="sub.subscription_id"
            :to="`/game/${sub.game?.game_id}`"
            class="flex items-center gap-3 p-3 bg-[#11131B] border border-gray-800 rounded-xl hover:border-[#8294FF]/50 transition-colors"
          >
            <img
              v-if="sub.game?.cover_url"
              :src="getMediaUrl(sub.game.cover_url)"
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
                {{ sub.game?.title || "Игра" }}
              </p>
              <p class="text-xs text-gray-500">Открыть страницу →</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { api, getMediaUrl, formatDate } from "../api";

const authStore = useAuthStore();
const subscriptions = ref<any[]>([]);

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile();
  }

  if (authStore.user) {
    try {
      const response = await api.get("/subscriptions/my");
      subscriptions.value = response.data;
    } catch (error) {
      console.error("Ошибка загрузки подписок:", error);
    }
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
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  to {
    transform: rotate(360deg);
  }
}
</style>
