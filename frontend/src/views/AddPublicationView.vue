<template>
  <div class="w-full animate-fade-in pb-12">
    <!-- ШАПКА -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-white">Создать публикацию</h1>
        <p class="text-xs text-gray-400 mt-1">
          Добавь новость или создай опрос для игроков.
        </p>
      </div>

      <router-link
        to="/developer/games"
        class="bg-[#181A24] border border-gray-800 hover:border-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
      >
        ← Назад
      </router-link>
    </div>

    <!-- СООБЩЕНИЯ -->
    <div
      v-if="errorMessage"
      class="mb-4 bg-red-900/20 border border-red-800/50 text-red-400 rounded-lg px-4 py-3 text-xs"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="successMessage"
      class="mb-4 bg-green-900/20 border border-green-800/50 text-green-400 rounded-lg px-4 py-3 text-xs"
    >
      {{ successMessage }}
    </div>

    <!-- ОСНОВНАЯ ОБЛАСТЬ -->
    <div class="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
      <main
        class="bg-[#181A24] border border-gray-800/50 rounded-xl p-6 shadow-lg"
      >
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- ТИП ПУБЛИКАЦИИ -->
          <div>
            <label
              class="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-3"
            >
              Тип публикации
            </label>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                @click="setPublicationType('news')"
                :class="
                  publicationType === 'news'
                    ? 'bg-[#181A24] border-[#8294FF]'
                    : 'bg-[#111111] border-gray-700'
                "
                class="text-left border rounded-lg p-4 hover:border-[#8294FF] transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-5 h-5 rounded-full border border-[#8294FF] flex items-center justify-center"
                  >
                    <div
                      v-if="publicationType === 'news'"
                      class="w-2 h-2 rounded-full bg-[#8294FF]"
                    ></div>
                  </div>

                  <div>
                    <p class="text-sm font-bold text-white">Новость</p>
                    <p class="text-[10px] text-gray-500 mt-1">
                      Анонс или обновление игры
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                @click="setPublicationType('poll')"
                :class="
                  publicationType === 'poll'
                    ? 'bg-[#181A24] border-[#8294FF]'
                    : 'bg-[#111111] border-gray-700'
                "
                class="text-left border rounded-lg p-4 hover:border-[#8294FF] transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-5 h-5 rounded-full border border-[#8294FF] flex items-center justify-center"
                  >
                    <div
                      v-if="publicationType === 'poll'"
                      class="w-2 h-2 rounded-full bg-[#8294FF]"
                    ></div>
                  </div>

                  <div>
                    <p class="text-sm font-bold text-white">Опрос</p>
                    <p class="text-[10px] text-gray-500 mt-1">
                      Вопрос со списком ответов
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- ВЫБОР ИГРЫ -->
          <div>
            <label
              class="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2"
            >
              Игра *
            </label>

            <select
              v-model="form.gameId"
              :disabled="isLoadingGames || developerGames.length === 0"
              class="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF] disabled:opacity-50"
            >
              <option value="">
                {{ isLoadingGames ? "Загрузка игр..." : "Выберите игру" }}
              </option>

              <option
                v-for="game in developerGames"
                :key="game.game_id"
                :value="String(game.game_id)"
              >
                {{ game.title }}
              </option>
            </select>

            <p
              v-if="!isLoadingGames && developerGames.length === 0"
              class="text-xs text-yellow-500 mt-2"
            >
              У вас пока нет доступных игр.
            </p>
          </div>

          <!-- ПОЛЯ НОВОСТИ -->
          <template v-if="publicationType === 'news'">
            <div>
              <label
                class="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2"
              >
                Заголовок *
              </label>

              <input
                v-model="form.title"
                type="text"
                maxlength="150"
                placeholder="Заголовок публикации"
                class="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#8294FF]"
              />

              <p class="text-[10px] text-gray-600 mt-1 text-right">
                {{ form.title.length }}/150
              </p>
            </div>

            <div>
              <label
                class="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2"
              >
                Текст новости *
              </label>

              <textarea
                v-model="form.content"
                rows="6"
                placeholder="Расскажите игрокам о новостях..."
                class="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#8294FF] resize-none"
              ></textarea>
            </div>
          </template>

          <!-- ПОЛЯ ОПРОСА -->
          <template v-else>
            <div>
              <label
                class="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2"
              >
                Вопрос *
              </label>

              <input
                v-model="form.question"
                type="text"
                maxlength="250"
                placeholder="Как вы относитесь к новому обновлению?"
                class="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#8294FF]"
              />
            </div>

            <!-- ВАРИАНТЫ ОТВЕТОВ -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label
                  class="block text-[10px] text-gray-500 uppercase tracking-wider font-bold"
                >
                  Варианты ответов *
                </label>

                <span class="text-[10px] text-gray-600">
                  {{ form.options.length }}/10
                </span>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(option, index) in form.options"
                  :key="index"
                  class="flex gap-2"
                >
                  <input
                    v-model="form.options[index]"
                    type="text"
                    maxlength="100"
                    :placeholder="`Вариант ${index + 1}`"
                    class="flex-1 px-3 py-2 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#8294FF]"
                  />

                  <button
                    type="button"
                    @click="removeOption(index)"
                    :disabled="form.options.length <= 2"
                    class="w-9 bg-[#111111] border border-gray-700 rounded-lg text-gray-500 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </div>

                <button
                  type="button"
                  @click="addOption"
                  :disabled="form.options.length >= 10"
                  class="w-full py-2 bg-[#111111] border border-gray-700 rounded-lg text-xs text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30"
                >
                  + Добавить вариант
                </button>
              </div>
            </div>
          </template>

          <!-- ИЗОБРАЖЕНИЕ: текущий backend поддерживает загрузку только для опросов -->
          <div v-if="publicationType === 'poll'">
            <label
              class="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2"
            >
              Изображение
            </label>

            <div
              class="border border-dashed border-gray-700 rounded-lg bg-[#111111] p-4 hover:border-[#8294FF] transition-colors"
            >
              <div v-if="imagePreview" class="mb-3">
                <img
                  :src="imagePreview"
                  alt="Предпросмотр изображения"
                  class="max-h-56 w-full object-contain rounded-lg"
                />
              </div>

              <div class="flex flex-col items-center justify-center py-3">
                <p class="text-sm text-gray-300 font-bold">
                  {{
                    selectedFile ? selectedFile.name : "Добавить изображение"
                  }}
                </p>

                <p class="text-[10px] text-gray-500 mt-1">
                  PNG, JPG или WEBP. Максимум 5 МБ.
                </p>

                <label
                  class="mt-3 px-4 py-2 bg-[#181A24] border border-gray-700 rounded-md text-xs text-gray-300 hover:text-white cursor-pointer transition-colors"
                >
                  Выбрать файл

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    class="hidden"
                    @change="handleFileChange"
                  />
                </label>

                <button
                  v-if="selectedFile"
                  type="button"
                  @click="removeFile"
                  class="text-[10px] text-red-400 hover:text-red-300 mt-3"
                >
                  Удалить изображение
                </button>
              </div>
            </div>
          </div>

          <!-- СТАТУС НОВОСТИ -->
          <div v-if="publicationType === 'news'">
            <label
              class="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2"
            >
              Статус
            </label>

            <select
              v-model="form.status"
              class="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF]"
            >
              <option value="DRAFT">Черновик</option>
              <option value="PUBLISHED">Опубликовано</option>
            </select>
          </div>

          <!-- КНОПКИ -->
          <div class="pt-5 border-t border-gray-800 flex items-center gap-3">
            <button
              type="submit"
              :disabled="
                isSubmitting || isLoadingGames || developerGames.length === 0
              "
              class="bg-[#5865E8] hover:bg-[#6672f0] text-white px-5 py-2.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
            >
              {{ isSubmitting ? "Отправка..." : "Создать публикацию" }}
            </button>

            <router-link
              to="/developer/games"
              class="bg-[#111111] border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white px-5 py-2.5 rounded-md text-xs font-medium transition-colors"
            >
              Отмена
            </router-link>
          </div>
        </form>
      </main>

      <!-- ПРАВАЯ ПАНЕЛЬ -->
      <aside
        class="bg-[#181A24] border border-gray-800/50 rounded-xl p-5 shadow-lg h-fit"
      >
        <h3 class="text-xs font-bold text-white mb-5">Перед публикацией</h3>

        <div class="space-y-5">
          <div class="flex gap-3">
            <div
              class="w-5 h-5 rounded bg-[#292e65] text-[#8294FF] flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            >
              1
            </div>

            <div>
              <p class="text-[11px] font-bold text-gray-300">
                Проверь содержание
              </p>
              <p class="text-[9px] text-gray-600 mt-1">
                Убедись, что текст понятен игрокам.
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <div
              class="w-5 h-5 rounded bg-[#292e65] text-[#8294FF] flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            >
              2
            </div>

            <div>
              <p class="text-[11px] font-bold text-gray-300">Выбери игру</p>
              <p class="text-[9px] text-gray-600 mt-1">
                Публикация появится на странице выбранной игры.
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <div
              class="w-5 h-5 rounded bg-[#292e65] text-[#8294FF] flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            >
              3
            </div>

            <div>
              <p class="text-[11px] font-bold text-gray-300">
                Проверь изображение
              </p>
              <p class="text-[9px] text-gray-600 mt-1">
                Используй подходящую картинку.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount } from "vue";
import { api } from "../api";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

type PublicationType = "news" | "poll";

const publicationType = ref<PublicationType>("poll");
const isSubmitting = ref(false);

const form = reactive({
  gameId: "",
  title: "",
  content: "",
  question: "",
  options: ["Да", "Нет"],
  status: "DRAFT" as "DRAFT" | "PUBLISHED",
});

const developerGames = ref<any[]>([]);
const isLoadingGames = ref(false);

const selectedFile = ref<File | null>(null);
const imagePreview = ref("");

const errorMessage = ref("");
const successMessage = ref("");

const setPublicationType = (type: PublicationType) => {
  publicationType.value = type;
  errorMessage.value = "";
  successMessage.value = "";

  // Картинка в текущем API поддерживается только для опросов.
  if (type === "news") removeFile();
};

const fetchDeveloperGames = async () => {
  isLoadingGames.value = true;
  errorMessage.value = "";

  try {
    if (authStore.token && !authStore.user) {
      await authStore.fetchProfile();
    }

    const myId = authStore.user?.user_id ?? authStore.user?.id;
    if (!myId)
      throw new Error(
        "Не удалось определить пользователя. Войдите в аккаунт заново.",
      );

    const response = await api.get("/games");
    const games = Array.isArray(response.data)
      ? response.data
      : (response.data?.data ?? []);

    developerGames.value = games.filter((game: any) => {
      const developerId =
        game.developer?.user_id ?? game.developer?.id ?? game.developer_id;
      return Number(developerId) === Number(myId);
    });

    if (developerGames.value.length > 0) {
      const firstGameId =
        developerGames.value[0].game_id ?? developerGames.value[0].id;
      form.gameId = String(firstGameId);
    }
  } catch (error: any) {
    console.error("Ошибка загрузки игр разработчика:", error);
    errorMessage.value = getApiError(error, "Не удалось загрузить ваши игры.");
  } finally {
    isLoadingGames.value = false;
  }
};

const addOption = () => {
  if (form.options.length < 10) form.options.push("");
};

const removeOption = (index: number) => {
  if (form.options.length > 2) form.options.splice(index, 1);
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  errorMessage.value = "";
  successMessage.value = "";

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = "Допустимые форматы: PNG, JPG и WEBP.";
    target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = "Размер изображения не должен превышать 5 МБ.";
    target.value = "";
    return;
  }

  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
  selectedFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

const removeFile = () => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
  imagePreview.value = "";
  selectedFile.value = null;
};

const validateForm = (): boolean => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!form.gameId) {
    errorMessage.value = "Выберите игру.";
    return false;
  }

  if (publicationType.value === "news") {
    if (!form.title.trim()) {
      errorMessage.value = "Введите заголовок новости.";
      return false;
    }
    if (form.title.trim().length > 255) {
      errorMessage.value =
        "Заголовок новости не должен превышать 255 символов.";
      return false;
    }
    if (!form.content.trim()) {
      errorMessage.value = "Введите текст новости.";
      return false;
    }
  } else {
    if (!form.question.trim()) {
      errorMessage.value = "Введите вопрос опроса.";
      return false;
    }

    const validOptions = form.options
      .map((option) => option.trim())
      .filter(Boolean);
    if (validOptions.length < 2) {
      errorMessage.value = "Укажите минимум два варианта ответа.";
      return false;
    }
    if (validOptions.length > 10) {
      errorMessage.value = "Можно добавить не более 10 вариантов ответа.";
      return false;
    }
    if (
      new Set(validOptions.map((option) => option.toLocaleLowerCase())).size !==
      validOptions.length
    ) {
      errorMessage.value = "Варианты ответов не должны повторяться.";
      return false;
    }
  }

  return true;
};

const handleSubmit = async () => {
  if (isSubmitting.value || !validateForm()) return;

  isSubmitting.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    if (publicationType.value === "news") {
      // POST /games/:gameId/news принимает только title и content.
      const response = await api.post(`/games/${form.gameId}/news`, {
        title: form.title.trim(),
        content: form.content.trim(),
      });

      const newsId = response.data?.news_id ?? response.data?.id;
      if (!newsId) {
        throw new Error(
          "Сервер создал новость, но не вернул её ID. Проверьте список новостей перед повторной отправкой.",
        );
      }

      // Создание новости на backend устанавливает DRAFT по умолчанию.
      // Для статуса PUBLISHED используем уже существующий PATCH /news/:id.
      if (form.status === "PUBLISHED") {
        try {
          await api.patch(`/news/${newsId}`, { status: "PUBLISHED" });
          successMessage.value = "Новость успешно создана и опубликована!";
        } catch (publishError: any) {
          // Новость уже создана как DRAFT. Не показываем ошибку создания,
          // чтобы пользователь случайно не отправил её повторно.
          console.error(
            "Новость создана, но публикация не удалась:",
            publishError,
          );
          successMessage.value = `Новость сохранена как черновик, но опубликовать её не удалось: ${getApiError(publishError, "ошибка изменения статуса")}`;
        }
      } else {
        successMessage.value = "Новость успешно сохранена как черновик!";
      }
      resetFormAfterSuccess();
      return;
    }

    // POST /games/:gameId/polls ожидает question и массив options.
    const pollResponse = await api.post(`/games/${form.gameId}/polls`, {
      question: form.question.trim(),
      options: form.options.map((option) => option.trim()).filter(Boolean),
    });

    const pollId =
      pollResponse.data?.poll_id ?? pollResponse.data?.poll?.poll_id;
    if (!pollId) {
      throw new Error(
        "Сервер создал опрос, но не вернул его ID. Проверьте список опросов перед повторной отправкой.",
      );
    }

    if (selectedFile.value) {
      const imageData = new FormData();
      imageData.append("image", selectedFile.value);
      try {
        await api.post(`/polls/${pollId}/image`, imageData);
        successMessage.value = "Опрос успешно создан, изображение загружено!";
      } catch (imageError: any) {
        console.error(
          "Опрос создан, но изображение не загрузилось:",
          imageError,
        );
        successMessage.value = `Опрос создан, но изображение загрузить не удалось: ${getApiError(imageError, "ошибка загрузки файла")}`;
      }
    } else {
      successMessage.value = "Опрос успешно создан!";
    }

    resetFormAfterSuccess();
  } catch (error: any) {
    console.error("Ошибка создания публикации:", error);
    errorMessage.value = getApiError(error, "Не удалось создать публикацию.");
  } finally {
    isSubmitting.value = false;
  }
};

const resetFormAfterSuccess = () => {
  form.title = "";
  form.content = "";
  form.question = "";
  form.options = ["Да", "Нет"];
  form.status = "DRAFT";
  removeFile();
};

const getApiError = (error: any, fallback: string): string => {
  const message = error?.response?.data?.message ?? error?.message;
  if (Array.isArray(message)) return message.join(" ");
  return typeof message === "string" && message.trim() ? message : fallback;
};

onMounted(fetchDeveloperGames);
onBeforeUnmount(removeFile);
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
</style>
