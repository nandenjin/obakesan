<template>
  <nav>
    <div
      class="header"
      :class="{ 'is-open': isOpen }"
      @click="isOpen = !isOpen"
    >
      <div class="indicator">
        <span class="interface-part">
          <span
            v-if="config.input.type === 'artnet'"
            class="label"
            :class="{ 'is-valid': isInputValid }"
          >
            {{ config.input.host }}:{{ config.input.port }}
            {{ config.input.net }}/{{ config.input.subnet }}/{{
              config.input.universe
            }}
            <template v-if="!isInputLost">
              @ {{ Math.round(dmx.fps) }}fps
            </template>
          </span>
          <span
            v-else-if="config.input.type === 'signal'"
            class="label"
            :class="{ 'is-valid': isInputValid }"
          >
            Signal: {{ config.input.waveType }} @ {{ config.input.frequency }}Hz
            <template v-if="!isInputLost">
              @ {{ Math.round(dmx.fps) }}fps
            </template>
          </span>
          <BaseHoverTooltip
            :content="
              getStatusMessage(
                status.input.connection,
                status.input.reasons,
                dmx.lastUpdate
              )
            "
          >
            <AppStatusBadge
              :icon="statusIconInput"
              :reasons="status.input.reasons"
            />
          </BaseHoverTooltip>
        </span>
        <span class="arrow"></span>
        <span class="interface-part">
          <template v-if="config.output.enabled">
            <span
              v-if="config.output.type === 'artnet'"
              class="label"
              :class="{ 'is-valid': isOutputValid }"
            >
              {{ config.output.host }}:{{ config.output.port }}
              {{ config.output.net }}/{{ config.output.subnet }}/{{
                config.output.universe
              }}
              @ {{ config.output.fps }}fps
            </span>
            <span
              v-else-if="config.output.type === 'ftdi'"
              class="label"
              :class="{ 'is-valid': isOutputValid }"
            >
              FTDI USB DMX @ {{ config.output.fps }}fps
            </span>
          </template>
          <span v-else>(Monitor only)</span>
          <BaseHoverTooltip
            :content="
              getStatusMessage(status.output.connection, status.output.reasons)
            "
          >
            <AppStatusBadge
              :icon="statusIconOutput"
              :reasons="status.output.reasons"
            />
          </BaseHoverTooltip>
        </span>
      </div>
      <AppLogo class="logo" :variant="logoVariant" />
    </div>
    <div class="editor" :class="{ 'is-open': isOpen }">
      <ConfigPanelSection title="Input">
        <div class="input-group">
          <BaseSelectorSwitch
            v-model="inputSelection"
            :options="[
              { label: 'Art-Net', value: 'artnet' },
              { label: 'Signal', value: 'signal' },
            ]"
          />
        </div>
        <ConfigPanelArtNetInput
          v-if="input.type === 'artnet'"
          v-model:host="input.host"
          v-model:port="input.port"
          v-model:net="input.net"
          v-model:subnet="input.subnet"
          v-model:universe="input.universe"
        />
        <ConfigPanelSignalInput
          v-else-if="input.type === 'signal'"
          v-model:wave-type="input.waveType"
          v-model:frequency="input.frequency"
        />
      </ConfigPanelSection>

      <ConfigPanelSection title="Output">
        <div class="input-group">
          <BaseSelectorSwitch
            v-model="outputSelection"
            :options="[
              { label: 'Off', value: 'off' },
              { label: 'Art-Net', value: 'artnet' },
              { label: 'FTDI USB', value: 'ftdi' },
            ]"
          />
        </div>
        <template v-if="output.enabled">
          <ConfigPanelFtdiOutput
            v-if="output.type === 'ftdi'"
            v-model:device-serial="output.deviceSerial"
            v-model:fps="output.fps"
            :ftdi-devices="status.ftdiDevices"
          />
          <ConfigPanelArtNetOutput
            v-else-if="output.type === 'artnet'"
            v-model:host="output.host"
            v-model:port="output.port"
            v-model:net="output.net"
            v-model:subnet="output.subnet"
            v-model:universe="output.universe"
            v-model:fps="output.fps"
          />
        </template>
      </ConfigPanelSection>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useConfigStore } from "../../store/config";
import AppLogo from "./AppLogo.vue";
import AppStatusBadge from "./AppStatusBadge.vue";
import {
  ConnectionStatus,
  StatusReason,
  useStatusStore,
} from "../../store/status";
import BaseHoverTooltip from "./BaseHoverTooltip.vue";
import { useDmxStore } from "../../store/dmx";
import BaseSelectorSwitch from "./BaseSelectorSwitch.vue";
import ConfigPanelSection from "./ConfigPanelSection.vue";
import ConfigPanelArtNetInput from "./ConfigPanelArtNetInput.vue";
import ConfigPanelSignalInput from "./ConfigPanelSignalInput.vue";
import ConfigPanelArtNetOutput from "./ConfigPanelArtNetOutput.vue";
import ConfigPanelFtdiOutput from "./ConfigPanelFtdiOutput.vue";

const isOpen = defineModel<boolean>("open");

const config = useConfigStore();
const status = useStatusStore();
const dmx = useDmxStore();

const input = reactive<typeof config.input>({
  type: "artnet",
  host: "",
  port: 0,
  net: 0,
  subnet: 0,
  universe: 0,
  waveType: "sine",
  frequency: 1,
});

const output = reactive<typeof config.output>({
  enabled: false,
  type: "artnet",
  host: "",
  port: 0,
  net: 0,
  subnet: 0,
  universe: 0,
  fps: 0,
  deviceSerial: "",
});

const logoVariant = computed(() => {
  const isError =
    status.input.connection === "error" || status.output.connection === "error";
  if (isError) {
    return "shock";
  }

  if (status.input.connection === "connected" && isInputLost.value) {
    return "question";
  }

  return "default";
});

const statusIconInput = computed(() => {
  switch (status.input.connection) {
    case "error":
      return "failed";
    case "connecting":
      return "in-progress";
    case "connected":
      if (isInputLost.value) {
        return "in-progress";
      }
      return "connected";
    case "idle":
      return "default";
    default:
      return undefined;
  }
});

const statusIconOutput = computed(() => {
  switch (status.output.connection) {
    case "error":
      return "failed";
    case "connecting":
      return "in-progress";
    case "connected":
      return "connected";
    case "idle":
      return "default";
    default:
      return "default";
  }
});

const isInputValid = computed(
  () => !status.input.reasons.includes(StatusReason.INVALID_CONFIG)
);
const isOutputValid = computed(
  () =>
    !status.output.reasons.includes(StatusReason.INVALID_CONFIG) &&
    !status.output.reasons.includes(StatusReason.DEVICE_UNAVAILABLE)
);

const outputSelection = computed({
  get() {
    if (!output.enabled) {
      return "off";
    }
    return output.type;
  },
  set(value) {
    if (value === "off") {
      output.enabled = false;
      return;
    } else {
      output.enabled = true;
      output.type = value as "artnet" | "ftdi";
    }
  },
});

const inputSelection = computed({
  get() {
    return input.type;
  },
  set(value) {
    input.type = value as "artnet" | "signal";
  },
});

function getStatusMessage(
  connection: ConnectionStatus,
  reasons: StatusReason[],
  lastUpdate?: number
) {
  for (const reason of reasons) {
    switch (reason) {
      case StatusReason.INVALID_CONFIG:
        return "Invalid configuration";
      case StatusReason.FAILED_TO_CONNECT:
        return "Failed to connect";
      case StatusReason.DEVICE_UNAVAILABLE:
        return "Device unavailable";
    }
  }

  switch (connection) {
    case "connecting":
      return "Connecting...";
    case "connected":
      if (typeof lastUpdate === "number" && isInputLost.value) {
        return "Connected but no data received";
      }
      return "Connected and transferring data";
    case "idle":
      return null;
    case "error":
      return "Unknown error";
    default:
      return null;
  }
}

const isInputLost = computed(() => dmx.lastUpdate < now.value - 1000);

function setConfig() {
  config.input.type = input.type;
  config.input.host = input.host;
  config.input.port = input.port;
  config.input.net = input.net;
  config.input.subnet = input.subnet;
  config.input.universe = input.universe;
  config.input.waveType = input.waveType;
  config.input.frequency = input.frequency;

  config.output.enabled = output.enabled;
  config.output.type = output.type;
  config.output.host = output.host;
  config.output.port = output.port;
  config.output.net = output.net;
  config.output.subnet = output.subnet;
  config.output.universe = output.universe;
  config.output.fps = output.fps;
  config.output.deviceSerial = output.deviceSerial;
}

watch(
  () => isOpen.value,
  (newOpen) => {
    if (!newOpen) {
      setConfig();
    }
  }
);

watch(
  config.input,
  (newInput) => {
    input.type = newInput.type;
    input.host = newInput.host;
    input.port = newInput.port;
    input.net = newInput.net;
    input.subnet = newInput.subnet;
    input.universe = newInput.universe;
    input.waveType = newInput.waveType;
    input.frequency = newInput.frequency;
  },
  { immediate: true }
);

watch(
  config.output,
  (newOutput) => {
    output.enabled = newOutput.enabled;
    output.host = newOutput.host;
    output.port = newOutput.port;
    output.net = newOutput.net;
    output.subnet = newOutput.subnet;
    output.universe = newOutput.universe;
    output.fps = newOutput.fps;
    output.deviceSerial = newOutput.deviceSerial;
  },
  { immediate: true }
);

const now = ref<number>(Date.now());
const nowTimer = ref<ReturnType<typeof setInterval>>();
onMounted(() => {
  nowTimer.value = setInterval(() => {
    now.value = Date.now();
  }, 500);
});
onUnmounted(() => {
  clearInterval(nowTimer.value);
});
</script>

<style scoped>
.header {
  position: relative;
  font-size: 12px;
  cursor: pointer;
  padding: 20px;
  transition: opacity 0.15s ease-out;
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }

  &.is-open {
    opacity: 1;
  }

  .indicator {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-content: center;
    gap: 30px;

    .interface-part {
      display: flex;
      gap: 10px;

      .label {
        &:not(.is-valid) {
          text-decoration: line-through;
        }
      }
    }
  }

  .arrow {
    position: relative;
    &::before,
    &::after {
      content: "";
      display: block;
    }

    &::before {
      position: absolute;
      top: 0;
      bottom: 0;
      margin: auto;
      width: 100%;
      height: 1px;
      background-color: white;
    }

    &::after {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 5px;
      height: 5px;
      border: 1px solid;
      border-color: var(--color-primary) var(--color-primary) transparent
        transparent;
      transform: translateY(50%) rotate(45deg) translateY(50%);
      transform-origin: right bottom;
    }
  }

  .logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
  }
}

.editor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 5px;
  height: 0;
  overflow-y: hidden;
  transition: height 0.15s ease-out, margin-top 0.15s ease-out;
  padding: 0 20px;

  &.is-open {
    height: fit-content;
    margin-top: 5px;
    padding-bottom: 20px;
  }
}

.input-group {
  display: flex;
  gap: 5px;
}
</style>
