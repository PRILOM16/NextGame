<template>
  <div class="flex w-full min-h-screen">
    <!-- ЛЕВАЯ ПАНЕЛЬ -->
    <div
      class="hidden lg:flex w-1/2 bg-[#1C1F2B] p-12 flex-col justify-between"
    >
      <div class="text-xl font-bold tracking-wide">
        <span class="text-white">Next</span
        ><span class="text-[#8294FF]">Game</span>
      </div>
      <div class="max-w-md mb-20">
        <p
          class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4"
        >
          игровое сообщество
        </p>
        <h1 class="text-5xl font-bold text-white mb-6 leading-[1.1]">
          Играй.<br />Обсуждай.<br />Влияй.
        </h1>
        <p class="text-gray-400 text-sm mb-8 leading-relaxed">
          Следи за любимыми играми, читай новости и участвуй в опросах
          разработчиков.
        </p>
        <div class="border-l-[3px] border-[#8294FF] pl-4">
          <p class="text-white text-xs font-medium">
            Твоё мнение помогает создавать лучшие игры.
          </p>
        </div>
      </div>
      <div></div>
    </div>

    <!-- ПРАВАЯ ПАНЕЛЬ -->
    <div
      class="w-full lg:w-1/2 bg-[#111111] flex flex-col justify-center items-center relative p-8"
    >
      <router-link
        to="/"
        class="absolute top-8 left-8 lg:top-12 lg:left-16 text-gray-500 hover:text-white text-xs transition-colors"
      >
        ← На главную
      </router-link>

      <div class="w-full max-w-[380px]">
        <h2 class="text-2xl font-bold text-white mb-2">Добро пожаловать</h2>
        <p class="text-gray-400 text-xs mb-8">
          Войди или создай новый аккаунт.
        </p>

        <!-- Основные вкладки: Вход / Регистрация -->
        <div class="flex bg-[#1E1E1E] rounded-md p-1 mb-6">
          <router-link
            to="/login"
            :class="
              isLogin
                ? 'bg-[#333544] text-white shadow'
                : 'text-gray-400 hover:text-white'
            "
            class="w-1/2 text-center text-xs py-2 rounded font-medium transition-colors"
            >Вход</router-link
          >
          <router-link
            to="/register"
            :class="
              !isLogin
                ? 'bg-[#333544] text-white shadow'
                : 'text-gray-400 hover:text-white'
            "
            class="w-1/2 text-center text-xs py-2 rounded font-medium transition-colors"
            >Регистрация</router-link
          >
        </div>

        <form
          @submit.prevent="handleSubmit"
          class="space-y-4"
          :class="{ 'animate-shake': isShaking }"
        >
          <!-- Переключатель способа входа (Виден ТОЛЬКО при логине) -->
          <Transition name="fade">
            <div v-if="isLogin" class="flex gap-2 mb-2">
              <button
                type="button"
                @click="loginMethod = 'email'"
                :class="
                  loginMethod === 'email'
                    ? 'bg-[#8294FF] text-white border-[#8294FF]'
                    : 'bg-[#171717] text-gray-500 border-gray-700 hover:text-gray-300'
                "
                class="px-3 py-1 text-[10px] rounded transition-colors font-semibold border"
              >
                По почте
              </button>
              <button
                type="button"
                @click="loginMethod = 'name'"
                :class="
                  loginMethod === 'name'
                    ? 'bg-[#8294FF] text-white border-[#8294FF]'
                    : 'bg-[#171717] text-gray-500 border-gray-700 hover:text-gray-300'
                "
                class="px-3 py-1 text-[10px] rounded transition-colors font-semibold border"
              >
                По никнейму
              </button>
            </div>
          </Transition>

          <!-- Поле: Никнейм (Показываем при регистрации ИЛИ при логине по нику) -->
          <Transition name="fade-slide">
            <div v-if="!isLogin || (isLogin && loginMethod === 'name')">
              <label
                class="block text-[11px] font-semibold text-gray-300 mb-1.5"
                >Никнейм</label
              >
              <input
                v-model="name"
                type="text"
                placeholder="Ваш никнейм"
                :required="!isLogin || loginMethod === 'name'"
                class="w-full px-4 py-2.5 bg-[#171717] border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:border-[#8294FF] transition-colors"
              />
            </div>
          </Transition>

          <!-- Поле: Email (Показываем при регистрации ИЛИ при логине по почте) -->
          <Transition name="fade-slide">
            <div v-if="!isLogin || (isLogin && loginMethod === 'email')">
              <label
                class="block text-[11px] font-semibold text-gray-300 mb-1.5"
                >Электронная почта</label
              >
              <input
                v-model="email"
                type="email"
                placeholder="name@example.com"
                :required="!isLogin || loginMethod === 'email'"
                class="w-full px-4 py-2.5 bg-[#171717] border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:border-[#8294FF] transition-colors"
              />
            </div>
          </Transition>

          <!-- Поле: Пароль (с кнопкой видимости) -->
          <div>
            <label class="block text-[11px] font-semibold text-gray-300 mb-1.5"
              >Пароль</label
            >
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Не менее 8 символов"
                required
                :minlength="isLogin ? 1 : 8"
                class="w-full px-4 py-2.5 bg-[#171717] border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:border-[#8294FF] transition-colors pr-10"
              />

              <!-- Кнопка Глазик -->
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#8294FF] transition-colors p-1"
              >
                <!-- Иконка закрытого глаза -->
                <svg
                  v-if="!showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
                <!-- Иконка открытого глаза -->
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Роль и Чекбокс (Только для регистрации) -->
          <Transition name="fade-slide">
            <div v-if="!isLogin" class="space-y-4">
              <div>
                <label
                  class="block text-[11px] font-semibold text-gray-300 mb-1.5"
                  >Роль</label
                >
                <select
                  v-model="role"
                  class="w-full px-4 py-2.5 bg-[#171717] border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:border-[#8294FF] transition-colors appearance-none"
                >
                  <option value="USER">Игрок</option>
                  <option value="DEVELOPER">Разработчик</option>
                </select>
              </div>
              <div class="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="terms"
                  :required="!isLogin"
                  class="w-3.5 h-3.5 bg-[#171717] border-gray-700 rounded accent-[#8294FF]"
                />
                <label for="terms" class="ml-2 text-[10px] text-gray-400"
                  >Согласен с условиями использования</label
                >
              </div>
            </div>
          </Transition>

          <!-- Вывод ошибки -->
          <Transition name="fade">
            <div
              v-if="errorMessage"
              class="bg-red-900/30 border border-red-800 text-red-400 text-xs p-3 rounded-md mt-2 flex items-start gap-2"
            >
              <span>⚠️</span>
              <p>{{ errorMessage }}</p>
            </div>
          </Transition>

          <!-- Кнопка -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-[#8294FF] hover:bg-[#6c80ff] disabled:bg-[#4a5596] disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-md transition-colors mt-4 relative flex justify-center items-center h-10"
          >
            <span v-if="!isLoading">{{
              isLogin ? "Войти" : "Создать аккаунт"
            }}</span>
            <span v-else class="loader"></span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLogin = computed(() => route.name === "login");

// Локальное состояние полей
const name = ref("");
const email = ref("");
const password = ref("");
const role = ref("USER");

// Состояние интерфейса
const errorMessage = ref("");
const isLoading = ref(false);
const isShaking = ref(false);
const showPassword = ref(false); // Для глазика
const loginMethod = ref<"email" | "name">("email"); // Способ логина

// Очистка при смене вкладок
watch(isLogin, () => {
  errorMessage.value = "";
  loginMethod.value = "email"; // Сброс метода на почту при возврате
});

const handleSubmit = async () => {
  errorMessage.value = "";
  isLoading.value = true;

  try {
    if (isLogin.value) {
      // Отправляем либо { email, password }, либо { name, password }
      if (loginMethod.value === "email") {
        await authStore.login({ email: email.value, password: password.value });
      } else {
        await authStore.login({ name: name.value, password: password.value });
      }
    } else {
      await authStore.register(
        name.value,
        email.value,
        password.value,
        role.value,
      );
    }
    router.push("/");
  } catch (error: any) {
    if (error.response) {
      const data = error.response.data;
      if (data.message) {
        errorMessage.value = Array.isArray(data.message)
          ? data.message[0]
          : data.message;
      } else if (data.error) {
        errorMessage.value = data.error;
      } else {
        errorMessage.value = isLogin.value
          ? "Неверные данные для входа"
          : "Ошибка при регистрации";
      }
    } else if (error.request) {
      errorMessage.value = "Сервер не отвечает. Проверьте подключение.";
    } else {
      errorMessage.value = "Произошла ошибка: " + error.message;
    }

    isShaking.value = true;
    setTimeout(() => {
      isShaking.value = false;
    }, 500);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
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
