<template>
  <div class="w-full max-w-5xl mx-auto animate-fade-in pb-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white mb-1">Настройки</h1>
        <p class="text-xs text-gray-400">
          Управление аккаунтом и параметрами профиля
        </p>
      </div>
      <router-link
        to="/profile"
        class="text-gray-500 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
      >
        <span>←</span> Вернуться в профиль
      </router-link>
    </div>

    <div class="flex flex-col md:flex-row gap-6 items-start">
      <!-- ЛЕВАЯ КОЛОНКА: Навигация по настройкам -->
      <aside
        class="w-full md:w-64 flex-shrink-0 bg-[#181A24] rounded-2xl p-4 border border-gray-800/50"
      >
        <nav class="space-y-1">
          <button
            @click="activeTab = 'general'"
            :class="
              activeTab === 'general'
                ? 'bg-[#222533] text-white border-[#8294FF]'
                : 'text-gray-400 hover:bg-[#222533]/50 hover:text-gray-300 border-transparent'
            "
            class="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors border-l-2 text-left"
          >
            <span class="opacity-70">👤</span> Основные
          </button>
          <button
            @click="activeTab = 'security'"
            :class="
              activeTab === 'security'
                ? 'bg-[#222533] text-white border-[#8294FF]'
                : 'text-gray-400 hover:bg-[#222533]/50 hover:text-gray-300 border-transparent'
            "
            class="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors border-l-2 text-left"
          >
            <span class="opacity-70">🔒</span> Безопасность
          </button>
          <button
            @click="activeTab = 'notifications'"
            :class="
              activeTab === 'notifications'
                ? 'bg-[#222533] text-white border-[#8294FF]'
                : 'text-gray-400 hover:bg-[#222533]/50 hover:text-gray-300 border-transparent'
            "
            class="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors border-l-2 text-left"
          >
            <span class="opacity-70">🔔</span> Уведомления
          </button>
        </nav>
      </aside>

      <!-- ПРАВАЯ КОЛОНКА: Формы настроек -->
      <main
        class="flex-1 w-full bg-[#181A24] rounded-2xl p-6 md:p-8 border border-gray-800/50"
      >
        <!-- Вкладка: ОСНОВНЫЕ -->
        <div v-if="activeTab === 'general'" class="space-y-6 animate-fade-in">
          <h2
            class="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4"
          >
            Основные настройки
          </h2>

          <form @submit.prevent="saveGeneral" class="space-y-5 max-w-lg">
            <!-- Аватар профиля -->
            <div class="pb-5 border-b border-gray-800">
              <label
                class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3"
              >
                Фотография профиля
              </label>

              <div class="flex items-center gap-5">
                <!-- Предварительный просмотр -->
                <div
                  class="w-20 h-20 rounded-full bg-[#222533] border border-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0"
                >
                  <img
                    v-if="avatarPreview || profileAvatarUrl"
                    :src="avatarPreview || profileAvatarUrl"
                    alt="Аватар профиля"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-2xl font-bold text-[#8294FF]">
                    {{ authStore.user?.name?.charAt(0).toUpperCase() || "?" }}
                  </span>
                </div>

                <div class="flex flex-col gap-2">
                  <label
                    for="avatar-input"
                    class="cursor-pointer inline-flex items-center justify-center bg-[#222533] border border-gray-700 hover:border-[#8294FF] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    Выбрать изображение
                  </label>

                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    class="hidden"
                    @change="handleAvatarSelect"
                  />

                  <p class="text-[10px] text-gray-500">
                    JPG, PNG или WEBP. Максимальный размер — 5 МБ.
                  </p>
                </div>
              </div>

              <div v-if="selectedAvatar" class="mt-4">
                <button
                  type="button"
                  @click="cancelAvatarSelection"
                  class="text-gray-400 hover:text-white text-xs transition-colors"
                >
                  Отменить выбор фотографии
                </button>
              </div>

              <p v-if="avatarMessage" class="text-xs text-green-400 mt-3">
                {{ avatarMessage }}
              </p>

              <p v-if="avatarError" class="text-xs text-red-400 mt-3">
                {{ avatarError }}
              </p>
            </div>
            <div>
              <label
                class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
                >Никнейм</label
              >
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF] transition-colors"
              />
              <p class="text-[10px] text-gray-500 mt-1.5">
                Никнейм отображается в комментариях и опросах.
              </p>
            </div>

            <div>
              <label
                class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
                >Электронная почта</label
              >
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF] transition-colors"
              />
            </div>

            <div class="pt-4 border-t border-gray-800 flex items-center gap-4">
              <button
                type="submit"
                :disabled="isSaving"
                class="bg-[#8294FF] hover:bg-[#6c80ff] disabled:bg-[#4a5596] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center min-w-[140px]"
              >
                <span v-if="!isSaving">Сохранить</span>
                <span v-else class="loader"></span>
              </button>
              <Transition name="fade">
                <span
                  v-if="successMessage"
                  class="text-green-400 text-xs font-medium"
                  >{{ successMessage }}</span
                >
              </Transition>
            </div>
          </form>
        </div>

        <!-- Вкладка: БЕЗОПАСНОСТЬ -->
        <div v-if="activeTab === 'security'" class="space-y-6 animate-fade-in">
          <h2
            class="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4"
          >
            Изменение пароля
          </h2>

          <form @submit.prevent="savePassword" class="space-y-5 max-w-lg">
            <div>
              <label
                class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
                >Текущий пароль</label
              >
              <input
                v-model="securityData.oldPassword"
                type="password"
                required
                class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF] transition-colors"
              />
            </div>

            <div>
              <label
                class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
                >Новый пароль</label
              >
              <input
                v-model="securityData.newPassword"
                type="password"
                required
                minlength="8"
                class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF] transition-colors"
              />
            </div>

            <div class="pt-4 border-t border-gray-800 flex items-center gap-4">
              <button
                type="submit"
                :disabled="isSaving"
                class="bg-[#1C1F2B] border border-gray-700 hover:bg-[#2A2D3E] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
              >
                Обновить пароль
              </button>
            </div>
          </form>

          <div class="mt-12 pt-6 border-t border-red-900/30 max-w-lg">
            <h3 class="text-red-400 font-bold mb-2 text-sm">Опасная зона</h3>
            <p class="text-xs text-gray-500 mb-4">
              Удаление аккаунта приведет к безвозвратной потере всех данных,
              подписок и проектов.
            </p>
            <button
              class="bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              Удалить аккаунт
            </button>
          </div>
        </div>

        <!-- Вкладка: УВЕДОМЛЕНИЯ -->
        <div
          v-if="activeTab === 'notifications'"
          class="space-y-6 animate-fade-in"
        >
          <h2
            class="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4"
          >
            Настройка уведомлений
          </h2>

          <div class="space-y-4 max-w-lg">
            <label
              class="flex items-center justify-between p-4 bg-[#111111] border border-gray-800 rounded-lg cursor-pointer hover:border-gray-700 transition-colors"
            >
              <div>
                <p class="text-sm font-bold text-white mb-1">Новые опросы</p>
                <p class="text-[10px] text-gray-500">
                  Уведомлять, когда разработчики запускают опросы в играх из
                  ваших подписок.
                </p>
              </div>
              <input
                type="checkbox"
                checked
                class="w-5 h-5 accent-[#8294FF] bg-transparent border-gray-600 rounded"
              />
            </label>

            <label
              class="flex items-center justify-between p-4 bg-[#111111] border border-gray-800 rounded-lg cursor-pointer hover:border-gray-700 transition-colors"
            >
              <div>
                <p class="text-sm font-bold text-white mb-1">
                  Новости обновлений
                </p>
                <p class="text-[10px] text-gray-500">
                  Присылать важные новости о патчах и релизах.
                </p>
              </div>
              <input
                type="checkbox"
                checked
                class="w-5 h-5 accent-[#8294FF] bg-transparent border-gray-600 rounded"
              />
            </label>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { api } from "../api";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
// Адрес сохранённого аватара
const profileAvatarUrl = computed(() => {
  const avatar = authStore.user?.avatar_url;

  if (!avatar) return "";

  return avatar.startsWith("http")
    ? avatar
    : `${api.defaults.baseURL}${avatar}`;
});

const activeTab = ref("general");
const isSaving = ref(false);
const successMessage = ref("");

// Загрузка аватара
const selectedAvatar = ref<File | null>(null);
const avatarPreview = ref("");
const avatarMessage = ref("");
const avatarError = ref("");

// Выбор изображения
const handleAvatarSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  avatarMessage.value = "";
  avatarError.value = "";

  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    avatarError.value = "Выберите изображение JPG, PNG или WEBP.";
    target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    avatarError.value = "Размер изображения не должен превышать 5 МБ.";
    target.value = "";
    return;
  }

  // Удаляем предыдущий временный URL
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value);
  }

  selectedAvatar.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};

// Отмена выбора изображения
const cancelAvatarSelection = () => {
  selectedAvatar.value = null;

  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value);
  }

  avatarPreview.value = "";

  const input = document.getElementById(
    "avatar-input",
  ) as HTMLInputElement | null;

  if (input) input.value = "";

  avatarError.value = "";
  avatarMessage.value = "";
};

// Отправка изображения на сервер
// Отправка выбранного аватара на сервер
const uploadAvatar = async () => {
  if (!selectedAvatar.value) return;

  const formData = new FormData();
  formData.append("avatar", selectedAvatar.value);

  await api.post("/users/me/avatar", formData);

  // Получаем обновлённый профиль
  await authStore.fetchProfile();

  // Удаляем временный предпросмотр
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value);
  }

  avatarPreview.value = "";
  selectedAvatar.value = null;

  const input = document.getElementById(
    "avatar-input",
  ) as HTMLInputElement | null;

  if (input) input.value = "";
};

// Освобождаем временный URL изображения
onUnmounted(() => {
  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value);
  }
});

// Данные формы профиля
const formData = ref({
  name: "",
  email: "",
  bio: "",
});

// Данные формы безопасности
const securityData = ref({
  oldPassword: "",
  newPassword: "",
});

// Заполняем форму текущими данными пользователя при загрузке
onMounted(async () => {
  // Убедимся, что данные юзера загружены
  if (!authStore.user) {
    await authStore.fetchProfile();
  }

  if (authStore.user) {
    formData.value.name = authStore.user.name || "";
    formData.value.email = authStore.user.email || "";
    // bio можно будет добавить в БД позже
  }
});

const saveGeneral = async () => {
  isSaving.value = true;
  successMessage.value = "";
  avatarError.value = "";

  try {
    // Если выбрана новая фотография — загружаем её
    if (selectedAvatar.value) {
      await uploadAvatar();
    }

    // Имитация сохранения остальных настроек
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Обновляем локальные данные пользователя
    if (authStore.user) {
      authStore.user.name = formData.value.name;
      authStore.user.email = formData.value.email;
    }

    successMessage.value = "Изменения сохранены!";

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error: any) {
    console.error("Ошибка сохранения:", error);
    console.error("Ответ сервера:", error.response?.data);

    avatarError.value =
      error.response?.data?.message ||
      "Не удалось сохранить изменения. Попробуйте ещё раз.";
  } finally {
    isSaving.value = false;
  }
};

const savePassword = async () => {
  // Логика для смены пароля (в будущем запрос на /auth/change-password)
  console.log("Смена пароля", securityData.value);
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loader {
  width: 16px;
  height: 16px;
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
