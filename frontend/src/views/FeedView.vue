<template>
  <div class="w-full max-w-3xl mx-auto animate-fade-in pb-12">
    <!-- Заголовок -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-white">Лента новостей</h1>
      <p class="text-sm text-gray-400 mt-2">
        Новости и опросы игр, на которые вы подписаны
      </p>
    </div>

    <div class="w-full">
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
        <p class="text-gray-400 mb-4">
          Пока нет публикаций. Подпишитесь на игры, чтобы видеть их новости и
          опросы.
        </p>
        <router-link
          to="/catalog"
          class="inline-block bg-[#8294FF] hover:bg-[#6c80ff] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors"
        >
          Найти игры в каталоге
        </router-link>
      </div>

      <!-- Список публикаций -->
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
              <span class="text-xs">🎮</span>
            </div>

            <div class="flex-1 min-w-0">
              <router-link
                :to="`/game/${item.game.game_id}`"
                class="text-sm font-semibold text-white hover:text-[#8294FF]"
              >
                {{ item.game.title }}
              </router-link>
              <p class="text-xs text-gray-500">
                {{ formatDate(item.created_at, true) }}
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

          <!-- КАРТОЧКА НОВОСТИ -->
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

          <!-- КАРТОЧКА ОПРОСА -->
          <template v-else-if="item.type === 'POLL'">
            <div class="flex items-start justify-between gap-3 mb-3">
              <h2 class="text-xl font-bold text-white">
                {{ item.question }}
              </h2>

              <span
                class="shrink-0 text-[10px] px-2 py-1 rounded border"
                :class="
                  item.status === 'ACTIVE'
                    ? 'text-green-400 bg-green-900/20 border-green-800/50'
                    : 'text-gray-400 bg-gray-800/50 border-gray-700'
                "
              >
                {{ item.status === "ACTIVE" ? "Активен" : "Завершён" }}
              </span>
            </div>

            <img
              v-if="item.image_url"
              :src="getMediaUrl(item.image_url)"
              :alt="item.question"
              class="w-full max-h-96 object-cover rounded-lg mb-4"
            />

            <!-- Варианты ответов -->
            <div class="space-y-3">
              <div v-for="option in item.options" :key="option.option_id">
                <!-- Результаты голосования -->
                <div
                  v-if="item.user_vote !== null"
                  class="relative overflow-hidden bg-[#222533] border border-gray-700/50 rounded-lg p-3"
                >
                  <div
                    class="absolute inset-y-0 left-0 bg-[#8294FF]/15 transition-all duration-500"
                    :style="{ width: getVotePercentage(item, option) + '%' }"
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

                <!-- Кнопка выбора варианта -->
                <button
                  v-else
                  @click="selectedOptions[item.id] = option.option_id"
                  :disabled="item.status !== 'ACTIVE'"
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

            <!-- Кнопка отправки голоса -->
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
                  item.status !== 'ACTIVE' ||
                  votingPollId === item.id
                "
                class="px-5 py-2 rounded-lg text-xs font-bold transition-all bg-[#8294FF] hover:bg-[#6c80ff] text-white disabled:bg-gray-700 disabled:text-gray-400"
              >
                {{ votingPollId === item.id ? "Отправка..." : "Проголосовать" }}
              </button>
            </div>

            <div v-else class="mt-4 flex items-center justify-between">
              <span class="text-xs text-green-400">✓ Ваш голос учтён</span>
              <span class="text-xs text-gray-500">
                {{ item.total_votes }} голосов
              </span>
            </div>
          </template>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api, getMediaUrl, formatDate } from "../api";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const feed = ref<any[]>([]);
const loading = ref(true);
const error = ref("");

const votingPollId = ref<number | null>(null);
const selectedOptions = ref<Record<number, number>>({});

// Загрузка ленты с сервера
const loadFeed = async (showLoading = true) => {
  if (!authStore.token) {
    loading.value = false;
    error.value = "Войдите в аккаунт, чтобы просматривать персональную ленту.";
    return;
  }

  try {
    if (showLoading) loading.value = true;
    error.value = "";

    const response = await api.get("/feed");
    feed.value = response.data;
  } catch (err) {
    console.error("Ошибка загрузки ленты:", err);
    error.value = "Не удалось загрузить публикации.";
  } finally {
    if (showLoading) loading.value = false;
  }
};

// Расчёт процента голосов
const getVotePercentage = (poll: any, option: any) => {
  if (!poll.total_votes) return 0;
  return Math.round((option.votes_count / poll.total_votes) * 100);
};

// Отправка голоса
const vote = async (pollId: number) => {
  const optionId = selectedOptions.value[pollId];
  if (!optionId) return;

  votingPollId.value = pollId;

  try {
    await api.post(`/polls/${pollId}/vote`, { optionId });
    delete selectedOptions.value[pollId];
    await loadFeed(false);
  } catch (err: any) {
    alert(err.response?.data?.message || "Не удалось проголосовать.");
    await loadFeed(false);
  } finally {
    votingPollId.value = null;
  }
};

onMounted(() => {
  loadFeed();
});
</script>
