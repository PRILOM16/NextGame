<template>
  <div class="w-full max-w-3xl mx-auto animate-fade-in pb-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white mb-1">Добавление игры</h1>
        <p class="text-xs text-gray-400">
          Опубликуйте свой проект, чтобы игроки могли на него подписаться
        </p>
      </div>
      <router-link
        to="/"
        class="text-gray-500 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
      >
        <span>←</span> Назад в панель
      </router-link>
    </div>

    <main
      class="bg-[#181A24] rounded-2xl p-6 md:p-8 border border-gray-800/50 shadow-xl"
    >
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
              >Название игры *</label
            >
            <input
              v-model="formData.title"
              type="text"
              required
              placeholder="Например: Neon Divide"
              class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF] transition-colors"
            />
          </div>
          <div>
            <label
              class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
              >Жанр (опционально)</label
            >
            <select
              v-model="formData.genre"
              class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF] transition-colors appearance-none"
            >
              <option value="" disabled selected>Выберите жанр...</option>
              <option value="RPG">RPG (Ролевая игра)</option>
              <option value="Shooter">Шутер</option>
              <option value="Strategy">Стратегия</option>
              <option value="Action">Экшен</option>
              <option value="Indie">Инди</option>
            </select>
          </div>
        </div>

        <div>
          <label
            class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
            >Краткое описание *</label
          >
          <textarea
            v-model="formData.description"
            required
            rows="3"
            placeholder="Расскажите о ключевых особенностях вашей игры..."
            class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF] transition-colors resize-none"
          ></textarea>
        </div>

        <!-- Обложка игры -->
        <div>
          <label
            class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
            >Обложка игры</label
          >

          <!-- Зона клика: привязываем событие @click="triggerFileInput" -->
          <div
            @click="triggerFileInput"
            :class="
              selectedFile
                ? 'border-[#8294FF] bg-[#1a1c28]'
                : 'border-gray-700 bg-[#111111] hover:border-[#8294FF]'
            "
            class="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors group"
          >
            <div v-if="!selectedFile" class="flex flex-col items-center">
              <div
                class="w-12 h-12 bg-[#1C1F2B] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <span class="text-xl">🖼️</span>
              </div>
              <p class="text-sm text-gray-300 font-bold mb-1">
                Нажмите, чтобы выбрать изображение
              </p>
              <p class="text-[10px] text-gray-500">
                Рекомендуемый размер 1920x1080 (PNG, JPG)
              </p>
            </div>

            <!-- Если файл выбран — показываем его имя -->
            <div v-else class="flex flex-col items-center text-center px-4">
              <span class="text-3xl mb-2">✅</span>
              <p
                class="text-sm text-[#8294FF] font-bold truncate w-full max-w-xs"
              >
                {{ selectedFile.name }}
              </p>
              <p class="text-[10px] text-gray-400 mt-1">
                Нажмите, чтобы выбрать другой файл
              </p>
            </div>

            <!-- Скрытый инпут, к которому привязан ref="fileInputRef" -->
            <input
              type="file"
              ref="fileInputRef"
              @change="handleFileChange"
              class="hidden"
              accept="image/*"
            />
          </div>
        </div>

        <Transition name="fade">
          <div
            v-if="message.text"
            :class="
              message.type === 'error'
                ? 'bg-red-900/30 border-red-800 text-red-400'
                : 'bg-green-900/30 border-green-800 text-green-400'
            "
            class="border text-xs p-3 rounded-md flex items-start gap-2"
          >
            <span>{{ message.type === "error" ? "⚠️" : "✅" }}</span>
            <p>{{ message.text }}</p>
          </div>
        </Transition>

        <div
          class="pt-6 border-t border-gray-800 flex items-center justify-end gap-4"
        >
          <router-link
            to="/"
            class="text-gray-400 hover:text-white text-sm font-medium transition-colors px-4 py-2"
          >
            Отмена
          </router-link>
          <button
            type="submit"
            :disabled="isLoading"
            class="bg-[#8294FF] hover:bg-[#6c80ff] disabled:bg-[#4a5596] text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center min-w-[160px] shadow-lg"
          >
            <span v-if="!isLoading">Создать игру</span>
            <span v-else class="loader"></span>
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api";

const router = useRouter();
const isLoading = ref(false);
const message = ref({ text: "", type: "success" });

// Ссылки для работы с файлом
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);

const formData = ref({
  title: "",
  genre: "", // Опциональное поле
  description: "",
});

// Программный клик по скрытому инпуту
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

// Сохраняем файл, когда пользователь его выбрал
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0] || null;
  }
};

const handleSubmit = async () => {
  isLoading.value = true;
  message.value = { text: "", type: "success" };

  try {
    // 1. Формируем FormData для отправки файлов и текста вместе
    const data = new FormData();
    data.append("title", formData.value.title);
    data.append("description", formData.value.description);

    if (formData.value.genre) {
      data.append("genre", formData.value.genre);
    }

    // 2. Если выбрали картинку, прикрепляем ее под ключом 'cover'
    if (selectedFile.value) {
      data.append("cover", selectedFile.value);
    }

    // 3. Отправляем реальный запрос на бэкенд
    await api.post("/games", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    message.value = {
      text: "Игра успешно добавлена! Возвращаемся в панель...",
      type: "success",
    };

    // Задержка перед редиректом, чтобы прочитать сообщение об успехе
    setTimeout(() => {
      router.push("/");
    }, 1500);
  } catch (error: any) {
    console.error("Ошибка добавления игры:", error);

    // Пытаемся достать понятный текст ошибки от NestJS
    let errorText = "Произошла ошибка при создании игры";
    if (error.response?.data?.message) {
      errorText = Array.isArray(error.response.data.message)
        ? error.response.data.message[0]
        : error.response.data.message;
    }

    message.value = {
      text: errorText,
      type: "error",
    };
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Стили анимации оставлены без изменений */
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
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
