<template>
  <div class="w-full max-w-3xl mx-auto animate-fade-in pb-12">
    <!-- Шапка страницы -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white mb-1">Добавление игры</h1>
        <p class="text-xs text-gray-400">
          Опубликуйте свой проект, чтобы игроки могли на него подписаться
        </p>
      </div>

      <router-link
        to="/developer/games"
        class="text-gray-400 hover:text-white text-sm font-medium transition-colors"
      >
        ← Назад к моим играм
      </router-link>
    </div>

    <!-- Форма создания игры -->
    <main
      class="bg-[#181A24] rounded-2xl p-6 md:p-8 border border-gray-800/50 shadow-xl"
    >
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Поле: Название игры (с проверкой на дубликат) -->
        <div>
          <label
            class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Название игры *
          </label>

          <input
            v-model="title"
            type="text"
            required
            placeholder="Например: Neon Divide"
            :class="
              isDuplicateTitle
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-700 focus:border-[#8294FF]'
            "
            class="w-full px-4 py-2.5 bg-[#111111] border rounded-lg text-white text-sm focus:outline-none transition-colors"
          />

          <!-- Предупреждение, если игра с таким названием уже есть -->
          <p v-if="isDuplicateTitle" class="text-xs text-red-400 mt-2">
            ⚠️ Игра с таким названием уже существует в каталоге! Придумайте
            уникальное название.
          </p>
        </div>

        <!-- Поле: Краткое описание -->
        <div>
          <label
            class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Краткое описание *
          </label>

          <textarea
            v-model="description"
            required
            rows="4"
            placeholder="Расскажите о ключевых особенностях вашей игры..."
            class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF] transition-colors resize-none"
          ></textarea>
        </div>

        <!-- Поле: Обложка игры -->
        <div>
          <label
            class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Обложка игры (необязательно)
          </label>

          <label
            :class="
              selectedFile
                ? 'border-[#8294FF] bg-[#1a1c28]'
                : 'border-gray-700 bg-[#111111] hover:border-[#8294FF]'
            "
            class="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors"
          >
            <div v-if="!selectedFile" class="text-center px-4">
              <span class="text-2xl block mb-2">🖼️</span>
              <p class="text-sm text-gray-300 font-bold mb-1">
                Нажмите, чтобы выбрать изображение
              </p>
              <p class="text-[11px] text-gray-500">Форматы: PNG, JPG, WEBP</p>
            </div>

            <div v-else class="text-center px-4">
              <span class="text-3xl block mb-2">✅</span>
              <p class="text-sm text-[#8294FF] font-bold truncate max-w-xs">
                {{ selectedFile.name }}
              </p>
              <p class="text-[11px] text-gray-400 mt-1">
                Нажмите, чтобы выбрать другой файл
              </p>
            </div>

            <input
              type="file"
              class="hidden"
              accept="image/*"
              @change="handleFileChange"
            />
          </label>
        </div>

        <!-- Уведомление об ошибке или успехе -->
        <div
          v-if="message.text"
          :class="
            message.type === 'error'
              ? 'bg-red-900/30 border-red-800 text-red-400'
              : 'bg-green-900/30 border-green-800 text-green-400'
          "
          class="border text-xs p-3 rounded-lg flex items-center gap-2"
        >
          <span>{{ message.type === "error" ? "⚠️" : "✅" }}</span>
          <p>{{ message.text }}</p>
        </div>

        <!-- Кнопки отправки -->
        <div
          class="pt-6 border-t border-gray-800 flex items-center justify-end gap-4"
        >
          <router-link
            to="/developer/games"
            class="text-gray-400 hover:text-white text-sm font-medium transition-colors px-4 py-2"
          >
            Отмена
          </router-link>

          <button
            type="submit"
            :disabled="isLoading || isDuplicateTitle"
            class="bg-[#8294FF] hover:bg-[#6c80ff] disabled:bg-[#4a5596] disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors"
          >
            {{ isLoading ? "Создание..." : "Создать игру" }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api, getErrorMessage } from "../api";

const router = useRouter();

// Поля формы
const title = ref("");
const description = ref("");
const selectedFile = ref<File | null>(null);

// Состояние загрузки и список уже существующих названий игр
const isLoading = ref(false);
const existingTitles = ref<string[]>([]);
const message = ref({ text: "", type: "success" });

// Загружаем существующие игры, чтобы сразу подсказывать пользователю, если название занято
onMounted(async () => {
  try {
    const response = await api.get("/games");
    existingTitles.value = response.data.map((game: any) =>
      String(game.title || "").trim().toLowerCase(),
    );
  } catch (error) {
    console.error("Не удалось загрузить список игр для проверки:", error);
  }
});

// Проверяем, совпадает ли введённое название с одной из существующих игр
const isDuplicateTitle = computed(() => {
  const cleanTitle = title.value.trim().toLowerCase();
  if (!cleanTitle) return false;
  return existingTitles.value.includes(cleanTitle);
});

// Выбор файла обложки
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectedFile.value = target.files?.[0] || null;
};

// Отправка формы на сервер
const handleSubmit = async () => {
  // Дополнительная проверка перед отправкой
  if (isDuplicateTitle.value) {
    message.value = {
      text: "Игра с таким названием уже существует!",
      type: "error",
    };
    return;
  }

  isLoading.value = true;
  message.value = { text: "", type: "success" };

  try {
    const formData = new FormData();
    formData.append("title", title.value.trim());
    formData.append("description", description.value.trim());

    if (selectedFile.value) {
      formData.append("cover", selectedFile.value);
    }

    await api.post("/games", formData);

    message.value = {
      text: "Игра успешно добавлена! Переходим к списку ваших игр...",
      type: "success",
    };

    setTimeout(() => {
      router.push("/developer/games");
    }, 1200);
  } catch (error: any) {
    console.error("Ошибка добавления игры:", error);

    message.value = {
      text: getErrorMessage(error, "Произошла ошибка при создании игры"),
      type: "error",
    };
  } finally {
    isLoading.value = false;
  }
};
</script>
