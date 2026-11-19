<template>
  <div class="animate-fade-in w-full pb-12">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-white">Мои игры</h1>
        <p class="text-gray-400 text-sm mt-1">Управление вашими проектами</p>
      </div>

      <router-link
        to="/developer/new-game"
        class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-5 py-2.5 rounded-md font-semibold transition-colors shadow-lg text-sm"
      >
        + Добавить игру
      </router-link>
    </div>

    <div v-if="isLoadingGames" class="flex justify-center py-20">
      <div class="loader"></div>
    </div>

    <div
      v-else-if="developerGames.length === 0"
      class="bg-[#1C1F2B] border border-gray-800 rounded-2xl p-12 text-center shadow-xl"
    >
      <span class="text-5xl block mb-4 opacity-70">🎮</span>

      <h3 class="text-2xl font-bold text-white mb-2">
        У вас пока нет добавленных игр
      </h3>

      <p class="text-sm text-gray-500 mb-8 max-w-md mx-auto">
        Создайте свой первый проект, чтобы начать собирать аудиторию.
      </p>

      <router-link
        to="/developer/new-game"
        class="inline-block bg-[#8294FF] hover:bg-[#6c80ff] text-white px-8 py-2.5 rounded-md font-bold transition-colors"
      >
        Опубликовать игру
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <router-link
        v-for="game in developerGames"
        :key="game.game_id"
        :to="`/game/${game.game_id}`"
        class="bg-[#181A24] border border-gray-800 rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-gray-600 transition-colors relative"
      >
        <div
          class="h-48 bg-[#111111] relative overflow-hidden flex items-center justify-center"
        >
          <img
            v-if="game.cover_url"
            :src="`http://localhost:3000${game.cover_url}`"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <span v-else class="text-5xl opacity-50">🕹️</span>

          <div
            class="absolute inset-0 bg-gradient-to-t from-[#181A24] to-transparent opacity-90"
          ></div>

          <h3
            class="absolute bottom-4 left-5 right-5 text-xl font-bold text-white truncate"
          >
            {{ game.title }}
          </h3>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <p class="text-sm text-gray-400 line-clamp-3 mb-6">
            {{ game.description }}
          </p>

          <div
            class="mt-auto pt-4 border-t border-gray-800/80 flex justify-between items-center"
          >
            <span class="text-xs text-gray-300 font-medium">
              {{ new Date(game.created_at).toLocaleDateString() }}
            </span>

            <span
              class="bg-[#1C1F2B] border border-gray-700 text-[#8294FF] px-4 py-1.5 rounded-md text-xs font-bold"
            >
              Управление
            </span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../api";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const developerGames = ref<any[]>([]);
const isLoadingGames = ref(false);

const fetchDeveloperGames = async () => {
  isLoadingGames.value = true;

  try {
    // Если профиль ещё не загружен, получаем его
    if (authStore.token && !authStore.user) {
      await authStore.fetchProfile();
    }

    const myId = authStore.user?.user_id || authStore.user?.id;

    const response = await api.get("/games");

    developerGames.value = response.data.filter(
      (game: any) =>
        game.developer &&
        myId &&
        Number(game.developer.user_id) === Number(myId),
    );
  } catch (error) {
    console.error("Ошибка загрузки игр разработчика:", error);
  } finally {
    isLoadingGames.value = false;
  }
};

onMounted(() => {
  fetchDeveloperGames();
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
