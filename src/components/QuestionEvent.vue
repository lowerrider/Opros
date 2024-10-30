<template>
  <div class="content2">
    <div class="inputSize">
      <h2 class="textTitle">{{ title }}</h2>
      <h3 class="textSubTitle">{{ subTitle }}</h3>

      <VueSelect
        class="select"
        :inputId="id"
        v-model="selected"
        :options="options"
        placeholder="Выберите номинанта из списка подтвердивших участие" />
    </div>
  </div>
</template>

<script setup>
import VueSelect from "vue3-select-component";
import { ref, computed, defineProps, watch, defineEmits } from "vue";

const props = defineProps({
  title: String,
  subTitle: String,
  id: String,
  selected: Number,
  nominees: Array,
});

const emit = defineEmits(["update:selected"]);
const selected = ref(props.selected || null); // Инициализация с текущим выбранным значением

const options = computed(() =>
  props.nominees.map((nominee) => ({
    label: nominee.title,
    value: nominee.personId,
  }))
);

// Синхронизация выбранного значения с родительским компонентом
watch(
  () => props.selected,
  (newValue) => {
    selected.value = newValue; // Обновление локального значения при изменении пропса
  },
  { immediate: true }
);

// Эмит события при изменении выбранного значения
watch(selected, (newValue) => {
  emit("update:selected", { id: props.id, value: newValue });
});
</script>

<style scoped>
.textTitle {
  margin: 20px;
}
.textSubTitle {
  margin: 30px;
}
.select {
  margin: 60px auto;
  width: 100%;
  max-width: 600px;
}
.content2 {
  display: flex;
  justify-content: center;
  text-align: center;
}
.inputSize {
  width: 70%;
  text-align: center;
}
</style>
