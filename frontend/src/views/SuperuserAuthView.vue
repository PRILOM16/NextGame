<template>
  <div class="flex w-full min-h-screen bg-[#111111] items-center justify-center p-6">
    <!-- Карточка отдельного входа для суперюзера -->
    <div
      class="w-full max-w-md bg-[#181A24] border border-red-500/40 rounded-2xl p-8 shadow-2xl"
    >
      <div class="text-center mb-6">
        <span
          class="inline-block px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-[10px] font-bold uppercase tracking-wider mb-3"
        >
          Закрытый раздел
        </span>
        <h1 class="text-2xl font-bold text-white">Вход для Суперюзера</h1>
        <p class="text-xs text-gray-400 mt-1">
          Обычные игроки и разработчики не могут войти через эту форму
        </p>
      </div>

      <!-- Переключатель: по почте или по никнейму -->
      <div class="flex gap-2 mb-4">
        <button
          type="button"
          @click="loginMethod = 'name'"
          :class="
            loginMethod === 'name'
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-[#111111] text-gray-400 border-gray-700'
          "
          class="flex-1 py-1.5 text-xs rounded-lg font-bold border transition-colors"
        >
          По никнейму
        </button>

        <button
          type="button"
          @click="loginMethod = 'email'"
          :class="
            loginMethod === 'email'
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-[#111111] text-gray-400 border-gray-700'
          "
          class="flex-1 py-1.5 text-xs rounded-lg font-bold border transition-colors"
        >
          По почте
        </button>
      </div>

      <form @submit.prevent="handleSuperuserLogin" class="space-y-4">
        <!-- Поле: Никнейм -->
        <div v-if="loginMethod === 'name'">
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">
            Никнейм суперюзера
          </label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="Введите никнейм"
            class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        <!-- Поле: Почта -->
        <div v-else>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">
            Электронная почта суперюзера
          </label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="Введите почту"
            class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        <!-- Поле: Пароль -->
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">
            Пароль
          </label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="Введите пароль суперюзера"
            class="w-full px-4 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        <!-- Сообщение об ошибке -->
        <div
          v-if="errorMessage"
          class="bg-red-900/30 border border-red-800 text-red-400 text-xs p-3 rounded-lg"
        >
          ⚠️ {{ errorMessage }}
        </div>

        <!-- Кнопка входа -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-lg transition-colors"
        >
          {{ isLoading ? "Проверка прав..." : "Войти как Суперюзер" }}
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-gray-800 flex justify-between text-xs">
        <router-link to="/" class="text-gray-400 hover:text-white">
          ← На главную
        </router-link>
        <router-link to="/login" class="text-[#8294FF] hover:underline">
          Обычный вход
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getErrorMessage } from "../api";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// Способ входа: по никнейму ('name') или по почте ('email')
const loginMethod = ref<"name" | "email">("name");

// Поля формы
const name = ref("");
const email = ref("");
const password = ref("");

// Состояние загрузки и текста ошибки
const isLoading = ref(false);
const errorMessage = ref("");

// Отправка данных на специальный эндпоинт суперюзера
const handleSuperuserLogin = async () => {
  errorMessage.value = "";
  isLoading.value = true;

  try {
    if (loginMethod.value === "name") {
      await authStore.superuserLogin({
        name: name.value.trim(),
        password: password.value,
      });
    } else {
      await authStore.superuserLogin({
        email: email.value.trim(),
        password: password.value,
      });
    }

    // После успешного входа переходим сразу в панель суперюзера
    router.push("/superuser");
  } catch (error: any) {
    errorMessage.value = getErrorMessage(
      error,
      "Неверные данные или у вас нет прав суперюзера",
    );
  } finally {
    isLoading.value = false;
  }
};
</script>
