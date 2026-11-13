<template>
  <div class="w-full animate-fade-in pb-12">
    <!-- Загрузка -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="loader"></div>
    </div>

    <!-- Если игра не найдена -->
    <div v-else-if="!game" class="text-center py-20 text-gray-400">
      Игра не найдена
    </div>

    <div v-else class="flex flex-col gap-6">
      <!-- 1. ШАПКА ИГРЫ -->
      <div
        class="bg-[#1C1F2B] rounded-xl overflow-hidden border border-gray-800/50 shadow-lg relative h-64 flex flex-col justify-end p-8"
      >
        <div class="absolute inset-0 z-0">
          <img
            v-if="game.cover_url"
            :src="getMediaUrl(game.cover_url)"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-[#1e254a] to-[#0c0e14]"
          ></div>

          <div
            class="absolute inset-0 bg-gradient-to-t from-[#1C1F2B] via-[#1C1F2B]/80 to-transparent"
          ></div>
        </div>

        <div class="relative z-10">
          <h1 class="text-4xl font-bold text-white mb-2">
            {{ game.title }}
          </h1>

          <p class="text-gray-300 text-sm max-w-2xl mb-4">
            {{ game.description }}
          </p>

          <div class="flex items-center gap-3 mb-5">
            <span
              class="px-2.5 py-1 bg-[#111111]/60 border border-gray-700/50 rounded text-xs text-gray-300"
            >
              Разработчик: {{ game.developer?.name || "Студия" }}
            </span>

            <span
              class="px-2.5 py-1 bg-[#111111]/60 border border-gray-700/50 rounded text-xs text-gray-300"
            >
              👥 {{ game.subscribers_count ?? 0 }} подписчиков
            </span>
          </div>

          <button
            v-if="!isDeveloper"
            @click="toggleSubscribe"
            :disabled="isSubmitting"
            :class="
              isSubscribed
                ? 'bg-[#222533] border border-gray-700 text-white'
                : 'bg-[#8294FF] hover:bg-[#6c80ff] text-white'
            "
            class="px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
          >
            {{
              isSubmitting
                ? "Подождите..."
                : isSubscribed
                  ? "✓ Вы подписаны"
                  : "+ Подписаться"
            }}
          </button>
        </div>
      </div>

      <!-- 2. КАРТОЧКИ СТАТИСТИКИ ИГРЫ -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-[#181A24] p-5 rounded-xl border border-gray-800/50">
          <p class="text-[10px] text-gray-500 mb-1 font-semibold uppercase">
            Подписчики
          </p>
          <p class="text-2xl font-bold text-white">
            {{ game.subscribers_count ?? 0 }}
          </p>
        </div>

        <div class="bg-[#181A24] p-5 rounded-xl border border-gray-800/50">
          <p class="text-[10px] text-gray-500 mb-1 font-semibold uppercase">
            Публикации
          </p>
          <p class="text-2xl font-bold text-white">
            {{ posts.length }}
          </p>
        </div>

        <div class="bg-[#181A24] p-5 rounded-xl border border-gray-800/50">
          <p class="text-[10px] text-gray-500 mb-1 font-semibold uppercase">
            Активные опросы
          </p>
          <p class="text-2xl font-bold text-white">
            {{ activePollsCount }}
          </p>
        </div>

        <div class="bg-[#181A24] p-5 rounded-xl border border-gray-800/50">
          <p class="text-[10px] text-gray-500 mb-1 font-semibold uppercase">
            Дата добавления
          </p>
          <p class="text-base font-bold text-white">
            {{ formatDate(game.created_at) }}
          </p>
        </div>
      </div>

      <!-- 3. НОВОСТИ И ОПРОСЫ ИГРЫ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        <!-- Колонка новостей -->
        <section class="space-y-4">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider">
            Новости игры
          </h2>

          <div
            v-if="posts.length === 0"
            class="bg-[#181A24] border border-gray-800/50 rounded-xl p-8 text-center text-sm text-gray-500"
          >
            Пока нет опубликованных новостей.
          </div>

          <div
            v-for="post in posts"
            :key="post.news_id"
            class="bg-[#181A24] border border-gray-800/50 rounded-xl p-5 shadow-sm"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-bold text-white">{{ post.title }}</h3>
              <span class="text-xs text-gray-500">
                {{ formatDate(post.created_at) }}
              </span>
            </div>

            <!-- Прикреплённое фото новости -->
            <img
              v-if="post.image_url"
              :src="getMediaUrl(post.image_url)"
              :alt="post.title"
              class="w-full max-h-80 object-cover rounded-lg mb-4"
            />

            <p class="text-sm text-gray-300 whitespace-pre-wrap">
              {{ post.content }}
            </p>
          </div>
        </section>

        <!-- Колонка опросов -->
        <section class="space-y-4">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider">
            Опросы сообщества
          </h2>

          <div
            v-if="polls.length === 0"
            class="bg-[#181A24] border border-gray-800/50 rounded-xl p-8 text-center text-sm text-gray-500"
          >
            Пока нет опросов.
          </div>

          <div
            v-for="poll in polls"
            :key="poll.poll_id"
            class="bg-[#181A24] border border-gray-800/50 rounded-xl p-5 shadow-sm"
          >
            <div class="flex items-start justify-between gap-3 mb-4">
              <h3 class="text-lg font-bold text-white">{{ poll.question }}</h3>

              <div class="flex items-center gap-2 shrink-0">
                <!-- Кнопка завершения опроса для разработчика -->
                <button
                  v-if="isDeveloper && poll.status === 'ACTIVE'"
                  @click="closePoll(poll.poll_id)"
                  class="text-[10px] px-2.5 py-1 rounded border border-red-800/50 bg-red-900/20 text-red-400 hover:bg-red-900/40"
                >
                  Завершить
                </button>

                <span
                  class="text-[10px] px-2 py-1 rounded border"
                  :class="
                    poll.status === 'ACTIVE'
                      ? 'text-green-400 bg-green-900/20 border-green-800/50'
                      : 'text-gray-400 bg-gray-800/50 border-gray-700'
                  "
                >
                  {{ poll.status === "ACTIVE" ? "Активен" : "Завершён" }}
                </span>
              </div>
            </div>

            <img
              v-if="poll.image_url"
              :src="getMediaUrl(poll.image_url)"
              class="w-full max-h-64 object-cover rounded-lg mb-4"
            />

            <!-- Варианты ответа -->
            <div class="space-y-2.5">
              <div v-for="option in poll.options" :key="option.option_id">
                <!-- Показываем результаты, если игрок уже голосовал или это разработчик -->
                <div
                  v-if="
                    hasVoted(poll.poll_id) ||
                    isDeveloper ||
                    poll.status !== 'ACTIVE'
                  "
                  class="relative overflow-hidden bg-[#222533] border border-gray-700/50 rounded-lg p-3"
                >
                  <div
                    class="absolute inset-y-0 left-0 bg-[#8294FF]/15 transition-all duration-500"
                    :style="{ width: getVotePercentage(poll, option) + '%' }"
                  ></div>

                  <div class="relative flex items-center justify-between gap-3">
                    <span class="text-sm text-gray-200">
                      {{ option.content }}
                      <span
                        v-if="getUserVote(poll.poll_id) === option.option_id"
                        class="text-[#8294FF] font-bold ml-1"
                      >
                        ✓
                      </span>
                    </span>

                    <span class="text-xs text-gray-400">
                      {{ getVotePercentage(poll, option) }}% ({{
                        option.votes_count
                      }})
                    </span>
                  </div>
                </div>

                <!-- Кнопка выбора варианта для голосования -->
                <button
                  v-else
                  @click="selectedOptions[poll.poll_id] = option.option_id"
                  class="w-full text-left bg-[#222533] border rounded-lg p-3 text-sm transition-all"
                  :class="
                    selectedOptions[poll.poll_id] === option.option_id
                      ? 'border-[#8294FF] bg-[#8294FF]/10 text-white'
                      : 'border-gray-700/50 text-gray-300 hover:border-gray-500'
                  "
                >
                  {{ option.content }}
                </button>
              </div>
            </div>

            <!-- Кнопка голосования -->
            <div
              v-if="
                canVote && !hasVoted(poll.poll_id) && poll.status === 'ACTIVE'
              "
              class="mt-4 flex items-center justify-between"
            >
              <span class="text-xs text-gray-500">
                Всего голосов: {{ getTotalVotes(poll) }}
              </span>

              <button
                @click="vote(poll.poll_id)"
                :disabled="!selectedOptions[poll.poll_id]"
                class="px-4 py-2 rounded-lg text-xs font-bold bg-[#8294FF] hover:bg-[#6c80ff] text-white disabled:bg-gray-700 disabled:text-gray-400"
              >
                Проголосовать
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { api, getMediaUrl, formatDate } from "../api";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const authStore = useAuthStore();

const isDeveloper = computed(() => authStore.user?.role === "DEVELOPER");
const canVote = computed(() => authStore.user?.role === "USER");

const isLoading = ref(true);
const isSubmitting = ref(false);

const game = ref<any>(null);
const posts = ref<any[]>([]);
const polls = ref<any[]>([]);
const userVotes = ref<{ poll_id: number; option_id: number }[]>([]);
const selectedOptions = ref<Record<number, number>>({});
const isSubscribed = ref(false);

const activePollsCount = computed(() => {
  return polls.value.filter((p) => p.status === "ACTIVE").length;
});

const hasVoted = (pollId: number) => {
  return userVotes.value.some((v) => v.poll_id === pollId);
};

const getUserVote = (pollId: number) => {
  return userVotes.value.find((v) => v.poll_id === pollId)?.option_id;
};

const getTotalVotes = (poll: any) => {
  return poll.options.reduce(
    (sum: number, opt: any) => sum + Number(opt.votes_count || 0),
    0,
  );
};

const getVotePercentage = (poll: any, option: any) => {
  const total = getTotalVotes(poll);
  if (!total) return 0;
  return Math.round((option.votes_count / total) * 100);
};

// Загрузка всех данных страницы игры
const loadGameData = async (gameId: string) => {
  isLoading.value = true;

  try {
    const [gameRes, newsRes, pollsRes] = await Promise.all([
      api.get(`/games/${gameId}`),
      api.get(`/games/${gameId}/news`),
      api.get(`/games/${gameId}/polls`),
    ]);

    game.value = gameRes.data;
    posts.value = newsRes.data;
    polls.value = pollsRes.data;

    if (authStore.token) {
      const votesRes = await api.get("/polls/my-votes");
      userVotes.value = votesRes.data;

      if (authStore.user?.role === "USER") {
        const subRes = await api.get("/subscriptions/my");
        isSubscribed.value = subRes.data.some(
          (sub: any) => Number(sub.game?.game_id) === Number(gameId),
        );
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки страницы игры:", error);
  } finally {
    isLoading.value = false;
  }
};

// Голосование в опросе
const vote = async (pollId: number) => {
  const optionId = selectedOptions.value[pollId];
  if (!optionId) return;

  try {
    await api.post(`/polls/${pollId}/vote`, { optionId });
    delete selectedOptions.value[pollId];
    await loadGameData(String(route.params.id));
  } catch (error: any) {
    alert(error.response?.data?.message || "Ошибка при голосовании.");
  }
};

// Завершение опроса разработчиком
const closePoll = async (pollId: number) => {
  if (!confirm("Вы уверены, что хотите завершить этот опрос?")) return;

  try {
    await api.post(`/polls/${pollId}/close`);
    await loadGameData(String(route.params.id));
  } catch (error: any) {
    alert(error.response?.data?.message || "Не удалось завершить опрос.");
  }
};

// Подписка / отписка от игры
const toggleSubscribe = async () => {
  if (!authStore.user) {
    alert("Войдите в аккаунт, чтобы подписываться на игры!");
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await api.post(`/subscriptions/${route.params.id}`);
    const newState = response.data.isSubscribed;

    if (game.value && newState !== isSubscribed.value) {
      game.value.subscribers_count = Math.max(
        0,
        (game.value.subscribers_count || 0) + (newState ? 1 : -1),
      );
    }

    isSubscribed.value = newState;
    window.dispatchEvent(new Event("subscriptions-changed"));
  } catch (error: any) {
    alert(error.response?.data?.message || "Не удалось изменить подписку.");
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => route.params.id,
  (newId) => {
    if (newId) loadGameData(String(newId));
  },
  { immediate: true },
);
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
