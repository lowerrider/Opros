<template>
  <div class="contentQuest">
    <form class="form" @submit.prevent>
      <transition name="fade" mode="out-in">
        <QuestionEvent
          v-if="showQuestions"
          :key="currentNomination.id"
          :title="currentNomination.title"
          :subTitle="currentNomination.subTitle"
          :id="currentNomination.id"
          :selected="selectedValues[currentNomination.id]"
          @update:selected="updateSelected" />
        <EmailInput
          v-else
          :validEmails="validEmails"
          :memberData="memberData"
          @submitted="handleFinalSubmit" />
      </transition>
      <div v-if="message" class="error-message">{{ message }}</div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      <div class="buttons" v-if="showQuestions">
        <button
          type="button"
          @click="previousQuestion"
          :disabled="isFirstQuestion"
          :class="{ 'disabled-button': isFirstQuestion }">
          Предыдущий вопрос
        </button>
        <button v-if="!isLastQuestion" type="button" @click="nextQuestion">
          Следующий вопрос
        </button>
        <button v-else type="button" @click="handleSubmit">Отправить</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import QuestionEvent from "./QuestionEvent.vue";
import EmailInput from "./EmailInput.vue";
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const nomination = [
  {
    title: "НАСЛЕДИЕ ЮНЕСКО",
    subTitle: "Сотрудник, работой с которым гордится вся компания!",
    id: "unesko",
  },
  {
    title: "ЗАГАДОЧНЫЙ МАЙЯ",
    subTitle: "Внимательно следит за деталями, улавливает тонкости...",
    id: "maya",
  },
  {
    title: "ТЕКИЛА ЛЮБОВЬ",
    subTitle: "Самый обаятельный и привлекательный даже без текилы.",
    id: "tekila",
  },
  {
    title: "ОСТРЫЙ КАК ПЕРЕЦ ЧИЛИ",
    subTitle: "Самый остроумный и веселый сотрудник компании.",
    id: "chily",
  },
  {
    title: "ГРЯЗНЫЙ САНЧЕС",
    subTitle: "Сотрудник, который больше всех работает по мнению окружающих.",
    id: "derty",
  },
];

const validEmails = ref([]);
const selectedValues = ref({});
const currentIndex = ref(0);
const message = ref("");
const showQuestions = ref(true);
const memberData = ref([]);
const successMessage = ref("");

const currentNomination = computed(() => nomination[currentIndex.value]);
const isLastQuestion = computed(
  () => currentIndex.value === nomination.length - 1
);
const isFirstQuestion = computed(() => currentIndex.value === 0);

const fetchValidEmails = async () => {
  try {
    const { data } = await axios.get(
      "https://b5862cf2cca63d34.mokky.dev/members"
    );
    validEmails.value = data.map((member) => member.email);
    memberData.value = data; // Сохраняем данные о пользователях
  } catch (error) {
    console.error("Ошибка при загрузке email:", error);
  }
};

const updateSelected = ({ id, value }) => {
  selectedValues.value[id] = value;
  message.value = "";
};

const nextQuestion = () => {
  if (!isLastQuestion.value) {
    currentIndex.value++;
  }
};

const previousQuestion = () => {
  if (!isFirstQuestion.value) {
    currentIndex.value--;
  }
};

const handleSubmit = () => {
  const unansweredIndex = nomination.findIndex(
    (n) => !selectedValues.value[n.id]
  );

  if (unansweredIndex !== -1) {
    message.value = "Вы ответили не на все вопросы";
    currentIndex.value = unansweredIndex;
  } else {
    message.value = "";
    showQuestions.value = false;
  }
};

const handleFinalSubmit = async (emailData) => {
  const member = memberData.value.find((m) => m.email === emailData.email);

  if (member) {
    try {
      const response = await axios.get(
        `https://b5862cf2cca63d34.mokky.dev/answers?email=${emailData.email}`
      );

      if (response.data.length > 0) {
        message.value = "Вы уже проголосовали!";
        successMessage.value = "";
        return;
      }

      const dataToSend = {
        email: emailData.email,
        personId: member.personId,
        unesko: selectedValues.value["unesko"] || null,
        maya: selectedValues.value["maya"] || null,
        tekila: selectedValues.value["tekila"] || null,
        chily: selectedValues.value["chily"] || null,
        derty: selectedValues.value["derty"] || null,
      };

      console.log("Отправляемые данные:", dataToSend);

      await axios.post(
        "https://b5862cf2cca63d34.mokky.dev/answers",
        dataToSend
      );
      console.log("Данные успешно отправлены:", dataToSend);
      successMessage.value = "Спасибо за ваш голос!";
      message.value = "";
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
      message.value =
        "Произошла ошибка при отправке данных. Пожалуйста, попробуйте еще раз.";
      successMessage.value = "";
    }
  } else {
    message.value = "Email не найден. Пожалуйста, проверьте введенный email.";
    successMessage.value = "";
  }
};

onMounted(fetchValidEmails);
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 20px;
  text-align: center;
  width: 100%;
}
.success-message {
  color: green;
  margin-top: 20px;
  text-align: center;
  width: 100%;
}
.form {
  width: 100%;
  max-width: 1100px;
  min-height: 500px;
}
.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.contentQuest {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.disabled-button {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
