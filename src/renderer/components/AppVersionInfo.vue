<template>
  <span class="version-info">
    <button @click="copyVersion">obakesan v{{ pkg.version }}</button>
    <Transition @after-enter="copied = false">
      <span v-if="copied" class="copied">Copied</span>
    </Transition>
  </span>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import pkg from "../../../package.json";

const copied = ref<boolean>(false);

function copyVersion() {
  navigator.clipboard.writeText(navigator.userAgent);
  copied.value = true;
}
</script>

<style scoped>
.version-info {
  position: relative;
}

button {
  appearance: none;
  cursor: pointer;
  background: none;
  border: none;
  font: inherit;
  color: inherit;
  padding: 0;
}

.copied {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: none;

  &.v-enter-from {
    opacity: 0;
  }

  &.v-enter-active {
    display: inline-block;
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  }

  &.v-enter-to {
    opacity: 1;
    transform: translateX(-50%) translateY(-3em);
  }

  &.v-leave-from {
    opacity: 1;
  }

  &.v-leave-active {
    display: inline-block;
    transition: opacity 0.5s ease-out;
    transform: translateX(-50%) translateY(-3em);
  }

  &.v-leave-to {
    opacity: 0;
  }
}
</style>
