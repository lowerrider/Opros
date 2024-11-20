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
          :nominees="nominees"
        />
        <EmailInput
          v-else
          :validEmails="validEmails"
          :memberData="memberData"
          @submitted="handleFinalSubmit"
        />
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
          :class="{ 'disabled-button': isFirstQuestion }"
        >
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

const validEmails = ref([]);
const selectedValues = ref({});
const currentIndex = ref(0);
const message = ref("");
const showQuestions = ref(true);
const memberData = ref([]);
const successMessage = ref("");
const nominees = ref([]);

const nominations = [
  {
    title: "НАСЛЕДИЕ ЮНЕСКО",
    subTitle: "Сотрудник, работой с которым гордится вся компания!",
    id: "unseko",
    url: "https://b5862cf2cca63d34.mokky.dev/unseko",
  },
  {
    title: "ЗАГАДОЧНЫЙ МАЙЯ",
    subTitle: "Внимательно следит за деталями, улавливает тонкости...",
    id: "maya",
    url: "https://b5862cf2cca63d34.mokky.dev/maya",
  },
  {
    title: "ТЕКИЛА ЛЮБОВЬ",
    subTitle: "Самый обаятельный и привлекательный даже без текилы.",
    id: "tekila",
    url: "https://b5862cf2cca63d34.mokky.dev/tekila",
  },
  {
    title: "ОСТРЫЙ КАК ПЕРЕЦ ЧИЛИ",
    subTitle: "Самый остроумный и веселый сотрудник компании.",
    id: "chily",
    url: "https://b5862cf2cca63d34.mokky.dev/chily",
  },
  {
    title: "CЛАВНЫЙ САНЧЕС",
    subTitle: "Сотрудник, который больше всех работает по мнению окружающих.",
    id: "derty",
    url: "https://b5862cf2cca63d34.mokky.dev/derty",
  },
];

const currentNomination = computed(() => nominations[currentIndex.value]);
const isLastQuestion = computed(
  () => currentIndex.value === nominations.length - 1
);
const isFirstQuestion = computed(() => currentIndex.value === 0);

// Функция для загрузки номинантов
const fetchNominees = async () => {
  try {
    const { data } = await axios.get(currentNomination.value.url);
    nominees.value = data.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error("Ошибка при загрузке номинантов:", error);
    message.value = "Не удалось загрузить номинантов.";
  }
};

// Функция для загрузки валидных email
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
  if (currentIndex.value < nominations.length - 1) {
    currentIndex.value++;
    fetchNominees(); // Обновляем список номинантов
  }
};

const previousQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    fetchNominees(); // Обновляем список номинантов
  }
};

const handleSubmit = () => {
  const unansweredQuestion = nominations.find((nom, index) => {
    return !selectedValues.value[nom.id] && index <= currentIndex.value;
  });

  if (unansweredQuestion) {
    const unansweredIndex = nominations.findIndex(
      (nom) => nom.id === unansweredQuestion.id
    );
    currentIndex.value = unansweredIndex;
    message.value = "Пожалуйста, выберите номинанта перед отправкой.";
    return;
  }

  message.value = "";

  if (isLastQuestion.value) {
    showQuestions.value = false; // Переход к форме отправки ответов
  } else {
    nextQuestion(); // Переход к следующему вопросу
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
        unesko: selectedValues.value["unseko"] || null,
        maya: selectedValues.value["maya"] || null,
        tekila: selectedValues.value["tekila"] || null,
        chily: selectedValues.value["chily"] || null,
        derty: selectedValues.value["derty"] || null,
      };

      await axios.post(
        "https://b5862cf2cca63d34.mokky.dev/answers",
        dataToSend
      );
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

onMounted(() => {
  fetchValidEmails();
  fetchNominees(); // Загрузить номинантов для первого вопроса
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
  /* justify-content: space-between; */
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
