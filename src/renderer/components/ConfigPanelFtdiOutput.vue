<template>
  <div class="input-group">
    <select
      v-model="deviceSerial"
      class="select-input"
      :disabled="ftdiDevices.length === 0"
    >
      <option v-if="ftdiDevices.length === 0" value="">
        (No FTDI devices found)
      </option>
      <option
        v-for="device in ftdiDevices"
        :key="device.serialNumber"
        :value="device.serialNumber"
      >
        {{ device.description }} ({{ device.serialNumber }})
      </option>
    </select>
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

// Define the shape of the device object locally or import it if available
// In ConfigPanel.vue it was `status.output.ftdiDevices`
interface FtdiDevice {
  serialNumber: string;
  description: string;
}

defineProps<{
  ftdiDevices: FtdiDevice[];
}>();

const deviceSerial = defineModel<string>("deviceSerial", { required: true });
const fps = defineModel<number>("fps", { required: true });
</script>

<style scoped>
.input-group {
  display: flex;
  gap: 5px;
}

.select-input {
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 5px;
  width: 100%;
  outline: none;
  font: inherit;

  option {
    background: #333;
    color: white;
  }
}
</style>
