<template>
  <div class="w-full animate-fade-in pb-12">
    <!-- Заголовок каталога -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6"
    >
      <div>
        <p
          class="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1"
        >
          Игровое сообщество
        </p>

        <h1 class="text-3xl sm:text-4xl font-bold text-white">Каталог игр</h1>

        <p class="text-xs sm:text-sm text-gray-500 mt-2">
          Следи за обновлениями, читай новости и участвуй в опросах.
        </p>

        <p v-if="searchQuery" class="text-sm text-[#8294FF] mt-2">
          Результаты поиска: «{{ searchQuery }}»
        </p>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-xs text-gray-400 font-medium hidden sm:inline-block">
          {{ allGames.length }} игр
        </span>

        <button
          class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-[#8294FF]/20 transition-all active:scale-95"
        >
          Открыть ленту
        </button>
      </div>
    </div>

    <h2 class="text-sm font-bold text-white mb-4 uppercase tracking-wider">
      Популярные проекты
    </h2>

    <!-- Загрузка -->
    <div v-if="isLoadingAllGames" class="flex justify-center py-10">
      <div class="loader"></div>
    </div>

    <!-- Если игры не найдены -->
    <div
      v-else-if="allGames.length === 0"
      class="text-center py-12 bg-[#1C1F2B] rounded-xl border border-gray-800/50"
    >
      <p class="text-gray-400">
        {{
          searchQuery
            ? "По вашему запросу игры не найдены."
            : "В каталоге пока нет доступных игр."
        }}
      </p>
    </div>

    <!-- Карточки игр -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <router-link
        v-for="game in allGames"
        :key="game.game_id"
        :to="`/game/${game.game_id}`"
        class="bg-[#1C1F2B] rounded-xl overflow-hidden border border-gray-800/50 hover:border-gray-600 transition-colors flex flex-col group cursor-pointer"
      >
        <div
          class="h-32 bg-[#111111] flex items-center justify-center relative overflow-hidden"
        >
          <img
            v-if="game.cover_url"
            :src="`http://localhost:3000${game.cover_url}`"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt="Обложка игры"
          />

          <div
            v-else
            class="absolute inset-0 bg-gradient-to-br from-[#1e254a] to-[#0c0e14]"
          ></div>

          <div
            class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"
          ></div>
        </div>

        <div class="p-5 flex-1 flex flex-col bg-[#222533]">
          <h3 class="text-sm font-bold text-white mb-0.5 truncate">
            {{ game.title }}
          </h3>

          <span class="text-[10px] text-gray-500 mb-3 block truncate">
            {{ game.genre || "Инди" }}
          </span>

          <p
            class="text-xs text-gray-400 line-clamp-2 mb-5"
            :title="game.description"
          >
            {{ game.description }}
          </p>

          <div
            class="mt-auto flex justify-between items-center pt-4 border-t border-gray-800/50"
          >
            <span class="text-[10px] text-gray-500">
              {{ game.subscribers_count ?? 0 }} подписчиков
            </span>

            <span
              class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-4 py-1.5 rounded-md text-xs font-bold transition-colors shadow-md shadow-[#8294FF]/10"
            >
              Открыть
            </span>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Статистика платформы -->
    <div class="mt-8">
      <h2 class="text-sm font-bold text-white mb-4 uppercase tracking-wider">
        Статистика платформы
      </h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          class="bg-[#222533] p-5 rounded-xl border border-gray-800/50 shadow-md"
        >
          <p
            class="text-[10px] text-gray-500 mb-1 font-semibold uppercase tracking-wider"
          >
            Игры
          </p>

          <p class="text-2xl font-bold text-white">
            {{ platformStats.games_count || allGames.length }}
          </p>
        </div>

        <div
          class="bg-[#222533] p-5 rounded-xl border border-gray-800/50 shadow-md"
        >
          <p
            class="text-[10px] text-gray-500 mb-1 font-semibold uppercase tracking-wider"
          >
            Активные опросы
          </p>

          <p class="text-2xl font-bold text-white">
            {{ platformStats.active_polls }}
          </p>
        </div>

        <div
          class="bg-[#222533] p-5 rounded-xl border border-gray-800/50 shadow-md"
        >
          <p
            class="text-[10px] text-gray-500 mb-1 font-semibold uppercase tracking-wider"
          >
            Голоса
          </p>

          <p class="text-2xl font-bold text-[#8294FF]">
            {{ platformStats.total_votes }}
          </p>
        </div>

        <div
          class="bg-[#222533] p-5 rounded-xl border border-gray-800/50 shadow-md"
        >
          <p
            class="text-[10px] text-gray-500 mb-1 font-semibold uppercase tracking-wider"
          >
            Обновления
          </p>

          <p class="text-2xl font-bold text-white">
            {{ platformStats.recent_updates }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api } from "../api";

const route = useRoute();

// Поисковый запрос из адресной строки
const searchQuery = computed(() => {
  return typeof route.query.search === "string"
    ? route.query.search.trim()
    : "";
});

// Список игр и состояние загрузки
const allGames = ref<any[]>([]);
const isLoadingAllGames = ref(false);

// Статистика платформы
const platformStats = ref({
  games_count: 0,
  active_polls: 0,
  total_votes: 0,
  recent_updates: 0,
});

// Загрузка игр с сервера
const fetchAllGames = async () => {
  isLoadingAllGames.value = true;

  try {
    // Если есть поисковый запрос, передаём его серверу
    const response = await api.get("/games", {
      params: searchQuery.value ? { search: searchQuery.value } : {},
    });

    // Рассчитываем популярность каждой игры
    const games = response.data.map((game: any) => {
      const subscribers = game.subscribers_count || 0;
      const votes = game.stats?.votes || 0;
      const posts = game.stats?.posts || 0;

      const coefficient = subscribers * 10 + votes * 5 + posts * 2;

      return { ...game, coefficient };
    });

    // Сначала показываем популярные игры, затем более новые
    allGames.value = games.sort((a: any, b: any) => {
      if (a.coefficient !== b.coefficient) {
        return b.coefficient - a.coefficient;
      }

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  } catch (error) {
    console.error("Ошибка загрузки каталога:", error);
    allGames.value = [];
  } finally {
    isLoadingAllGames.value = false;
  }
};

// Загрузка статистики платформы
const fetchPlatformStats = async () => {
  try {
    const response = await api.get("/stats");
    platformStats.value = response.data;
  } catch (error) {
    console.error("Ошибка загрузки статистики:", error);
  }
};

// Загружаем игры при открытии каталога
// И повторяем загрузку при изменении поискового запроса
watch(searchQuery, fetchAllGames, { immediate: true });

// Статистика загружается один раз при открытии страницы
onMounted(() => {
  fetchPlatformStats();
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
  to {
    transform: rotate(360deg);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
