<template>
  <div class="w-full animate-fade-in pb-12 space-y-6">
    <!-- Шапка панели управления пользователями -->
    <div
      class="bg-[#181A24] border border-red-500/30 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg"
    >
      <div>
        <span
          class="inline-block px-2.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold uppercase mb-2"
        >
          Суперюзер
        </span>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">
          Панель управления пользователями
        </h1>
        <p class="text-xs text-gray-400 mt-1">
          Добавление, редактирование и удаление профилей пользователей сайта
        </p>
      </div>

      <button
        @click="loadUsers"
        class="bg-[#222533] hover:bg-[#2A2D3E] border border-gray-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
      >
        🔄 Обновить список
      </button>
    </div>

    <!-- Уведомления об успехе или ошибке -->
    <div
      v-if="statusMessage"
      class="bg-green-900/20 border border-green-700/50 text-green-400 px-4 py-3 rounded-xl text-xs font-medium"
    >
      ✅ {{ statusMessage }}
    </div>
    <div
      v-if="errorMessage"
      class="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl text-xs font-medium"
    >
      ⚠️ {{ errorMessage }}
    </div>

    <!-- Форма добавления или редактирования профиля -->
    <div class="bg-[#181A24] border border-gray-800 rounded-2xl p-6">
      <h2 class="text-lg font-bold text-white mb-4">
        {{
          editingUserId
            ? `Редактирование профиля #${editingUserId}`
            : "Добавить нового пользователя"
        }}
      </h2>

      <form
        @submit.prevent="saveUser"
        class="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div>
          <label class="block text-xs text-gray-400 mb-1">Никнейм *</label>
          <input
            v-model="userForm.name"
            type="text"
            required
            placeholder="Имя пользователя"
            class="w-full px-3 py-2 bg-[#111111] border border-gray-700 rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1">Почта *</label>
          <input
            v-model="userForm.email"
            type="email"
            required
            placeholder="user@mail.ru"
            class="w-full px-3 py-2 bg-[#111111] border border-gray-700 rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1">
            {{ editingUserId ? "Новый пароль (необязательно)" : "Пароль *" }}
          </label>
          <input
            v-model="userForm.password"
            type="text"
            :required="!editingUserId"
            placeholder="Минимум 8 символов"
            class="w-full px-3 py-2 bg-[#111111] border border-gray-700 rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1">Роль</label>
          <select
            v-model="userForm.role"
            class="w-full px-3 py-2 bg-[#111111] border border-gray-700 rounded-lg text-sm text-white"
          >
            <option value="USER">USER (Игрок)</option>
            <option value="DEVELOPER">DEVELOPER (Разработчик)</option>
            <option value="SUPERUSER">SUPERUSER (Суперюзер)</option>
          </select>
        </div>

        <div class="md:col-span-4 flex gap-3">
          <button
            type="submit"
            class="bg-[#8294FF] hover:bg-[#6c80ff] text-white px-5 py-2 rounded-lg text-xs font-bold"
          >
            {{ editingUserId ? "Сохранить изменения" : "+ Создать профиль" }}
          </button>

          <button
            v-if="editingUserId"
            type="button"
            @click="resetUserForm"
            class="bg-[#222533] text-gray-300 px-4 py-2 rounded-lg text-xs font-bold"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>

    <!-- Таблица всех пользователей сайта -->
    <div class="bg-[#181A24] border border-gray-800 rounded-2xl overflow-hidden">
      <div class="p-4 border-b border-gray-800">
        <h3 class="text-sm font-bold text-white">
          Все пользователи ({{ users.length }})
        </h3>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-800 text-xs text-gray-400 uppercase">
              <th class="py-3 px-4">ID</th>
              <th class="py-3 px-4">Никнейм</th>
              <th class="py-3 px-4">Почта</th>
              <th class="py-3 px-4">Роль</th>
              <th class="py-3 px-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800/60">
            <tr
              v-for="u in users"
              :key="u.user_id"
              class="hover:bg-[#1C1F2B]"
            >
              <td class="py-3 px-4 text-gray-400">#{{ u.user_id }}</td>
              <td class="py-3 px-4 font-bold text-white">{{ u.name }}</td>
              <td class="py-3 px-4 text-gray-300">{{ u.email }}</td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  :class="
                    u.role === 'SUPERUSER'
                      ? 'bg-red-500/20 text-red-400'
                      : u.role === 'DEVELOPER'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-700 text-gray-300'
                  "
                >
                  {{ u.role }}
                </span>
              </td>
              <td class="py-3 px-4 text-right space-x-2">
                <button
                  @click="startEditUser(u)"
                  class="bg-[#222533] hover:bg-[#2A2D3E] text-[#8294FF] px-3 py-1 rounded text-xs font-bold"
                >
                  Изменить
                </button>
                <!-- Суперюзер не может удалить свой собственный аккаунт -->
                <button
                  v-if="Number(u.user_id) !== Number(authStore.user?.user_id)"
                  @click="deleteUser(u.user_id)"
                  class="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1 rounded text-xs font-bold"
                >
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api, getErrorMessage } from "../api";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

// Список всех пользователей
const users = ref<any[]>([]);

// Сообщения об успехе или ошибке
const statusMessage = ref("");
const errorMessage = ref("");

// Поля формы пользователя
const editingUserId = ref<number | null>(null);
const userForm = ref({
  name: "",
  email: "",
  password: "",
  role: "USER",
});

// Показать зелёное уведомление об успешном действии на 3 секунды
const showSuccess = (msg: string) => {
  statusMessage.value = msg;
  errorMessage.value = "";
  setTimeout(() => {
    statusMessage.value = "";
  }, 3000);
};

// Показать красное уведомление с текстом ошибки сервера
const showError = (error: any) => {
  errorMessage.value = getErrorMessage(error);
  statusMessage.value = "";
};

// Загрузка списка пользователей с сервера
const loadUsers = async () => {
  try {
    const response = await api.get("/users");
    users.value = response.data;
  } catch (error) {
    showError(error);
  }
};

// Заполнить форму для редактирования выбранного пользователя
const startEditUser = (u: any) => {
  editingUserId.value = u.user_id;
  userForm.value = {
    name: u.name,
    email: u.email,
    password: "",
    role: u.role,
  };
};

// Очистить форму
const resetUserForm = () => {
  editingUserId.value = null;
  userForm.value = { name: "", email: "", password: "", role: "USER" };
};

// Сохранить (добавить нового или обновить существующего пользователя)
const saveUser = async () => {
  try {
    if (editingUserId.value) {
      await api.patch(`/users/${editingUserId.value}`, userForm.value);
      showSuccess("Профиль пользователя обновлён!");
    } else {
      await api.post("/users", userForm.value);
      showSuccess("Новый профиль создан!");
    }
    resetUserForm();
    await loadUsers();
  } catch (error) {
    showError(error);
  }
};

// Удалить профиль пользователя
const deleteUser = async (userId: number) => {
  if (!confirm("Вы уверены, что хотите удалить этот профиль пользователя?")) {
    return;
  }

  try {
    await api.delete(`/users/${userId}`);
    showSuccess("Профиль пользователя удалён!");
    await loadUsers();
  } catch (error) {
    showError(error);
  }
};

onMounted(loadUsers);
</script>
