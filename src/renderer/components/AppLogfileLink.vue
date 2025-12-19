<template>
  <button @click="showLogfileInFolder">Show log file</button>
</template>

<script lang="ts" setup>
function showLogfileInFolder() {
  window.showLogfileInFolder();
}
</script>

<style scoped>
button {
  appearance: none;
  cursor: pointer;
  background: none;
  border: none;
  font: unset;
  color: unset;
  padding: 0;
}
</style>
