<template>
  <div class="input-group">
    <BaseSelectorSwitch
      v-model="waveType"
      :options="[
        { label: 'Sine', value: 'sine' },
        { label: 'Square', value: 'square' },
        { label: 'Sawtooth', value: 'sawtooth' },
      ]"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseSelectorSwitch from "./BaseSelectorSwitch.vue";

const waveType = defineModel<"sine" | "square" | "sawtooth">("waveType", {
  required: true,
});
</script>

<style scoped>
.input-group {
  display: flex;
  gap: 5px;
}
</style>
