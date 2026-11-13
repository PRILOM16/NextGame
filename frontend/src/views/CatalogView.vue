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
          Найдено: {{ allGames.length }}
        </span>

        <router-link
          to="/feed"
          class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-[#8294FF]/20 transition-all"
        >
          Открыть ленту
        </router-link>
      </div>
    </div>

    <h2 class="text-sm font-bold text-white mb-4 uppercase tracking-wider">
      Все проекты
    </h2>

    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="flex justify-center py-10">
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
          class="h-36 bg-[#111111] flex items-center justify-center relative overflow-hidden"
        >
          <img
            v-if="game.cover_url"
            :src="getMediaUrl(game.cover_url)"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt="Обложка игры"
          />

          <div
            v-else
            class="absolute inset-0 bg-gradient-to-br from-[#1e254a] to-[#0c0e14] flex items-center justify-center"
          >
            <span class="text-3xl opacity-40">🎮</span>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col bg-[#222533]">
          <h3 class="text-sm font-bold text-white mb-0.5 truncate">
            {{ game.title }}
          </h3>

          <span class="text-[10px] text-gray-500 mb-3 block truncate">
            {{ game.developer?.name || "Инди-студия" }}
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
            <span class="text-[10px] text-gray-400">
              👥 {{ game.subscribers_count ?? 0 }} подписчиков
            </span>

            <span
              class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-4 py-1.5 rounded-md text-xs font-bold transition-colors"
            >
              Открыть
            </span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { api, getMediaUrl } from "../api";

const route = useRoute();

// Поисковый запрос из адресной строки (?search=...)
const searchQuery = computed(() => {
  return typeof route.query.search === "string"
    ? route.query.search.trim()
    : "";
});

const allGames = ref<any[]>([]);
const isLoading = ref(false);

// Загрузка игр с сервера и сортировка по популярности
const fetchAllGames = async () => {
  isLoading.value = true;

  try {
    const response = await api.get("/games", {
      params: searchQuery.value ? { search: searchQuery.value } : {},
    });

    // Считаем простой рейтинг популярности: подписчики + голоса + новости
    const gamesWithRating = response.data.map((game: any) => {
      const subscribers = game.subscribers_count || 0;
      const votes = game.stats?.votes || 0;
      const posts = game.stats?.posts || 0;
      const rating = subscribers * 10 + votes * 5 + posts * 2;

      return { ...game, rating };
    });

    // Сначала показываем самые популярные игры
    allGames.value = gamesWithRating.sort((a: any, b: any) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  } catch (error) {
    console.error("Ошибка загрузки каталога:", error);
    allGames.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Загружаем игры сразу и при каждом изменении поискового запроса
watch(searchQuery, fetchAllGames, { immediate: true });
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
