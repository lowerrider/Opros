<script setup>
import VueSelect from "vue3-select-component";
import axios from "axios";
import { ref, onMounted, computed, defineEmits, watch } from "vue";

const props = defineProps({
  title: String,
  subTitle: String,
  id: String,
  selected: Number,
});

const emit = defineEmits(["update:selected"]);

const selected = ref("");
const items = ref([]);
const passwordMap = ref({}); // Для хранения паролей пользователей

const fetchItems = async () => {
  try {
    const { data } = await axios.get(
      "https://b5862cf2cca63d34.mokky.dev/members"
    );
    items.value = data;
    passwordMap.value = data.reduce((acc, member) => {
      acc[member.email] = member.password; // Сохраняем пароль по email
      return acc;
    }, {});
  } catch (e) {
    console.error("Ошибка при получении данных:", e);
  }
};

const options = computed(() =>
  items.value.map((e) => ({
    label: e.title,
    value: e.personId,
  }))
);

watch(
  () => props.selected,
  (newValue) => {
    selected.value = newValue;
  },
  { immediate: true }
);

watch(selected, (newValue) => {
  emit("update:selected", { id: props.id, value: newValue });
});

onMounted(fetchItems);
</script>

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
        placeholder="Выберите победителя" />
    </div>
  </div>
</template>

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
