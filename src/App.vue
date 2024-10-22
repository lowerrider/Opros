<script setup>
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const goToQuestions = () => {
  router.push("/questions");
};
</script>

<template>
  <div class="content">
    <div class="snowflakes">
      <div
        class="snowflake"
        style="left: 10%; animation-duration: 5s; animation-delay: 0s"></div>
      <div
        class="snowflake"
        style="left: 30%; animation-duration: 7s; animation-delay: 1s"></div>
      <div
        class="snowflake"
        style="left: 50%; animation-duration: 6s; animation-delay: 2s"></div>
      <div
        class="snowflake"
        style="left: 70%; animation-duration: 5s; animation-delay: 3s"></div>
      <div
        class="snowflake"
        style="left: 90%; animation-duration: 8s; animation-delay: 4s"></div>
    </div>
    <div class="tree"></div>

    <router-view></router-view>

    <button v-if="route.name !== 'Questions'" @click="goToQuestions">
      Перейти к вопросам
    </button>
  </div>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; /* Занимает всю высоту окна */
}
</style>
