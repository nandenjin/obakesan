<template>
  <div class="input-group">
    <BaseLabelledInput v-model="host" label="Host" type="text" size="20" />
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
      v-model="oscPath"
      label="OSC Path"
      type="text"
      size="30"
      placeholder="/dmx"
    />
  </div>
  <div class="input-group">
    <BaseLabelledInput
      v-model="fps"
      label="FPS"
      type="number"
      :min="1"
      :max="120"
      :step="1"
    />
  </div>
  <div class="note">
    <small>OSC output sends whole DMX universe (512 channels) as binary blob</small>
  </div>
</template>

<script lang="ts" setup>
import BaseLabelledInput from "./BaseLabelledInput.vue";

const host = defineModel<string>("host", { required: true });
const port = defineModel<number>("port", { required: true });
const oscPath = defineModel<string>("oscPath", { required: true });
const fps = defineModel<number>("fps", { required: true });
</script>

<style scoped>
.input-group {
  display: flex;
  gap: 5px;
}
.note {
  margin-top: 5px;
  opacity: 0.7;
}
</style>
