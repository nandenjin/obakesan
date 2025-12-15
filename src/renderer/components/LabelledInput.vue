<template>
  <label>
    <span class="text">{{ props.label }}</span>
    <input v-bind="$attrs" v-model="modelValue" />
  </label>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: string;
}>();

const modelValue = defineModel<number | string>();
</script>
<style scoped>
input {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  outline: none;
  background: transparent;
  color: white;
  font-size: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  font: inherit;
  padding: 0 5px;

  &::-webkit-inner-spin-button {
    display: none;
  }
}

label {
  display: flex;
  height: 20px;
  line-height: 20px;

  &:has(input:focus) {
    .text {
      background-color: rgba(255, 255, 255, 0.8);
      color: #000;
    }
  }
}

.text {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0 5px;
}
</style>
