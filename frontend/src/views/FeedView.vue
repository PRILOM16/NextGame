<template>
  <div class="w-full animate-fade-in pb-12">
    <!-- Заголовок -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white">Лента новостей</h1>

      <p class="text-sm text-gray-400 mt-2">
        Новости и опросы игр, на которые вы подписаны
      </p>
    </div>

    <div class="max-w-3xl">
      <!-- Загрузка -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="loader"></div>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="text-red-400">
        {{ error }}
      </div>

      <!-- Пустая лента -->
      <div
        v-else-if="feed.length === 0"
        class="bg-[#181A24] border border-gray-800/50 rounded-xl p-8 text-center"
      >
        <p class="text-gray-400">
          Пока нет публикаций. Подпишитесь на игры, чтобы видеть их новости и
          опросы.
        </p>
      </div>

      <!-- Публикации -->
      <div v-else class="space-y-6">
        <article
          v-for="item in feed"
          :key="`${item.type}-${item.id}`"
          class="bg-[#181A24] border border-gray-800/50 rounded-xl p-5 shadow-sm"
        >
          <!-- Информация об игре -->
          <div class="flex items-center gap-3 mb-4">
            <img
              v-if="item.game.cover_url"
              :src="getMediaUrl(item.game.cover_url)"
              class="w-10 h-10 rounded-lg object-cover"
              :alt="item.game.title"
            />

            <div
              v-else
              class="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center"
            >
              <span class="text-gray-400 text-xs">GAME</span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-white">
                {{ item.game.title }}
              </p>

              <p class="text-xs text-gray-500">
                {{ formatDate(item.created_at) }}
              </p>
            </div>

            <span
              class="text-[10px] px-2 py-1 rounded border uppercase"
              :class="
                item.type === 'NEWS'
                  ? 'text-blue-400 bg-blue-900/20 border-blue-800/50'
                  : 'text-purple-400 bg-purple-900/20 border-purple-800/50'
              "
            >
              {{ item.type === "NEWS" ? "Новость" : "Опрос" }}
            </span>
          </div>

          <!-- НОВОСТЬ -->
          <template v-if="item.type === 'NEWS'">
            <h2 class="text-xl font-bold text-white mb-3">
              {{ item.title }}
            </h2>

            <img
              v-if="item.image_url"
              :src="getMediaUrl(item.image_url)"
              :alt="item.title"
              class="w-full max-h-96 object-cover rounded-lg mb-4"
            />

            <p
              class="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed"
            >
              {{ item.content }}
            </p>
          </template>

          <!-- ОПРОС -->
          <template v-else-if="item.type === 'POLL'">
            <div class="flex items-start justify-between gap-3 mb-3">
              <h2 class="text-xl font-bold text-white">
                {{ item.question }}
              </h2>

              <span
                class="shrink-0 text-[10px] px-2 py-1 rounded border"
                :class="
                  isPollActive(item)
                    ? 'text-green-400 bg-green-900/20 border-green-800/50'
                    : 'text-gray-400 bg-gray-800/50 border-gray-700'
                "
              >
                {{ isPollActive(item) ? "Активен" : "Завершён" }}
              </span>
            </div>

            <p
              v-if="item.description"
              class="text-sm text-gray-400 whitespace-pre-wrap mb-4"
            >
              {{ item.description }}
            </p>

            <img
              v-if="item.image_url"
              :src="getMediaUrl(item.image_url)"
              :alt="item.question"
              class="w-full max-h-96 object-cover rounded-lg mb-4"
            />

            <!-- Варианты ответов -->
            <div class="space-y-3">
              <div v-for="option in item.options" :key="option.option_id">
                <!-- Результаты, если пользователь проголосовал -->
                <div
                  v-if="item.user_vote !== null"
                  class="relative overflow-hidden bg-[#222533] border border-gray-700/50 rounded-lg p-3"
                >
                  <div
                    class="absolute inset-y-0 left-0 bg-[#8294FF]/15 transition-all duration-500"
                    :style="{
                      width: getVotePercentage(item, option) + '%',
                    }"
                  ></div>

                  <div class="relative flex items-center justify-between gap-3">
                    <span
                      class="text-sm text-gray-200"
                      :class="{
                        'font-bold text-white':
                          item.user_vote === option.option_id,
                      }"
                    >
                      {{ option.content }}

                      <span
                        v-if="item.user_vote === option.option_id"
                        class="text-[#8294FF] ml-1"
                      >
                        ✓
                      </span>
                    </span>

                    <span class="text-xs text-gray-400 whitespace-nowrap">
                      {{ getVotePercentage(item, option) }}% ({{
                        option.votes_count
                      }})
                    </span>
                  </div>
                </div>

                <!-- Выбор варианта -->
                <button
                  v-else
                  @click="selectOption(item.id, option.option_id)"
                  :disabled="!isPollActive(item)"
                  class="w-full text-left bg-[#222533] border rounded-lg p-3 text-sm transition-all"
                  :class="
                    selectedOptions[item.id] === option.option_id
                      ? 'border-[#8294FF] bg-[#8294FF]/10 text-white'
                      : 'border-gray-700/50 text-gray-300 hover:border-gray-500'
                  "
                >
                  {{ option.content }}
                </button>
              </div>
            </div>

            <!-- Управление голосованием -->
            <div
              v-if="item.user_vote === null"
              class="mt-4 flex items-center justify-between gap-3"
            >
              <p class="text-xs text-gray-500">
                {{ item.total_votes }} голосов
              </p>

              <button
                @click="vote(item.id)"
                :disabled="
                  !selectedOptions[item.id] ||
                  !isPollActive(item) ||
                  votingPollId === item.id
                "
                class="px-5 py-2 rounded-lg text-xs font-bold transition-all"
                :class="
                  selectedOptions[item.id] && isPollActive(item)
                    ? 'bg-[#8294FF] hover:bg-[#6c80ff] text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                "
              >
                {{ votingPollId === item.id ? "Отправка..." : "Проголосовать" }}
              </button>
            </div>

            <!-- Пользователь уже проголосовал -->
            <div v-else class="mt-4 flex items-center justify-between">
              <span class="text-xs text-green-400"> ✓ Ваш голос учтён </span>

              <span class="text-xs text-gray-500">
                {{ item.total_votes }} голосов
              </span>
            </div>

            <p v-if="item.ends_at" class="text-xs text-gray-500 mt-3">
              Завершение: {{ formatDate(item.ends_at) }}
            </p>
          </template>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";
import { useAuthStore } from "../stores/auth";

// Игра
interface FeedGame {
  game_id: number;
  title: string;
  cover_url: string | null;
}

// Новость
interface NewsItem {
  type: "NEWS";
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  game: FeedGame;
}

// Вариант ответа
interface PollOption {
  option_id: number;
  content: string;
  votes_count: number;
}

// Опрос
interface PollItem {
  type: "POLL";
  id: number;
  question: string;
  description: string;
  image_url: string | null;
  status: string;
  ends_at: string | null;
  created_at: string;
  user_vote: number | null;
  options: PollOption[];
  total_votes: number;
  game: FeedGame;
}

// Общий тип публикации
type FeedItem = NewsItem | PollItem;

const authStore = useAuthStore();

const feed = ref<FeedItem[]>([]);
const loading = ref(true);
const error = ref("");

const votingPollId = ref<number | null>(null);
const selectedOptions = ref<Record<number, number>>({});

// Загрузка ленты
const loadFeed = async (showLoading = true) => {
  try {
    if (showLoading) {
      loading.value = true;
    }

    error.value = "";

    const response = await api.get<FeedItem[]>("/feed");
    feed.value = response.data;
  } catch (err) {
    console.error("Ошибка загрузки ленты:", err);
    error.value = "Не удалось загрузить публикации.";
  } finally {
    if (showLoading) {
      loading.value = false;
    }
  }
};

// Формирование адреса изображения
const getMediaUrl = (path: string | null) => {
  if (!path) return "";

  if (path.startsWith("http")) {
    return path;
  }

  return `${api.defaults.baseURL}${path}`;
};

// Форматирование даты
const formatDate = (date: string) => {
  return new Date(date).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Проверка активности опроса
const isPollActive = (poll: PollItem) => {
  return poll.status === "ACTIVE";
};

// Выбор варианта ответа
const selectOption = (pollId: number, optionId: number) => {
  const poll = feed.value.find(
    (item): item is PollItem => item.type === "POLL" && item.id === pollId,
  );

  if (!poll || !isPollActive(poll) || poll.user_vote !== null) {
    return;
  }

  selectedOptions.value[pollId] = optionId;
};

// Расчёт процента голосов
const getVotePercentage = (poll: PollItem, option: PollOption) => {
  if (!poll.total_votes) {
    return 0;
  }

  return Math.round((option.votes_count / poll.total_votes) * 100);
};

// Отправка голоса
const vote = async (pollId: number) => {
  const optionId = selectedOptions.value[pollId];

  if (!optionId) return;

  if (!authStore.token) {
    alert("Войдите в аккаунт, чтобы голосовать!");
    return;
  }

  votingPollId.value = pollId;

  try {
    await api.post(`/polls/${pollId}/vote`, {
      optionId: optionId,
    });

    delete selectedOptions.value[pollId];

    // Обновляем данные ленты, не показывая экран загрузки
    await loadFeed(false);
  } catch (err: any) {
    console.error("Ошибка голосования:", err);

    alert(
      err.response?.data?.message ||
        "Не удалось проголосовать. Возможно, вы уже голосовали.",
    );

    await loadFeed(false);
  } finally {
    votingPollId.value = null;
  }
};

// Первоначальная загрузка
onMounted(() => {
  loadFeed();
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
