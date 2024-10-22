<template>
  <div class="center">
    <h1 class="mainText">Опрос на новый год от Mega-Personal!</h1>
  </div>
</template>

<script setup></script>

<style scoped>
.center {
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.button_main {
  margin: 20px auto;
  margin-bottom: 40px;
  width: 260px;
  height: 60px;
  border: 2px solid #ffffff;
  font-size: 20px;
  font-weight: 400;
  border-radius: 35px;
  cursor: pointer;
  background-color: transparent;
  color: #ffffff;
  transition: all 2s ease;
}

.button_main:hover {
  color: #ffffff;
  border-color: gray;
  background-color: rgba(235, 235, 235, 0.64);
  transform: scale(1.1);
  transition: all 2s ease;
}
</style>
