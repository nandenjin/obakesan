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
      placeholder="/dmx/:channel"
    />
  </div>
  <div class="input-group">
    <BaseLabelledInput
      v-model="oscStartChannel"
      label="Start Ch"
      type="number"
      :min="1"
      :max="512"
      :step="1"
    />
    <BaseLabelledInput
      v-model="oscLength"
      label="Length"
      type="number"
      :min="1"
      :max="512"
      :step="1"
    />
    <BaseSelectorSwitch
      v-model="oscDataType"
      :options="[
        { label: 'Int', value: 'int' },
        { label: 'Float', value: 'float' },
        { label: 'Blob', value: 'blob' },
      ]"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseLabelledInput from "./BaseLabelledInput.vue";
import BaseSelectorSwitch from "./BaseSelectorSwitch.vue";

const host = defineModel<string>("host", { required: true });
const port = defineModel<number>("port", { required: true });
const oscPath = defineModel<string>("oscPath", { required: true });
const oscStartChannel = defineModel<number>("oscStartChannel", {
  required: true,
});
const oscLength = defineModel<number>("oscLength", { required: true });
const oscDataType = defineModel<"int" | "float" | "blob">("oscDataType", {
  required: true,
});
</script>

<style scoped>
.input-group {
  display: flex;
  gap: 5px;
}
</style>
