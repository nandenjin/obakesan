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
  <div class="input-group">
    <BaseLabelledInput
      v-model="frequency"
      label="Frequency (Hz)"
      type="number"
      :min="0.1"
      :max="100"
      :step="0.1"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseLabelledInput from "./BaseLabelledInput.vue";
import BaseSelectorSwitch from "./BaseSelectorSwitch.vue";

const waveType = defineModel<"sine" | "square" | "sawtooth">("waveType", {
  required: true,
});
const frequency = defineModel<number>("frequency", { required: true });
</script>

<style scoped>
.input-group {
  display: flex;
  gap: 5px;
}
</style>
