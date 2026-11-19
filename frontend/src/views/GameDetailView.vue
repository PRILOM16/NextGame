<template>
  <div class="w-full animate-fade-in pb-12">
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="loader"></div>
    </div>

    <div v-else-if="!game" class="text-center py-20 text-gray-400">
      Игра не найдена
    </div>

    <div v-else class="flex flex-col gap-6">
      <!-- ШАПКА ИГРЫ -->
      <div
        class="bg-[#1C1F2B] rounded-xl overflow-hidden border border-gray-800/50 shadow-lg relative h-64 flex flex-col justify-end p-8"
      >
        <div class="absolute inset-0 z-0">
          <img
            v-if="game.cover_url"
            :src="`http://localhost:3000${game.cover_url}`"
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
          <span
            class="inline-block bg-green-900/40 text-green-400 border border-green-800/50 text-[10px] px-2 py-0.5 rounded mb-3 uppercase tracking-wider font-bold"
          >
            Доступна
          </span>

          <h1 class="text-4xl font-bold text-white mb-2">
            {{ game.title }}
          </h1>

          <p class="text-gray-400 text-sm max-w-2xl mb-4">
            {{ game.description }}
          </p>

          <div class="flex items-center gap-3 mb-6">
            <span
              class="px-2.5 py-1 bg-[#111111]/50 border border-gray-700/50 rounded text-xs text-gray-400"
            >
              {{ game.genre || "Инди" }}
            </span>

            <span
              class="px-2.5 py-1 bg-[#111111]/50 border border-gray-700/50 rounded text-xs text-gray-400"
            >
              {{ game.subscribers_count ?? 0 }} подписчиков
            </span>
          </div>

          <button
            @click="toggleSubscribe"
            :disabled="isSubmitting"
            :class="
              isSubscribed
                ? 'bg-[#222533] border border-gray-700 text-white'
                : 'bg-[#8294FF] hover:bg-[#6c80ff] text-white border border-transparent shadow-lg'
            "
            class="px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
          >
            <span v-if="isSubmitting" class="loader-small"></span>
            <span v-else-if="!isSubscribed">+ Подписаться</span>
            <span v-else>✓ Вы подписаны</span>
          </button>
        </div>
      </div>

      <!-- СТАТИСТИКА -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          class="bg-[#181A24] p-5 rounded-xl border border-gray-800/50 shadow-sm"
        >
          <p class="text-[10px] text-gray-500 mb-1 font-semibold uppercase">
            Подписчики
          </p>
          <p class="text-2xl font-bold text-white">
            {{ game.subscribers_count ?? 0 }}
          </p>
        </div>

        <div
          class="bg-[#181A24] p-5 rounded-xl border border-gray-800/50 shadow-sm"
        >
          <p class="text-[10px] text-gray-500 mb-1 font-semibold uppercase">
            Публикации
          </p>
          <p class="text-2xl font-bold text-white">
            {{ posts.length }}
          </p>
        </div>

        <div
          class="bg-[#181A24] p-5 rounded-xl border border-gray-800/50 shadow-sm"
        >
          <p class="text-[10px] text-gray-500 mb-1 font-semibold uppercase">
            Активные опросы
          </p>
          <p class="text-2xl font-bold text-white">
            {{ activePollsCount }}
          </p>
        </div>

        <div
          class="bg-[#181A24] p-5 rounded-xl border border-gray-800/50 shadow-sm"
        >
          <p class="text-[10px] text-gray-500 mb-1 font-semibold uppercase">
            Последнее обновление
          </p>
          <p class="text-lg font-bold text-white">
            {{ new Date(game.created_at).toLocaleDateString() }}
          </p>
        </div>
      </div>

      <!-- ЛЕНТА И ОБ ИГРЕ -->
      <div class="flex flex-col lg:flex-row gap-6 mt-4 items-start">
        <div class="flex-1 w-full space-y-6">
          <h2
            class="text-sm font-bold text-white mb-2 uppercase tracking-wider"
          >
            Новости и опросы
          </h2>

          <!-- ПУБЛИКАЦИИ -->
          <section class="space-y-4">
            <h3
              class="text-xs font-bold text-gray-400 uppercase tracking-wider"
            >
              Публикации
            </h3>

            <div
              v-if="posts.length === 0"
              class="bg-[#181A24] border border-gray-800/50 rounded-xl p-8 text-center"
            >
              <p class="text-sm text-gray-500">Пока нет публикаций.</p>
            </div>

            <div
              v-for="post in posts"
              :key="post.id ?? post.news_id"
              class="bg-[#181A24] border border-gray-800/50 rounded-xl p-5 shadow-sm"
            >
              <h3 class="text-lg font-bold text-white mb-2">
                {{ post.title }}
              </h3>

              <p class="text-sm text-gray-400 whitespace-pre-wrap">
                {{ post.content }}
              </p>
            </div>
          </section>

          <!-- ОПРОСЫ -->
          <section class="space-y-4">
            <h3
              class="text-xs font-bold text-gray-400 uppercase tracking-wider"
            >
              Опросы
            </h3>

            <div
              v-if="polls.length === 0"
              class="bg-[#181A24] border border-gray-800/50 rounded-xl p-8 text-center"
            >
              <p class="text-sm text-gray-500">Пока нет опросов.</p>
            </div>

            <div
              v-for="poll in polls"
              :key="poll.poll_id"
              class="bg-[#181A24] border border-gray-800/50 rounded-xl p-5 shadow-sm"
            >
              <!-- ВОПРОС -->
              <!-- ВОПРОС И УПРАВЛЕНИЕ ОПРОСОМ -->
              <div class="flex items-start justify-between gap-3 mb-4">
                <h3 class="text-lg font-bold text-white">
                  {{ poll.question }}
                </h3>

                <div class="flex items-center gap-2 shrink-0">
                  <!-- КНОПКА ЗАКРЫТИЯ ДЛЯ РАЗРАБОТЧИКА -->
                  <button
                    v-if="isDeveloper && isPollActive(poll)"
                    @click="openClosePollModal(poll.poll_id)"
                    :disabled="closingPollId === poll.poll_id"
                    class="text-[10px] px-3 py-1.5 rounded-lg border border-red-800/50 bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-all disabled:opacity-50"
                  >
                    {{
                      closingPollId === poll.poll_id
                        ? "Завершение..."
                        : "Завершить"
                    }}
                  </button>

                  <!-- СТАТУС ОПРОСА -->
                  <span
                    class="text-[10px] px-2 py-1 rounded border"
                    :class="
                      isPollActive(poll)
                        ? 'text-green-400 bg-green-900/20 border-green-800/50'
                        : 'text-gray-400 bg-gray-800/50 border-gray-700'
                    "
                  >
                    {{ isPollActive(poll) ? "Активен" : "Завершён" }}
                  </span>
                </div>
              </div>

              <!-- ВАРИАНТЫ ОТВЕТОВ -->
              <div class="space-y-3">
                <div v-for="option in poll.options" :key="option.option_id">
                  <!-- ЕСЛИ ПОЛЬЗОВАТЕЛЬ УЖЕ ПРОГОЛОСОВАЛ -->
                  <div
                    v-if="hasVoted(poll.poll_id) || isDeveloper"
                    class="relative overflow-hidden bg-[#222533] border border-gray-700/50 rounded-lg p-3"
                  >
                    <div
                      class="absolute inset-y-0 left-0 bg-[#8294FF]/15 transition-all duration-500"
                      :style="{
                        width: getVotePercentage(poll, option) + '%',
                      }"
                    ></div>

                    <div
                      class="relative flex items-center justify-between gap-3"
                    >
                      <span
                        class="text-sm text-gray-200"
                        :class="{
                          'font-bold text-white':
                            getUserVote(poll.poll_id) === option.option_id,
                        }"
                      >
                        {{ option.content }}

                        <span
                          v-if="getUserVote(poll.poll_id) === option.option_id"
                          class="text-[#8294FF] ml-1"
                        >
                          ✓
                        </span>
                      </span>

                      <span class="text-xs text-gray-400 whitespace-nowrap">
                        {{ getVotePercentage(poll, option) }}% ({{
                          option.votes_count
                        }})
                      </span>
                    </div>
                  </div>

                  <!-- ЕСЛИ ЕЩЁ НЕ ПРОГОЛОСОВАЛ -->
                  <button
                    v-else-if="canVote"
                    @click="selectOption(poll.poll_id, option.option_id)"
                    :disabled="!isPollActive(poll)"
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

              <!-- КНОПКА ГОЛОСОВАНИЯ -->
              <div
                v-if="canVote && !hasVoted(poll.poll_id)"
                class="mt-4 flex items-center justify-between gap-3"
              >
                <p class="text-xs text-gray-500">
                  {{ getTotalVotes(poll) }} голосов
                </p>

                <button
                  @click="vote(poll.poll_id)"
                  :disabled="
                    !selectedOptions[poll.poll_id] ||
                    !isPollActive(poll) ||
                    votingPollId === poll.poll_id
                  "
                  class="px-5 py-2 rounded-lg text-xs font-bold transition-all"
                  :class="
                    selectedOptions[poll.poll_id] && isPollActive(poll)
                      ? 'bg-[#8294FF] hover:bg-[#6c80ff] text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  "
                >
                  <span v-if="votingPollId === poll.poll_id">
                    Отправка...
                  </span>
                  <span v-else> Проголосовать </span>
                </button>
              </div>

              <!-- ЕСЛИ УЖЕ ПРОГОЛОСОВАЛ -->
              <div
                v-else-if="hasVoted(poll.poll_id)"
                class="mt-4 flex items-center justify-between"
              >
                <span class="text-xs text-green-400">✓ Ваш голос учтён</span>

                <span class="text-xs text-gray-500">
                  {{ getTotalVotes(poll) }} голосов
                </span>
              </div>
            </div>
          </section>
        </div>

        <!-- ИНФОРМАЦИЯ ОБ ИГРЕ -->
        <aside
          class="w-full lg:w-80 bg-[#181A24] border border-gray-800/50 rounded-xl p-6 shadow-sm sticky top-24"
        >
          <h3 class="text-sm font-bold text-white mb-4">Об игре</h3>

          <div>
            <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              Разработчик
            </p>

            <p class="text-sm text-gray-200 font-medium">
              {{ game.developer?.name || "Студия" }}
            </p>
          </div>
        </aside>
      </div>
    </div>

    <!-- МОДАЛЬНОЕ ОКНО ЗАВЕРШЕНИЯ ОПРОСА -->
    <div
      v-if="isClosePollModalOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      @click.self="cancelClosePoll"
    >
      <div
        class="w-full max-w-md bg-[#1C1F2B] border border-gray-700/70 rounded-2xl shadow-2xl p-6 animate-fade-in"
      >
        <!-- ИКОНКА -->
        <div
          class="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.7 3h16.96a2 2 0 0 0 1.7-3L13.7 3.86a2 2 0 0 0-3.4 0Z"
            />
          </svg>
        </div>

        <!-- ЗАГОЛОВОК -->
        <h2 class="text-xl font-bold text-white mb-2">Завершить опрос?</h2>

        <p class="text-sm text-gray-400 leading-relaxed mb-5">
          После завершения пользователи больше не смогут голосовать. Результаты
          голосования останутся доступными для просмотра.
        </p>

        <!-- ПРЕДУПРЕЖДЕНИЕ -->
        <div class="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-6">
          <p class="text-xs text-red-300">
            Это действие нельзя отменить. Убедитесь, что хотите завершить
            голосование.
          </p>
        </div>

        <!-- КНОПКИ -->
        <div class="flex items-center justify-end gap-3">
          <button
            @click="cancelClosePoll"
            :disabled="closingPollId !== null"
            class="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-300 bg-[#292D3D] hover:bg-[#353A4D] transition-colors disabled:opacity-50"
          >
            Отмена
          </button>

          <button
            @click="selectedPollId && closePoll(selectedPollId)"
            :disabled="closingPollId !== null"
            class="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="closingPollId !== null" class="loader-small"></span>

            {{ closingPollId !== null ? "Завершение..." : "Завершить опрос" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { api } from "../api";
import { useAuthStore } from "../stores/auth";
const isDeveloper = computed(() => authStore.user?.role === "DEVELOPER");

const canVote = computed(() => authStore.user?.role === "USER");

interface PollOption {
  option_id: number;
  content: string;
  votes_count: number;
}

interface Poll {
  poll_id: number;
  question: string;
  status: string;
  options: PollOption[];
  ends_at: string | null;
}

interface UserVote {
  poll_id: number;
  option_id: number;
}

const route = useRoute();
const authStore = useAuthStore();

const isLoading = ref(true);
const isSubmitting = ref(false);
const votingPollId = ref<number | null>(null);
const closingPollId = ref<number | null>(null);
const isClosePollModalOpen = ref(false);
const selectedPollId = ref<number | null>(null);

const game = ref<any>(null);
const posts = ref<any[]>([]);
const polls = ref<Poll[]>([]);
const userVotes = ref<UserVote[]>([]);
const selectedOptions = ref<Record<number, number>>({});

const isSubscribed = ref(false);

// Количество активных опросов
const activePollsCount = computed(() => {
  return polls.value.filter((poll) => isPollActive(poll)).length;
});

// Проверка активности опроса
const isPollActive = (poll: Poll) => {
  if (poll.status !== "ACTIVE") return false;

  if (poll.ends_at && new Date(poll.ends_at) <= new Date()) {
    return false;
  }

  return true;
};

// Проверяем, голосовал ли пользователь
const hasVoted = (pollId: number) => {
  return userVotes.value.some((vote) => vote.poll_id === pollId);
};

// Получаем ID выбранного пользователем варианта
const getUserVote = (pollId: number) => {
  return userVotes.value.find((vote) => vote.poll_id === pollId)?.option_id;
};

// Подсчитываем количество всех голосов
const getTotalVotes = (poll: Poll) => {
  return poll.options.reduce(
    (total, option) => total + Number(option.votes_count ?? 0),
    0,
  );
};

// Рассчитываем процент голосов за вариант
const getVotePercentage = (poll: Poll, option: PollOption) => {
  const total = getTotalVotes(poll);

  if (total === 0) {
    return 0;
  }

  return Math.round((option.votes_count / total) * 100);
};

// Выбираем вариант ответа
const selectOption = (pollId: number, optionId: number) => {
  if (!isPollActive(polls.value.find((poll) => poll.poll_id === pollId)!)) {
    return;
  }

  selectedOptions.value[pollId] = optionId;
};

// Загружаем опросы игры
const fetchPolls = async (id: string | string[]) => {
  try {
    const response = await api.get(`/games/${id}/polls`);
    polls.value = response.data;
  } catch (error) {
    console.error("Ошибка загрузки опросов:", error);
    polls.value = [];
  }
};

// Загружаем голоса текущего пользователя
const fetchUserVotes = async () => {
  if (!authStore.token) {
    userVotes.value = [];
    return;
  }

  try {
    const response = await api.get("/polls/my-votes");
    userVotes.value = response.data;
  } catch (error) {
    console.error("Ошибка загрузки голосов пользователя:", error);
    userVotes.value = [];
  }
};

// Отправляем голос
const vote = async (pollId: number) => {
  const optionId = selectedOptions.value[pollId];

  if (!optionId || !authStore.token) {
    alert("Войдите в аккаунт, чтобы голосовать!");
    return;
  }
  if (authStore.user?.role !== "USER") {
    return;
  }

  votingPollId.value = pollId;

  try {
    await api.post(`/polls/${pollId}/vote`, {
      optionId: optionId,
    });

    const gameId = route.params.id;

    if (gameId) {
      await Promise.all([fetchPolls(gameId), fetchUserVotes()]);
    }

    delete selectedOptions.value[pollId];
  } catch (error: any) {
    console.error("Ошибка голосования:", error);

    alert(
      error.response?.data?.message ||
        "Не удалось проголосовать. Возможно, вы уже голосовали.",
    );

    const gameId = route.params.id;

    if (gameId) {
      await Promise.all([fetchPolls(gameId), fetchUserVotes()]);
    }
  } finally {
    votingPollId.value = null;
  }
};

// Закрываем опрос (только для разработчика)
const closePoll = async (pollId: number) => {
  if (!isDeveloper.value) return;

  closingPollId.value = pollId;

  try {
    await api.post(`/polls/${pollId}/close`);

    const gameId = route.params.id;

    if (gameId) {
      await fetchPolls(gameId);
    }

    isClosePollModalOpen.value = false;
    selectedPollId.value = null;
  } catch (error: any) {
    console.error("Ошибка закрытия опроса:", error);

    alert(error.response?.data?.message || "Не удалось завершить опрос.");
  } finally {
    closingPollId.value = null;
  }
};

// Открываем окно подтверждения
const openClosePollModal = (pollId: number) => {
  selectedPollId.value = pollId;
  isClosePollModalOpen.value = true;
};

// Закрываем окно подтверждения
const cancelClosePoll = () => {
  if (closingPollId.value !== null) return;

  isClosePollModalOpen.value = false;
  selectedPollId.value = null;
};

// Загрузка всей информации об игре
const loadGame = async (id: string | string[]) => {
  isLoading.value = true;

  game.value = null;
  posts.value = [];
  polls.value = [];
  userVotes.value = [];
  selectedOptions.value = {};
  isSubscribed.value = false;

  try {
    // Загружаем игру
    const gameRes = await api.get(`/games/${id}`);
    game.value = gameRes.data;
  } catch (error) {
    console.error("Ошибка загрузки игры:", error);
    isLoading.value = false;
    return;
  }

  // Загружаем новости и опросы параллельно
  await Promise.all([
    (async () => {
      try {
        const newsRes = await api.get(`/games/${id}/news`);
        posts.value = newsRes.data;
      } catch (error) {
        console.warn("Не удалось загрузить новости:", error);
      }
    })(),

    fetchPolls(id),
  ]);

  // Загружаем профиль, если пользователь авторизован
  try {
    if (authStore.token && !authStore.user) {
      await authStore.fetchProfile();
    }

    // Получаем голоса пользователя
    await fetchUserVotes();

    // Проверяем подписку
    if (authStore.user?.role === "USER") {
      const subRes = await api.get("/subscriptions/my");

      isSubscribed.value = subRes.data.some(
        (sub: any) => Number(sub.game?.game_id) === Number(id),
      );
    }
  } catch (error) {
    console.error("Ошибка загрузки пользовательских данных:", error);
  }

  isLoading.value = false;
};

// Следим за изменением ID игры в URL
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadGame(newId);
    }
  },
  { immediate: true },
);

// Изменение подписки
const toggleSubscribe = async () => {
  if (!authStore.user) {
    alert("Войдите в аккаунт, чтобы подписываться на игры!");
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await api.post(`/subscriptions/${route.params.id}`);

    const wasSubscribed = isSubscribed.value;
    const newState = response.data.isSubscribed;

    isSubscribed.value = newState;

    if (game.value && newState !== wasSubscribed) {
      const currentCount = Number(game.value.subscribers_count ?? 0);

      game.value.subscribers_count = Math.max(
        0,
        currentCount + (newState ? 1 : -1),
      );
    }

    window.dispatchEvent(new Event("subscriptions-changed"));
  } catch (error: any) {
    console.error("Ошибка подписки:", error);

    alert(
      error.response?.data?.message ||
        "Не удалось изменить подписку. Попробуйте ещё раз.",
    );
  } finally {
    isSubmitting.value = false;
  }
};
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

.loader-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-bottom-color: #fff;
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
