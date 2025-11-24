<template>
  <div class="contentQuest">
    <form class="form" @submit.prevent>
      <transition name="fade" mode="out-in">
        <QuestionEvent
          v-if="showQuestions && currentNomination"
          :key="currentNomination.id"
          :title="currentNomination.title"
          :subTitle="currentNomination.subTitle"
          :id="currentNomination.id.toString()"
          :selected="selectedValues[currentNomination.id]"
          @update:selected="updateSelected"
          :nominees="nominees" />
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
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";

const validEmails = ref([]);
const selectedValues = ref({});
const currentIndex = ref(0);
const message = ref("");
const showQuestions = ref(true);
const memberData = ref([]);
const successMessage = ref("");
const nominees = ref([]);
const loading = ref(false); // защита от двойной отправки

const nominations = [
  {
    title: "ПРИШЕЛЕЦ ГОДА",
    subTitle:
      "Сотрудник, пришедший в Компанию в 2025 году, мало говорит и носит в себе загадки (для новичков).",
    id: "unseko",
    url: "https://b5862cf2cca63d34.mokky.dev/unseko",
  },
  {
    title: "АГЕНТ MEGA",
    subTitle: "Коллега, обладающий космическим магнетизмом.",
    id: "maya",
    url: "https://b5862cf2cca63d34.mokky.dev/maya",
  },
  {
    title: "АРКАНИАНЕЦ",
    subTitle:
      "(Способны одновременно существовать в пяти измерениях) - Коллега, способный выживать в сложных условиях и с нереальной нагрузкой.",
    id: "tekila",
    url: "https://b5862cf2cca63d34.mokky.dev/tekila",
  },
  {
    title: "ПРЕДВОДИТЕЛЬ ЧЕРВЕЙ",
    subTitle:
      "Коллега, которого всегда встретишь у кофемашины или коллега, который не может выжить без чашечки кофе.",
    id: "chily",
    url: "https://b5862cf2cca63d34.mokky.dev/chily",
  },
  {
    title: "МОПС ФРЭНК",
    subTitle:
      "Сотрудник, который в курсе всего в Компании или сотрудник, который подскажет по любому вопросу.",
    id: "derty",
    url: "https://b5862cf2cca63d34.mokky.dev/derty",
  },
];

const currentNomination = computed(() => nominations[currentIndex.value]);
const isLastQuestion = computed(
  () => currentIndex.value === nominations.length - 1
);
const isFirstQuestion = computed(() => currentIndex.value === 0);

// === Загрузка номинантов ===
const fetchNominees = async () => {
  try {
    const { data } = await axios.get(currentNomination.value.url);
    // Сортируем по id
    nominees.value = data.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("Ошибка при загрузке номинантов:", error);
    message.value = "Не удалось загрузить номинантов.";
  }
};

// === РЕАКТИВНАЯ загрузка при смене вопроса ===
watch(currentIndex, () => {
  fetchNominees();
});

// === Валидные email ===
const fetchValidEmails = async () => {
  try {
    const { data } = await axios.get(
      "https://b5862cf2cca63d34.mokky.dev/members"
    );
    validEmails.value = data.map((member) => member.email);
    memberData.value = data;
  } catch (error) {
    console.error("Ошибка при загрузке email:", error);
    message.value = "Не удалось загрузить список email.";
  }
};

const updateSelected = (update) => {
  selectedValues.value[update.id] = update.value;
};

const nextQuestion = () => {
  if (!isLastQuestion.value) currentIndex.value++;
};

const previousQuestion = () => {
  if (!isFirstQuestion.value) currentIndex.value--;
};

const handleSubmit = () => {
  const unansweredIndex = nominations.findIndex(
    (nom) => !selectedValues.value[nom.id]
  );

  if (unansweredIndex !== -1) {
    currentIndex.value = unansweredIndex;
    message.value = "Пожалуйста, выберите номинанта перед отправкой.";
    return;
  }

  message.value = "";

  if (isLastQuestion.value) {
    showQuestions.value = false;
  } else {
    nextQuestion();
  }
};

const handleFinalSubmit = async (emailData) => {
  if (loading.value) return; // защита от двойного клика
  loading.value = true;

  const member = memberData.value.find((m) => m.email === emailData.email);

  if (!member) {
    message.value = "Email не найден. Пожалуйста, проверьте введенный email.";
    successMessage.value = "";
    loading.value = false;
    return;
  }

  try {
    const response = await axios.get(
      `https://b5862cf2cca63d34.mokky.dev/answers?email=${emailData.email}`
    );

    if (response.data.length > 0) {
      message.value = "Вы уже проголосовали!";
      successMessage.value = "";
      loading.value = false;
      return;
    }

    // === Оставляем старый формат (как ты просил) ===
    const dataToSend = {
      email: emailData.email,
      personId: member.personId,
      unesko: selectedValues.value["unseko"] || null,
      maya: selectedValues.value["maya"] || null,
      tekila: selectedValues.value["tekila"] || null,
      chily: selectedValues.value["chily"] || null,
      derty: selectedValues.value["derty"] || null,
    };

    await axios.post("https://b5862cf2cca63d34.mokky.dev/answers", dataToSend);

    successMessage.value = "Спасибо за ваш голос!";
    message.value = "";
  } catch (error) {
    console.error("Ошибка при отправке данных:", error);
    message.value =
      "Произошла ошибка при отправке данных. Пожалуйста, попробуйте еще раз.";
    successMessage.value = "";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchValidEmails();
  fetchNominees();
});
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
  max-width: 1200px;
  min-height: 500px;
}
.buttons {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin-top: 200px;
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
