<template>
  <div class="email-input-container">
    <h2 class="title">Введите ваш Email</h2>
    <div v-if="!isSubmitted">
      <input
        v-model="email"
        type="email"
        placeholder="example@mail.com"
        class="email-input" />
      <input
        v-model="password"
        type="password"
        placeholder="Введите пароль"
        class="email-input" />
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <button
        @click="submitEmail"
        :disabled="!isEmailValid || loading"
        class="submit-button">
        {{ loading ? "Отправка..." : "Отправить" }}
      </button>
    </div>
    <div v-else class="success-message">Вы успешно проголосовали!</div>
  </div>
</template>

<script setup>
import { ref, defineEmits, toRefs, watch } from "vue";

const props = defineProps({
  validEmails: Array, // Массив валидных email
  memberData: Array, // Массив данных о пользователях
});

const { validEmails, memberData } = toRefs(props);
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const emit = defineEmits(["submitted"]);
const isEmailValid = ref(false);
const isSubmitted = ref(false);
const loading = ref(false);
let validPassword = ""; // Для хранения валидного пароля

// Валидация email
watch(email, (newValue) => {
  const member = memberData.value.find(
    (member) => member.email === newValue.trim()
  );
  if (member) {
    errorMessage.value = "";
    isEmailValid.value = true;
    validPassword = member.password; // Сохраняем пароль для проверки
  } else {
    errorMessage.value = "Неверный email. Пожалуйста, попробуйте еще раз.";
    isEmailValid.value = false;
  }
});

const submitEmail = () => {
  if (isEmailValid.value && password.value === validPassword) {
    loading.value = true;
    emit("submitted", { email: email.value, password: password.value });
    console.log("Email для отправки:", email.value);
    isSubmitted.value = true;
    email.value = "";
    password.value = "";
    errorMessage.value = "";
    loading.value = false; // Завершаем загрузку
  } else if (isEmailValid.value) {
    errorMessage.value = "Пароль неверен. Пожалуйста, попробуйте еще раз.";
  }
};
</script>

<style scoped>
.email-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.title {
  margin-bottom: 20px;
  font-size: 24px;
  text-align: center;
}

.email-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 16px;
}

.error-message {
  color: red;
  margin-bottom: 10px;
}

.submit-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.success-message {
  color: green;
  font-size: 18px;
  text-align: center;
  margin-top: 20px;
}
</style>
