<template>
  <div class="selector-switch">
    <label
      v-for="option in options"
      :key="option.value"
      :for="`selector-switch_${componentId}_${option.value}`"
    >
      <input
        :id="`selector-switch_${componentId}_${option.value}`"
        v-model="modelValue"
        :name="`selector-switch_${componentId}`"
        type="radio"
        :value="option.value"
      />
      <span>{{ option.label }}</span>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance } from "vue";

defineProps<{
  options: { label: string; value: string }[];
}>();
const modelValue = defineModel<string>();
const componentId = getCurrentInstance()?.uid || "noId";
</script>

<style scoped>
.selector-switch {
  display: inline-flex;
}

label {
  display: block;
  background-color: color-mix(
    in srgb,
    var(--color-background) 70%,
    var(--color-primary) 30%
  );
  color: var(--color-primary);
  padding: 2px 4px;

  &:has(input:checked) {
    background-color: var(--color-primary);
    color: var(--color-background);
  }
}

input {
  display: none;
}
</style>
