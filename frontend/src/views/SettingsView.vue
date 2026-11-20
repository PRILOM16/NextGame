<template>
  <div class="w-full max-w-3xl mx-auto animate-fade-in pb-12 space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white mb-1">Настройки профиля</h1>
        <p class="text-xs text-gray-400">
          Управление данными аккаунта, фотографией профиля и паролем
        </p>
      </div>

      <router-link
        to="/profile"
        class="text-gray-400 hover:text-white text-sm font-medium transition-colors"
      >
        ← Вернуться в профиль
      </router-link>
    </div>

    <!-- БЛОК 1: ОСНОВНЫЕ ДАННЫЕ (АВАТАР И НИКНЕЙМ) -->
    <section
      class="bg-[#181A24] rounded-2xl p-6 md:p-8 border border-gray-800/50 shadow-lg"
    >
      <h2 class="text-lg font-bold text-white mb-6 pb-3 border-b border-gray-800">
        Основные данные
      </h2>

      <form @submit.prevent="saveProfile" class="space-y-6">
        <!-- Фотография профиля -->
        <div>
          <label
            class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3"
          >
            Фотография профиля
          </label>

          <div class="flex items-center gap-5">
            <div
              class="w-20 h-20 rounded-full bg-[#222533] border border-gray-700 overflow-hidden flex items-center justify-center shrink-0"
            >
              <img
                v-if="avatarPreview || authStore.user?.avatar_url"
                :src="avatarPreview || getMediaUrl(authStore.user?.avatar_url)"
                alt="Аватар"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-2xl font-bold text-[#8294FF]">
                {{ authStore.user?.name?.charAt(0).toUpperCase() || "?" }}
              </span>
            </div>

            <div>
              <label
                class="cursor-pointer inline-block bg-[#222533] border border-gray-700 hover:border-[#8294FF] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                Выбрать изображение
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarSelect"
                />
              </label>

              <p class="text-[11px] text-gray-500 mt-2">
                Форматы: JPG, PNG, WEBP.
              </p>
            </div>
          </div>
        </div>

        <!-- Никнейм -->
        <div>
          <label
            class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Никнейм
          </label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF]"
          />
        </div>

        <!-- Сообщения для профиля -->
        <p v-if="profileSuccess" class="text-xs text-green-400">
          ✅ {{ profileSuccess }}
        </p>
        <p v-if="profileError" class="text-xs text-red-400">
          ⚠️ {{ profileError }}
        </p>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSavingProfile"
            class="bg-[#8294FF] hover:bg-[#6c80ff] disabled:bg-[#4a5596] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
          >
            {{ isSavingProfile ? "Сохранение..." : "Сохранить профиль" }}
          </button>
        </div>
      </form>
    </section>

    <!-- БЛОК 2: ИЗМЕНЕНИЕ ПАРОЛЯ -->
    <section
      class="bg-[#181A24] rounded-2xl p-6 md:p-8 border border-gray-800/50 shadow-lg"
    >
      <h2 class="text-lg font-bold text-white mb-6 pb-3 border-b border-gray-800">
        Изменение пароля
      </h2>

      <form @submit.prevent="changePassword" class="space-y-5">
        <div>
          <label
            class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Текущий пароль *
          </label>
          <input
            v-model="oldPassword"
            type="password"
            required
            placeholder="Введите ваш старый пароль"
            class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF]"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
            >
              Новый пароль (от 8 символов) *
            </label>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="8"
              placeholder="Новый пароль"
              class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF]"
            />
          </div>

          <div>
            <label
              class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
            >
              Повторите новый пароль *
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="8"
              placeholder="Повторите новый пароль"
              class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#8294FF]"
            />
          </div>
        </div>

        <!-- Сообщения для смены пароля -->
        <p v-if="passwordSuccess" class="text-xs text-green-400">
          ✅ {{ passwordSuccess }}
        </p>
        <p v-if="passwordError" class="text-xs text-red-400">
          ⚠️ {{ passwordError }}
        </p>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSavingPassword"
            class="bg-[#222533] hover:bg-[#2A2D3E] border border-gray-700 hover:border-[#8294FF] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            {{ isSavingPassword ? "Обновление..." : "Обновить пароль" }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api, getMediaUrl, getErrorMessage } from "../api";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

// Поля профиля
const name = ref("");
const selectedAvatar = ref<File | null>(null);
const avatarPreview = ref("");
const isSavingProfile = ref(false);
const profileSuccess = ref("");
const profileError = ref("");

// Поля смены пароля
const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const isSavingPassword = ref(false);
const passwordSuccess = ref("");
const passwordError = ref("");

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchProfile();
  }
  if (authStore.user) {
    name.value = authStore.user.name || "";
  }
});

// Выбор новой картинки для аватара
const handleAvatarSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  selectedAvatar.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};

// 1. Сохранение имени и аватара на сервере
const saveProfile = async () => {
  isSavingProfile.value = true;
  profileSuccess.value = "";
  profileError.value = "";

  try {
    if (selectedAvatar.value) {
      const formData = new FormData();
      formData.append("avatar", selectedAvatar.value);
      await api.post("/users/me/avatar", formData);
      selectedAvatar.value = null;
      avatarPreview.value = "";
    }

    if (name.value.trim() && name.value.trim() !== authStore.user?.name) {
      await api.patch("/users/me", { name: name.value.trim() });
    }

    await authStore.fetchProfile();
    profileSuccess.value = "Данные профиля успешно сохранены!";
  } catch (error: any) {
    console.error("Ошибка сохранения профиля:", error);
    profileError.value =
      error.response?.data?.message || "Не удалось сохранить изменения.";
  } finally {
    isSavingProfile.value = false;
  }
};

// 2. Изменение пароля пользователя
const changePassword = async () => {
  passwordSuccess.value = "";
  passwordError.value = "";

  if (newPassword.value.length < 8) {
    passwordError.value = "Новый пароль должен содержать не менее 8 символов.";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = "Новый пароль и его подтверждение не совпадают.";
    return;
  }

  isSavingPassword.value = true;

  try {
    await api.patch("/users/me/password", {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    });

    passwordSuccess.value = "Пароль успешно изменён!";
    oldPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (error: any) {
    console.error("Ошибка смены пароля:", error);
    passwordError.value = getErrorMessage(
      error,
      "Не удалось изменить пароль.",
    );
  } finally {
    isSavingPassword.value = false;
  }
};
</script>
