<template>
  <div class="input-group">
    <BaseLabelledInput
      v-model="host"
      label="Host"
      type="text"
      size="15"
      placeholder="192.168.1.10"
    />
    <BaseLabelledInput
      v-model="port"
      label="Port"
      type="number"
      :min="1"
      :max="65535"
      :step="1"
    />
  </div>
  <div class="input-group">
    <BaseLabelledInput
      v-model="net"
      label="Net"
      type="number"
      :min="0"
      :max="16"
      :step="1"
    />
    <BaseLabelledInput
      v-model="subnet"
      label="Subnet"
      type="number"
      :min="0"
      :max="16"
      :step="1"
    />
    <BaseLabelledInput
      v-model="universe"
      label="Universe"
      type="number"
      :min="0"
      :max="16"
      :step="1"
    />
  </div>
  <div class="input-group">
    <BaseLabelledInput
      v-model="fps"
      label="FPS"
      type="number"
      :min="1"
      :max="44"
      :step="1"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseLabelledInput from "./BaseLabelledInput.vue";

const host = defineModel<string>("host", { required: true });
const port = defineModel<number>("port", { required: true });
const net = defineModel<number>("net", { required: true });
const subnet = defineModel<number>("subnet", { required: true });
const universe = defineModel<number>("universe", { required: true });
const fps = defineModel<number>("fps", { required: true });
</script>

<style scoped>
.input-group {
  display: flex;
  gap: 5px;
}
</style>
