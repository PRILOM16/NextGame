<template>
  <div class="w-full max-w-3xl mx-auto animate-fade-in pb-12">
    <!-- Шапка -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-white">Создать публикацию</h1>
        <p class="text-xs text-gray-400 mt-1">
          Добавьте новость с фотографией или создайте опрос для игроков
        </p>
      </div>

      <router-link
        to="/developer/games"
        class="text-gray-400 hover:text-white text-sm font-medium transition-colors"
      >
        ← Назад к играм
      </router-link>
    </div>

    <!-- Сообщения об ошибке или успехе -->
    <div
      v-if="errorMessage"
      class="mb-4 bg-red-900/20 border border-red-800/50 text-red-400 rounded-lg px-4 py-3 text-xs"
    >
      ⚠️ {{ errorMessage }}
    </div>

    <div
      v-if="successMessage"
      class="mb-4 bg-green-900/20 border border-green-800/50 text-green-400 rounded-lg px-4 py-3 text-xs"
    >
      ✅ {{ successMessage }}
    </div>

    <!-- Основная форма -->
    <main
      class="bg-[#181A24] border border-gray-800/50 rounded-xl p-6 shadow-lg"
    >
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- 1. Выбор типа публикации: Новость или Опрос -->
        <div>
          <label
            class="block text-[11px] text-gray-400 uppercase font-bold mb-2"
          >
            Тип публикации
          </label>

          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="publicationType = 'news'"
              :class="
                publicationType === 'news'
                  ? 'border-[#8294FF] bg-[#222533] text-white'
                  : 'border-gray-700 bg-[#111111] text-gray-400'
              "
              class="border rounded-lg p-3 text-left transition-colors"
            >
              <p class="text-sm font-bold">📰 Новость</p>
              <p class="text-[11px] text-gray-400 mt-0.5">
                Анонс или дневник разработки
              </p>
            </button>

            <button
              type="button"
              @click="publicationType = 'poll'"
              :class="
                publicationType === 'poll'
                  ? 'border-[#8294FF] bg-[#222533] text-white'
                  : 'border-gray-700 bg-[#111111] text-gray-400'
              "
              class="border rounded-lg p-3 text-left transition-colors"
            >
              <p class="text-sm font-bold">📊 Опрос</p>
              <p class="text-[11px] text-gray-400 mt-0.5">
                Голосование для игроков
              </p>
            </button>
          </div>
        </div>

        <!-- 2. Выбор игры -->
        <div>
          <label
            class="block text-[11px] text-gray-400 uppercase font-bold mb-2"
          >
            Игра *
          </label>

          <select
            v-model="selectedGameId"
            required
            class="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF]"
          >
            <option value="" disabled>Выберите игру</option>
            <option
              v-for="game in developerGames"
              :key="game.game_id"
              :value="String(game.game_id)"
            >
              {{ game.title }}
            </option>
          </select>

          <p
            v-if="developerGames.length === 0"
            class="text-xs text-yellow-500 mt-2"
          >
            У вас пока нет добавленных игр. Сначала создайте игру!
          </p>
        </div>

        <!-- 3А. Поля для НОВОСТИ -->
        <template v-if="publicationType === 'news'">
          <div>
            <label
              class="block text-[11px] text-gray-400 uppercase font-bold mb-2"
            >
              Заголовок новости *
            </label>
            <input
              v-model="newsTitle"
              type="text"
              required
              placeholder="Например: Вышло крупное обновление 1.2"
              class="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF]"
            />
          </div>

          <div>
            <label
              class="block text-[11px] text-gray-400 uppercase font-bold mb-2"
            >
              Текст новости *
            </label>
            <textarea
              v-model="newsContent"
              rows="5"
              required
              placeholder="Расскажите игрокам о новостях..."
              class="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF] resize-none"
            ></textarea>
          </div>

          <div>
            <label
              class="block text-[11px] text-gray-400 uppercase font-bold mb-2"
            >
              Статус публикации
            </label>
            <select
              v-model="newsStatus"
              class="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF]"
            >
              <option value="PUBLISHED">Опубликовать сразу</option>
              <option value="DRAFT">Сохранить как черновик</option>
            </select>
          </div>
        </template>

        <!-- 3Б. Поля для ОПРОСА -->
        <template v-else>
          <div>
            <label
              class="block text-[11px] text-gray-400 uppercase font-bold mb-2"
            >
              Вопрос опроса *
            </label>
            <input
              v-model="pollQuestion"
              type="text"
              required
              placeholder="Какую механику добавить в следующем обновлении?"
              class="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF]"
            />
          </div>

          <!-- Список вариантов ответа -->
          <div>
            <label
              class="block text-[11px] text-gray-400 uppercase font-bold mb-2"
            >
              Варианты ответов (от 2 до 10) *
            </label>

            <div class="space-y-2">
              <div
                v-for="(_, index) in pollOptions"
                :key="index"
                class="flex gap-2"
              >
                <input
                  v-model="pollOptions[index]"
                  type="text"
                  required
                  :placeholder="`Вариант ${index + 1}`"
                  class="flex-1 px-3 py-2 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF]"
                />

                <button
                  type="button"
                  @click="removeOption(index)"
                  :disabled="pollOptions.length <= 2"
                  class="w-9 bg-[#111111] border border-gray-700 rounded-lg text-gray-400 hover:text-red-400 disabled:opacity-30"
                >
                  ×
                </button>
              </div>

              <button
                type="button"
                @click="addOption"
                :disabled="pollOptions.length >= 10"
                class="w-full py-2 bg-[#111111] border border-gray-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors disabled:opacity-30"
              >
                + Добавить вариант ответа
              </button>
            </div>
          </div>
        </template>

        <!-- 4. ПРИКРЕПЛЕНИЕ ФОТОГРАФИИ (ДОСТУПНО И ДЛЯ НОВОСТИ, И ДЛЯ ОПРОСА) -->
        <div>
          <label
            class="block text-[11px] text-gray-400 uppercase font-bold mb-2"
          >
            {{
              publicationType === "news"
                ? "Фотография к новости (необязательно)"
                : "Изображение к опросу (необязательно)"
            }}
          </label>

          <div
            class="border border-dashed border-gray-700 rounded-lg bg-[#111111] p-4 hover:border-[#8294FF] transition-colors"
          >
            <!-- Предпросмотр выбранного фото -->
            <div v-if="imagePreview" class="mb-3">
              <img
                :src="imagePreview"
                alt="Предпросмотр"
                class="max-h-56 w-full object-contain rounded-lg"
              />
            </div>

            <div class="flex flex-col items-center justify-center py-2">
              <p class="text-sm text-gray-300 font-bold">
                {{
                  selectedFile ? selectedFile.name : "Прикрепить изображение"
                }}
              </p>

              <p class="text-[11px] text-gray-500 mt-1">
                Форматы: PNG, JPG, WEBP
              </p>

              <label
                class="mt-3 px-4 py-2 bg-[#181A24] border border-gray-700 hover:border-[#8294FF] rounded-md text-xs text-gray-200 cursor-pointer transition-colors"
              >
                Выбрать файл
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileChange"
                />
              </label>

              <button
                v-if="selectedFile"
                type="button"
                @click="removeFile"
                class="text-xs text-red-400 hover:text-red-300 mt-3"
              >
                Удалить выбранное фото
              </button>
            </div>
          </div>
        </div>

        <!-- Кнопки отправки -->
        <div class="pt-4 border-t border-gray-800 flex items-center gap-3">
          <button
            type="submit"
            :disabled="isSubmitting || developerGames.length === 0"
            class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
          >
            {{ isSubmitting ? "Отправка..." : "Опубликовать" }}
          </button>

          <router-link
            to="/developer/games"
            class="text-gray-400 hover:text-white px-4 py-2.5 text-xs font-medium transition-colors"
          >
            Отмена
          </router-link>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api, getErrorMessage } from "../api";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const authStore = useAuthStore();

// Состояние формы
const publicationType = ref<"news" | "poll">("news");
const selectedGameId = ref("");

// Поля для новости
const newsTitle = ref("");
const newsContent = ref("");
const newsStatus = ref<"PUBLISHED" | "DRAFT">("PUBLISHED");

// Поля для опроса
const pollQuestion = ref("");
const pollOptions = ref<string[]>(["Да", "Нет"]);

// Прикреплённое фото (для новости или опроса)
const selectedFile = ref<File | null>(null);
const imagePreview = ref("");

// Служебные переменные
const developerGames = ref<any[]>([]);
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Загружаем игры текущего разработчика
const fetchDeveloperGames = async () => {
  try {
    if (authStore.token && !authStore.user) {
      await authStore.fetchProfile();
    }

    const myId = authStore.user?.user_id;
    const response = await api.get("/games");

    // Суперюзер может публиковать новости и опросы к любой игре на сайте
    developerGames.value = authStore.isSuperuser
      ? response.data
      : response.data.filter(
          (game: any) => Number(game.developer?.user_id) === Number(myId),
        );

    const queryGameId = String(route.query.gameId || "");
    const hasQueryGame = developerGames.value.some(
      (game: any) => String(game.game_id) === queryGameId,
    );

    if (hasQueryGame) {
      selectedGameId.value = queryGameId;
    } else if (developerGames.value.length > 0) {
      selectedGameId.value = String(developerGames.value[0].game_id);
    }
  } catch (error) {
    console.error("Ошибка загрузки игр:", error);
    errorMessage.value = "Не удалось загрузить список ваших игр.";
  }
};

// Добавление и удаление вариантов ответа в опросе
const addOption = () => {
  if (pollOptions.value.length < 10) {
    pollOptions.value.push("");
  }
};

const removeOption = (index: number) => {
  if (pollOptions.value.length > 2) {
    pollOptions.value.splice(index, 1);
  }
};

// Выбор фотографии и создание превью
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }

  selectedFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

// Сброс выбранной фотографии
const removeFile = () => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
  selectedFile.value = null;
  imagePreview.value = "";
};

// Отправка новости или опроса на сервер
const handleSubmit = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!selectedGameId.value) {
    errorMessage.value = "Пожалуйста, выберите игру.";
    return;
  }

  isSubmitting.value = true;

  try {
    if (publicationType.value === "news") {
      // Формируем данные новости (вместе с фото, если оно выбрано)
      const formData = new FormData();
      formData.append("title", newsTitle.value.trim());
      formData.append("content", newsContent.value.trim());
      formData.append("status", newsStatus.value);

      if (selectedFile.value) {
        formData.append("image", selectedFile.value);
      }

      await api.post(`/games/${selectedGameId.value}/news`, formData);

      successMessage.value =
        newsStatus.value === "PUBLISHED"
          ? "Новость успешно опубликована!"
          : "Новость сохранена в черновики!";

      newsTitle.value = "";
      newsContent.value = "";
      removeFile();
    } else {
      // Проверяем варианты ответа для опроса
      const cleanOptions = pollOptions.value
        .map((opt) => opt.trim())
        .filter(Boolean);

      if (cleanOptions.length < 2) {
        errorMessage.value = "Укажите минимум 2 варианта ответа.";
        isSubmitting.value = false;
        return;
      }

      // Создаём опрос
      const pollRes = await api.post(`/games/${selectedGameId.value}/polls`, {
        question: pollQuestion.value.trim(),
        options: cleanOptions,
      });

      // Если выбрана картинка — загружаем её
      const pollId = pollRes.data?.poll_id;
      if (pollId && selectedFile.value) {
        const formData = new FormData();
        formData.append("image", selectedFile.value);
        await api.post(`/polls/${pollId}/image`, formData);
      }

      successMessage.value = "Опрос успешно создан!";
      pollQuestion.value = "";
      pollOptions.value = ["Да", "Нет"];
      removeFile();
    }
  } catch (error: any) {
    console.error("Ошибка при публикации:", error);
    errorMessage.value = getErrorMessage(
      error,
      "Не удалось создать публикацию.",
    );
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchDeveloperGames);
</script>
