<template>
  <div class="w-full animate-fade-in pb-12 space-y-8">
    <!-- ШАПКА СТРАНИЦЫ АНАЛИТИКИ -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-white">Аналитика разработчика</h1>
        <p class="text-xs sm:text-sm text-gray-400 mt-1">
          Статистика по вашим играм, подписчикам, публикациям и опросам
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="loadAnalytics"
          :disabled="isLoading"
          class="bg-[#181A24] border border-gray-700 hover:border-[#8294FF] text-gray-200 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
        >
          🔄 Обновить данные
        </button>

        <router-link
          to="/developer/new-publication"
          class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
        >
          + Создать публикацию
        </router-link>
      </div>
    </div>

    <!-- ЗАГРУЗКА -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="loader"></div>
    </div>

    <!-- ОШИБКА -->
    <div
      v-else-if="errorMessage"
      class="bg-red-900/20 border border-red-800/50 text-red-400 rounded-xl p-6 text-sm"
    >
      {{ errorMessage }}
    </div>

    <!-- ОСНОВНОЙ КОНТЕНТ АНАЛИТИКИ -->
    <template v-else>
      <!-- 1. СВОДНЫЕ КАРТОЧКИ ПОКАЗАТЕЛЕЙ -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          class="bg-[#181A24] border border-gray-800/60 rounded-xl p-5 shadow-md"
        >
          <p class="text-[11px] text-gray-400 uppercase font-bold mb-1">
            Мои игры
          </p>
          <p class="text-3xl font-bold text-white">
            {{ summary.total_games }}
          </p>
          <p class="text-xs text-gray-500 mt-2">
            В среднем {{ averageSubscribers }} подп. на игру
          </p>
        </div>

        <div
          class="bg-[#181A24] border border-gray-800/60 rounded-xl p-5 shadow-md"
        >
          <p class="text-[11px] text-gray-400 uppercase font-bold mb-1">
            Всего подписчиков
          </p>
          <p class="text-3xl font-bold text-[#8294FF]">
            {{ summary.total_subscribers }}
          </p>
          <p class="text-xs text-gray-500 mt-2">Аудитория всех ваших проектов</p>
        </div>

        <div
          class="bg-[#181A24] border border-gray-800/60 rounded-xl p-5 shadow-md"
        >
          <p class="text-[11px] text-gray-400 uppercase font-bold mb-1">
            Новости
          </p>
          <p class="text-3xl font-bold text-white">
            {{ summary.published_news }}
          </p>
          <p class="text-xs text-gray-500 mt-2">
            Опубликовано (черновиков: {{ summary.draft_news }})
          </p>
        </div>

        <div
          class="bg-[#181A24] border border-gray-800/60 rounded-xl p-5 shadow-md"
        >
          <p class="text-[11px] text-gray-400 uppercase font-bold mb-1">
            Опросы и голоса
          </p>
          <p class="text-3xl font-bold text-green-400">
            {{ summary.total_votes }}
          </p>
          <p class="text-xs text-gray-500 mt-2">
            Голосов в {{ summary.total_polls }} опросах (активных:
            {{ summary.active_polls }})
          </p>
        </div>
      </section>

      <!-- ЕСЛИ У РАЗРАБОТЧИКА ЕЩЁ НЕТ ИГР -->
      <div
        v-if="games.length === 0"
        class="bg-[#181A24] border border-gray-800/60 rounded-2xl p-10 text-center"
      >
        <span class="text-4xl block mb-3">📈</span>
        <h2 class="text-xl font-bold text-white mb-2">
          У вас пока нет игр для анализа
        </h2>
        <p class="text-sm text-gray-400 mb-6">
          Добавьте свою первую игру, чтобы отслеживать рост подписчиков и
          результаты голосований.
        </p>
        <router-link
          to="/developer/new-game"
          class="inline-block bg-[#8294FF] hover:bg-[#6c80ff] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
        >
          + Добавить игру
        </router-link>
      </div>

      <template v-else>
        <!-- 2. СРАВНЕНИЕ ИГР ПО ПОДПИСЧИКАМ И АКТИВНОСТИ -->
        <section
          class="bg-[#181A24] border border-gray-800/60 rounded-2xl p-6 shadow-md"
        >
          <h2 class="text-lg font-bold text-white mb-1">
            Распределение аудитории по играм
          </h2>
          <p class="text-xs text-gray-400 mb-6">
            Наглядное сравнение количества подписчиков и голосов у ваших игр
          </p>

          <div class="space-y-5">
            <div v-for="game in games" :key="game.game_id" class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <router-link
                  :to="`/game/${game.game_id}`"
                  class="font-bold text-white hover:text-[#8294FF] transition-colors"
                >
                  {{ game.title }}
                </router-link>

                <div class="flex items-center gap-4 text-xs text-gray-400">
                  <span>👥 {{ game.subscribers_count }} подп.</span>
                  <span>🗳️ {{ game.votes_count }} гол.</span>
                  <span>📰 {{ game.published_news_count }} нов.</span>
                </div>
              </div>

              <!-- Шкала подписчиков -->
              <div class="w-full h-2.5 bg-[#11131B] rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#8294FF] rounded-full transition-all duration-500"
                  :style="{
                    width: getSubscriberBarWidth(game.subscribers_count) + '%',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. ТАБЛИЦА ПОКАЗАТЕЛЕЙ ПО КАЖДОЙ ИГРЕ -->
        <section
          class="bg-[#181A24] border border-gray-800/60 rounded-2xl overflow-hidden shadow-md"
        >
          <div class="p-6 border-b border-gray-800/60">
            <h2 class="text-lg font-bold text-white">
              Детальная статистика по проектам
            </h2>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr
                  class="border-b border-gray-800 text-[11px] text-gray-400 uppercase"
                >
                  <th class="py-3.5 px-6">Игра</th>
                  <th class="py-3.5 px-4">Подписчики</th>
                  <th class="py-3.5 px-4">Новости</th>
                  <th class="py-3.5 px-4">Опросы</th>
                  <th class="py-3.5 px-4">Всего голосов</th>
                  <th class="py-3.5 px-4">Дата создания</th>
                  <th class="py-3.5 px-6 text-right">Действие</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800/50 text-sm">
                <tr
                  v-for="game in games"
                  :key="game.game_id"
                  class="hover:bg-[#1C1F2B]/60 transition-colors"
                >
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <img
                        v-if="game.cover_url"
                        :src="getMediaUrl(game.cover_url)"
                        class="w-10 h-10 rounded-lg object-cover"
                        :alt="game.title"
                      />
                      <div
                        v-else
                        class="w-10 h-10 rounded-lg bg-[#222533] flex items-center justify-center text-sm"
                      >
                        🎮
                      </div>
                      <span class="font-bold text-white">{{ game.title }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-4 font-bold text-[#8294FF]">
                    {{ game.subscribers_count }}
                  </td>
                  <td class="py-4 px-4 text-gray-300">
                    {{ game.published_news_count }} опубл. /
                    {{ game.draft_news_count }} черн.
                  </td>
                  <td class="py-4 px-4 text-gray-300">
                    {{ game.polls_count }} (активных:
                    {{ game.active_polls_count }})
                  </td>
                  <td class="py-4 px-4 font-bold text-green-400">
                    {{ game.votes_count }}
                  </td>
                  <td class="py-4 px-4 text-xs text-gray-400">
                    {{ formatDate(game.created_at) }}
                  </td>
                  <td class="py-4 px-6 text-right">
                    <router-link
                      :to="`/game/${game.game_id}`"
                      class="text-xs font-bold text-[#8294FF] hover:text-white"
                    >
                      Открыть →
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 4. АНАЛИТИКА ОПРОСОВ -->
        <section class="space-y-4">
          <h2 class="text-lg font-bold text-white">
            Результаты опросов игроков
          </h2>

          <div
            v-if="allPolls.length === 0"
            class="bg-[#181A24] border border-gray-800/60 rounded-xl p-6 text-center text-sm text-gray-400"
          >
            Вы ещё не создавали опросов для своих игр.
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              v-for="poll in allPolls"
              :key="poll.poll_id"
              class="bg-[#181A24] border border-gray-800/60 rounded-xl p-5 flex flex-col gap-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xs text-[#8294FF] font-bold mb-1">
                    {{ poll.gameTitle }}
                  </p>
                  <h3 class="text-base font-bold text-white">
                    {{ poll.question }}
                  </h3>
                </div>

                <span
                  class="text-[10px] px-2.5 py-1 rounded border shrink-0"
                  :class="
                    poll.status === 'ACTIVE'
                      ? 'text-green-400 bg-green-900/20 border-green-800/50'
                      : 'text-gray-400 bg-gray-800/50 border-gray-700'
                  "
                >
                  {{ poll.status === "ACTIVE" ? "Активен" : "Завершён" }}
                </span>
              </div>

              <!-- Варианты ответа с процентами -->
              <div class="space-y-2.5">
                <div
                  v-for="option in poll.options"
                  :key="option.option_id"
                  class="relative overflow-hidden bg-[#222533] border border-gray-700/50 rounded-lg p-3"
                >
                  <div
                    class="absolute inset-y-0 left-0 bg-[#8294FF]/20 transition-all duration-500"
                    :style="{
                      width:
                        getOptionPercent(poll.total_votes, option.votes_count) +
                        '%',
                    }"
                  ></div>

                  <div
                    class="relative flex items-center justify-between text-xs"
                  >
                    <span class="font-medium text-gray-200">
                      {{ option.content }}
                    </span>
                    <span class="text-gray-400 font-bold">
                      {{
                        getOptionPercent(poll.total_votes, option.votes_count)
                      }}% ({{ option.votes_count }})
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="mt-auto pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-400"
              >
                <span>Всего проголосовало: {{ poll.total_votes }}</span>
                <span>{{ formatDate(poll.created_at) }}</span>
              </div>
            </div>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { api, getMediaUrl, formatDate } from "../api";

const isLoading = ref(true);
const errorMessage = ref("");

// Общие показатели разработчика
const summary = ref({
  total_games: 0,
  total_subscribers: 0,
  total_news: 0,
  published_news: 0,
  draft_news: 0,
  total_polls: 0,
  active_polls: 0,
  total_votes: 0,
});

// Список игр со статистикой
const games = ref<any[]>([]);

// Среднее количество подписчиков на одну игру
const averageSubscribers = computed(() => {
  if (!summary.value.total_games) return 0;
  return Math.round(
    summary.value.total_subscribers / summary.value.total_games,
  );
});

// Максимальное число подписчиков среди игр (для расчёта ширины полоски)
const maxSubscribers = computed(() => {
  if (games.value.length === 0) return 1;
  const max = Math.max(...games.value.map((g) => g.subscribers_count || 0));
  return max > 0 ? max : 1;
});

// Ширина полоски подписчиков в процентах
const getSubscriberBarWidth = (count: number) => {
  if (count <= 0) return 4;
  return Math.max(8, Math.round((count / maxSubscribers.value) * 100));
};

// Собираем все опросы всех игр разработчика в один удобный список
const allPolls = computed(() => {
  const list: any[] = [];

  for (const game of games.value) {
    if (Array.isArray(game.polls)) {
      for (const poll of game.polls) {
        list.push({
          ...poll,
          gameTitle: game.title,
          gameId: game.game_id,
        });
      }
    }
  }

  return list;
});

// Процент голосов за конкретный вариант ответа
const getOptionPercent = (totalVotes: number, optionVotes: number) => {
  if (!totalVotes) return 0;
  return Math.round((optionVotes / totalVotes) * 100);
};

// Загрузка аналитики с бэкенда
const loadAnalytics = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.get("/games/developer/analytics");
    summary.value = response.data.summary;
    games.value = response.data.games;
  } catch (error: any) {
    console.error("Ошибка загрузки аналитики:", error);
    errorMessage.value =
      error.response?.data?.message ||
      "Не удалось загрузить аналитику разработчика.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadAnalytics);
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
