<template>
  <div class="w-full animate-fade-in pb-12 space-y-10">
    <!-- 1. ГЛАВНЫЙ БАННЕР (HERO) -->
    <section
      class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E254A] via-[#181A24] to-[#13141C] border border-gray-800/70 p-8 md:p-12 shadow-xl"
    >
      <div class="max-w-2xl relative z-10">
        <span
          class="inline-block px-3 py-1 rounded-full bg-[#8294FF]/15 border border-[#8294FF]/40 text-[#8294FF] text-xs font-bold uppercase tracking-wider mb-4"
        >
          Платформа NextGame
        </span>

        <h1 class="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
          Играй. Обсуждай.<br />
          <span class="text-[#8294FF]">Влияй на разработку.</span>
        </h1>

        <p class="text-sm sm:text-base text-gray-300 leading-relaxed mb-8">
          NextGame объединяет игроков и создателей игр. Подписывайтесь на
          интересные проекты, читайте новости разработки и голосуйте в опросах,
          чтобы помочь авторам сделать игры ещё лучше.
        </p>

        <!-- Быстрые кнопки действий -->
        <div class="flex flex-wrap gap-3">
          <router-link
            to="/catalog"
            class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[#8294FF]/20"
          >
            🧭 Перейти в каталог
          </router-link>

          <router-link
            v-if="authStore.user"
            to="/feed"
            class="bg-[#222533] hover:bg-[#2A2D3E] border border-gray-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors"
          >
            📰 Моя лента
          </router-link>

          <router-link
            v-if="isDeveloper"
            to="/developer/analytics"
            class="bg-[#222533] hover:bg-[#2A2D3E] border border-[#8294FF]/50 text-[#8294FF] px-6 py-3 rounded-xl text-sm font-bold transition-colors"
          >
            📊 Аналитика игр
          </router-link>

          <router-link
            v-if="!authStore.user"
            to="/login"
            class="bg-[#222533] hover:bg-[#2A2D3E] border border-gray-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors"
          >
            🔑 Войти в аккаунт
          </router-link>
        </div>
      </div>
    </section>

    <!-- 2. СТАТИСТИКА ПЛАТФОРМЫ -->
    <section>
      <h2 class="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
        Платформа в цифрах
      </h2>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          class="bg-[#181A24] p-5 rounded-xl border border-gray-800/60 shadow-md"
        >
          <p class="text-xs text-gray-400 mb-1">Игр в каталоге</p>
          <p class="text-3xl font-bold text-white">
            {{ stats.games_count || popularGames.length }}
          </p>
        </div>

        <div
          class="bg-[#181A24] p-5 rounded-xl border border-gray-800/60 shadow-md"
        >
          <p class="text-xs text-gray-400 mb-1">Подписок игроков</p>
          <p class="text-3xl font-bold text-[#8294FF]">
            {{ stats.total_subscribers }}
          </p>
        </div>

        <div
          class="bg-[#181A24] p-5 rounded-xl border border-gray-800/60 shadow-md"
        >
          <p class="text-xs text-gray-400 mb-1">Активных опросов</p>
          <p class="text-3xl font-bold text-green-400">
            {{ stats.active_polls }}
          </p>
        </div>

        <div
          class="bg-[#181A24] p-5 rounded-xl border border-gray-800/60 shadow-md"
        >
          <p class="text-xs text-gray-400 mb-1">Голосов в опросах</p>
          <p class="text-3xl font-bold text-white">
            {{ stats.total_votes }}
          </p>
        </div>
      </div>
    </section>

    <!-- 3. ПОПУЛЯРНЫЕ ИГРЫ -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-white">Популярные игры</h2>
          <p class="text-xs text-gray-400 mt-0.5">
            Проекты, за которыми активно следит сообщество
          </p>
        </div>

        <router-link
          to="/catalog"
          class="text-xs font-bold text-[#8294FF] hover:text-white transition-colors"
        >
          Смотреть все →
        </router-link>
      </div>

      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="loader"></div>
      </div>

      <div
        v-else-if="popularGames.length === 0"
        class="bg-[#181A24] border border-gray-800/60 rounded-xl p-8 text-center text-gray-400 text-sm"
      >
        В каталоге пока нет игр.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <router-link
          v-for="game in popularGames"
          :key="game.game_id"
          :to="`/game/${game.game_id}`"
          class="bg-[#181A24] rounded-xl overflow-hidden border border-gray-800/60 hover:border-[#8294FF]/60 transition-all flex flex-col group"
        >
          <!-- Обложка -->
          <div
            class="h-36 bg-[#111111] flex items-center justify-center relative overflow-hidden"
          >
            <img
              v-if="game.cover_url"
              :src="getMediaUrl(game.cover_url)"
              :alt="game.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span v-else class="text-4xl opacity-40">🎮</span>
          </div>

          <!-- Описание -->
          <div class="p-5 flex-1 flex flex-col">
            <h3 class="text-base font-bold text-white mb-1 truncate">
              {{ game.title }}
            </h3>

            <p class="text-xs text-gray-500 mb-3">
              Разработчик: {{ game.developer?.name || "Студия" }}
            </p>

            <p class="text-xs text-gray-400 line-clamp-2 mb-4">
              {{ game.description }}
            </p>

            <div
              class="mt-auto pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs"
            >
              <span class="text-gray-400">
                👥 {{ game.subscribers_count ?? 0 }} подписчиков
              </span>
              <span class="text-[#8294FF] font-bold group-hover:underline">
                Открыть →
              </span>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- 4. КАК РАБОТАЕТ NEXTGAME (ДЛЯ НОВИЧКОВ) -->
    <section>
      <h2 class="text-xl font-bold text-white mb-4">Как устроена платформа</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          class="bg-[#181A24] border border-gray-800/60 rounded-xl p-6 flex flex-col gap-2"
        >
          <span class="text-2xl">🧭</span>
          <h3 class="text-base font-bold text-white">1. Находите игры</h3>
          <p class="text-xs text-gray-400 leading-relaxed">
            Открывайте каталог инди-проектов, изучайте описания и подписывайтесь
            на игры, которые вам интересны.
          </p>
        </div>

        <div
          class="bg-[#181A24] border border-gray-800/60 rounded-xl p-6 flex flex-col gap-2"
        >
          <span class="text-2xl">📰</span>
          <h3 class="text-base font-bold text-white">2. Следите за лентой</h3>
          <p class="text-xs text-gray-400 leading-relaxed">
            Все новости и дневники разработчиков по вашим подпискам собираются в
            единой персональной ленте.
          </p>
        </div>

        <div
          class="bg-[#181A24] border border-gray-800/60 rounded-xl p-6 flex flex-col gap-2"
        >
          <span class="text-2xl">📊</span>
          <h3 class="text-base font-bold text-white">
            3. Голосуйте и анализируйте
          </h3>
          <p class="text-xs text-gray-400 leading-relaxed">
            Игроки голосуют за новые функции в опросах, а разработчики следят за
            вовлечённостью аудитории в разделе аналитики.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { api, getMediaUrl } from "../api";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const isDeveloper = computed(() => authStore.user?.role === "DEVELOPER");

const isLoading = ref(false);
const popularGames = ref<any[]>([]);

// Статистика платформы
const stats = ref({
  games_count: 0,
  active_polls: 0,
  total_votes: 0,
  recent_updates: 0,
  total_subscribers: 0,
});

// Загружаем топ-3 популярные игры и общую статистику
const loadHomeData = async () => {
  isLoading.value = true;

  try {
    const [gamesRes, statsRes] = await Promise.all([
      api.get("/games"),
      api.get("/stats"),
    ]);

    stats.value = statsRes.data;

    // Сортируем игры по количеству подписчиков и берём первые 3
    const sorted = [...gamesRes.data].sort(
      (a, b) => (b.subscribers_count || 0) - (a.subscribers_count || 0),
    );
    popularGames.value = sorted.slice(0, 3);
  } catch (error) {
    console.error("Ошибка загрузки данных главной страницы:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadHomeData);
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
