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
        class="bg-[#1C1F2B] rounded-xl overflow-hidden border border-gray-800/50 shadow-lg relative min-h-[260px] flex flex-col justify-end p-8"
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

          <div class="flex flex-wrap items-center gap-3 mb-5">
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

          <div class="flex flex-wrap items-center gap-3">
            <!-- Кнопка подписки для игроков -->
            <button
              v-if="!canManageGame"
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

            <!-- Кнопки управления игрой для её разработчика или суперюзера -->
            <template v-if="canManageGame">
              <router-link
                :to="`/developer/new-publication?gameId=${game.game_id}`"
                class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                + Новость / опрос
              </router-link>

              <button
                @click="startEditGame"
                class="bg-[#222533] hover:bg-[#2A2D3E] border border-[#8294FF]/50 text-[#8294FF] px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                ✏️ Изменить игру
              </button>

              <button
                @click="deleteGame"
                class="bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                🗑️ Удалить игру
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- ФОРМА РЕДАКТИРОВАНИЯ ИГРЫ (показывается при нажатии "Изменить игру") -->
      <div
        v-if="isEditingGame && canManageGame"
        class="bg-[#181A24] border border-[#8294FF]/50 rounded-xl p-6 space-y-4"
      >
        <h2 class="text-lg font-bold text-white">Редактирование игры</h2>

        <form @submit.prevent="saveGameEdit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-400 mb-1">
                Название игры *
              </label>
              <input
                v-model="editGameForm.title"
                type="text"
                required
                class="w-full px-3 py-2 bg-[#111111] border border-gray-700 rounded-lg text-sm text-white"
              />
            </div>

            <div>
              <label class="block text-xs text-gray-400 mb-1">
                Новая обложка (необязательно)
              </label>
              <input
                type="file"
                accept="image/*"
                @change="handleGameCoverSelect"
                class="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#222533] file:text-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-1">
              Описание игры *
            </label>
            <textarea
              v-model="editGameForm.description"
              rows="3"
              required
              class="w-full px-3 py-2 bg-[#111111] border border-gray-700 rounded-lg text-sm text-white"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              type="submit"
              class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-5 py-2 rounded-lg text-xs font-bold"
            >
              Сохранить изменения
            </button>
            <button
              type="button"
              @click="isEditingGame = false"
              class="bg-[#222533] text-gray-300 px-4 py-2 rounded-lg text-xs font-bold"
            >
              Отмена
            </button>
          </div>
        </form>
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
            <!-- Режим редактирования новости -->
            <form
              v-if="editingNewsId === post.news_id"
              @submit.prevent="saveNewsEdit(post.news_id)"
              class="space-y-3"
            >
              <div>
                <label class="block text-xs text-gray-400 mb-1">
                  Заголовок новости
                </label>
                <input
                  v-model="editNewsForm.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-[#111111] border border-gray-700 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label class="block text-xs text-gray-400 mb-1">
                  Текст новости
                </label>
                <textarea
                  v-model="editNewsForm.content"
                  rows="4"
                  required
                  class="w-full px-3 py-2 bg-[#111111] border border-gray-700 rounded-lg text-sm text-white"
                ></textarea>
              </div>

              <div class="flex gap-2">
                <button
                  type="submit"
                  class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  @click="editingNewsId = null"
                  class="bg-[#222533] text-gray-300 px-4 py-1.5 rounded-lg text-xs font-bold"
                >
                  Отмена
                </button>
              </div>
            </form>

            <!-- Обычный просмотр новости -->
            <template v-else>
              <div class="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 class="text-lg font-bold text-white">{{ post.title }}</h3>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(post.created_at) }}
                  </span>
                </div>

                <!-- Кнопки изменения и удаления новости для автора игры или суперюзера -->
                <div v-if="canManageGame" class="flex items-center gap-2 shrink-0">
                  <button
                    @click="startEditNews(post)"
                    class="text-[11px] px-2.5 py-1 rounded bg-[#222533] text-[#8294FF] hover:bg-[#2A2D3E] font-bold"
                  >
                    Изменить
                  </button>
                  <button
                    @click="deleteNews(post.news_id)"
                    class="text-[11px] px-2.5 py-1 rounded bg-red-900/20 border border-red-800/50 text-red-400 hover:bg-red-900/40 font-bold"
                  >
                    Удалить
                  </button>
                </div>
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
            </template>
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
            <!-- Форма редактирования вопроса опроса -->
            <form
              v-if="editingPollId === poll.poll_id"
              @submit.prevent="savePollEdit(poll.poll_id)"
              class="space-y-3 mb-4"
            >
              <div>
                <label class="block text-xs text-gray-400 mb-1">
                  Вопрос опроса
                </label>
                <input
                  v-model="editPollQuestion"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-[#111111] border border-gray-700 rounded-lg text-sm text-white"
                />
              </div>

              <div class="flex gap-2">
                <button
                  type="submit"
                  class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  @click="editingPollId = null"
                  class="bg-[#222533] text-gray-300 px-4 py-1.5 rounded-lg text-xs font-bold"
                >
                  Отмена
                </button>
              </div>
            </form>

            <!-- Шапка опроса -->
            <div v-else class="flex items-start justify-between gap-3 mb-4">
              <h3 class="text-lg font-bold text-white">{{ poll.question }}</h3>

              <div class="flex flex-wrap items-center gap-1.5 shrink-0">
                <!-- Кнопки управления опросом для автора игры или суперюзера -->
                <template v-if="canManageGame">
                  <button
                    @click="startEditPoll(poll)"
                    class="text-[10px] px-2 py-1 rounded bg-[#222533] text-[#8294FF] hover:bg-[#2A2D3E] font-bold"
                  >
                    Изменить
                  </button>

                  <button
                    v-if="poll.status === 'ACTIVE'"
                    @click="closePoll(poll.poll_id)"
                    class="text-[10px] px-2 py-1 rounded border border-yellow-800/50 bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40 font-bold"
                  >
                    Завершить
                  </button>

                  <button
                    @click="deletePoll(poll.poll_id)"
                    class="text-[10px] px-2 py-1 rounded border border-red-800/50 bg-red-900/20 text-red-400 hover:bg-red-900/40 font-bold"
                  >
                    Удалить
                  </button>
                </template>

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
                <!-- Показываем результаты, если игрок уже голосовал или это разработчик/суперюзер -->
                <div
                  v-if="
                    hasVoted(poll.poll_id) ||
                    canManageGame ||
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
import { useRoute, useRouter } from "vue-router";
import { api, getMediaUrl, formatDate, getErrorMessage } from "../api";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const isSubmitting = ref(false);

const game = ref<any>(null);
const posts = ref<any[]>([]);
const polls = ref<any[]>([]);
const userVotes = ref<{ poll_id: number; option_id: number }[]>([]);
const selectedOptions = ref<Record<number, number>>({});
const isSubscribed = ref(false);

// Может ли текущий пользователь управлять этой игрой (менять/удалять игру, её новости и опросы).
// Суперюзер может управлять ЛЮБОЙ игрой, а разработчик — только своей!
const canManageGame = computed(() => {
  if (!authStore.user || !game.value) return false;
  if (authStore.user.role === "SUPERUSER") return true;

  return (
    authStore.user.role === "DEVELOPER" &&
    Number(game.value.developer?.user_id) === Number(authStore.user.user_id)
  );
});

const canVote = computed(() => authStore.user?.role === "USER");

// Состояние для редактирования игры
const isEditingGame = ref(false);
const editGameForm = ref({ title: "", description: "" });
const editGameCover = ref<File | null>(null);

// Состояние для редактирования новости
const editingNewsId = ref<number | null>(null);
const editNewsForm = ref({ title: "", content: "" });

// Состояние для редактирования опроса
const editingPollId = ref<number | null>(null);
const editPollQuestion = ref("");

// Количество активных опросов на странице игры
const activePollsCount = computed(() => {
  return polls.value.filter((p) => p.status === "ACTIVE").length;
});

// Проверяет, голосовал ли пользователь в конкретном опросе
const hasVoted = (pollId: number) => {
  return userVotes.value.some((v) => v.poll_id === pollId);
};

// Возвращает ID выбранного пользователем варианта ответа в опросе
const getUserVote = (pollId: number) => {
  return userVotes.value.find((v) => v.poll_id === pollId)?.option_id;
};

// Считает общее количество голосов в опросе
const getTotalVotes = (poll: any) => {
  return poll.options.reduce(
    (sum: number, opt: any) => sum + Number(opt.votes_count || 0),
    0,
  );
};

// Считает процент голосов для одного варианта ответа
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

// ==========================================
// УПРАВЛЕНИЕ ИГРОЙ (ДЛЯ РАЗРАБОТЧИКА И СУПЕРЮЗЕРА)
// ==========================================
// Открыть форму редактирования игры и заполнить её текущими данными
const startEditGame = () => {
  if (!game.value) return;
  editGameForm.value = {
    title: game.value.title,
    description: game.value.description,
  };
  editGameCover.value = null;
  isEditingGame.value = true;
};

// Сохранить выбранный файл обложки игры
const handleGameCoverSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  editGameCover.value = target.files?.[0] || null;
};

// Отправить обновлённые данные и обложку игры на сервер
const saveGameEdit = async () => {
  if (!game.value) return;
  try {
    await api.patch(`/games/${game.value.game_id}`, editGameForm.value);

    if (editGameCover.value) {
      const formData = new FormData();
      formData.append("cover", editGameCover.value);
      await api.post(`/games/${game.value.game_id}/cover`, formData);
    }

    isEditingGame.value = false;
    await loadGameData(String(game.value.game_id));
  } catch (error: any) {
    alert(getErrorMessage(error, "Не удалось обновить игру."));
  }
};

// Удалить игру после подтверждения
const deleteGame = async () => {
  if (!game.value) return;
  if (!confirm("Вы уверены, что хотите удалить эту игру?")) return;

  try {
    await api.delete(`/games/${game.value.game_id}`);
    router.push("/catalog");
  } catch (error: any) {
    alert(getErrorMessage(error, "Не удалось удалить игру."));
  }
};

// ==========================================
// УПРАВЛЕНИЕ НОВОСТЯМИ ИГРЫ
// ==========================================
// Открыть форму редактирования выбранной новости
const startEditNews = (post: any) => {
  editingNewsId.value = post.news_id;
  editNewsForm.value = {
    title: post.title,
    content: post.content,
  };
};

// Сохранить изменения новости на сервере
const saveNewsEdit = async (newsId: number) => {
  try {
    await api.patch(`/news/${newsId}`, editNewsForm.value);
    editingNewsId.value = null;
    await loadGameData(String(route.params.id));
  } catch (error: any) {
    alert(getErrorMessage(error, "Не удалось изменить новость."));
  }
};

// Удалить новость после подтверждения
const deleteNews = async (newsId: number) => {
  if (!confirm("Удалить эту новость?")) return;

  try {
    await api.delete(`/news/${newsId}`);
    await loadGameData(String(route.params.id));
  } catch (error: any) {
    alert(getErrorMessage(error, "Не удалось удалить новость."));
  }
};

// ==========================================
// УПРАВЛЕНИЕ ОПРОСАМИ ИГРЫ
// ==========================================
// Открыть форму редактирования вопроса опроса
const startEditPoll = (poll: any) => {
  editingPollId.value = poll.poll_id;
  editPollQuestion.value = poll.question;
};

// Сохранить новый текст вопроса опроса на сервере
const savePollEdit = async (pollId: number) => {
  try {
    await api.patch(`/polls/${pollId}`, { question: editPollQuestion.value });
    editingPollId.value = null;
    await loadGameData(String(route.params.id));
  } catch (error: any) {
    alert(getErrorMessage(error, "Не удалось изменить опрос."));
  }
};

// Удалить опрос после подтверждения
const deletePoll = async (pollId: number) => {
  if (!confirm("Удалить этот опрос?")) return;

  try {
    await api.delete(`/polls/${pollId}`);
    await loadGameData(String(route.params.id));
  } catch (error: any) {
    alert(getErrorMessage(error, "Не удалось удалить опрос."));
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
    alert(getErrorMessage(error, "Ошибка при голосовании."));
  }
};

// Завершение опроса разработчиком или суперюзером
const closePoll = async (pollId: number) => {
  if (!confirm("Вы уверены, что хотите завершить этот опрос?")) return;

  try {
    await api.post(`/polls/${pollId}/close`);
    await loadGameData(String(route.params.id));
  } catch (error: any) {
    alert(getErrorMessage(error, "Не удалось завершить опрос."));
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
    alert(getErrorMessage(error, "Не удалось изменить подписку."));
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
