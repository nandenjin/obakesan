<template>
  <span class="version-info">
    <span @click="copyVersion">obakesan v{{ pkg.version }}</span>
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
  navigator.clipboard.writeText(pkg.version);
  copied.value = true;
}
</script>

<style scoped>
.version-info {
  position: relative;
  cursor: pointer;
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
