<template>
  <nav>
    <div
      class="header"
      :class="{ 'is-open': isOpen }"
      @click="isOpen = !isOpen"
    >
      <div class="indicator">
        <span class="interface-part">
          <span>
            {{ config.input.host }}:{{ config.input.port }}
            {{ config.input.net }}/{{ config.input.subnet }}/{{
              config.input.universe
            }}
          </span>
          <HoverTooltip
            :content="
              getStatusMessage(
                status.input.connection,
                status.input.reasons,
                dmx.lastUpdate
              )
            "
          >
            <StatusBadge
              :icon="statusIconInput"
              :reasons="status.input.reasons"
            />
          </HoverTooltip>
        </span>
        <span class="arrow"></span>
        <span class="interface-part">
          <span v-if="config.output.enabled">
            {{ config.output.host }}:{{ config.output.port }}
            {{ config.output.net }}/{{ config.output.subnet }}/{{
              config.output.universe
            }}
            @ {{ config.output.fps }}fps
          </span>
          <span v-else>(Monitor only)</span>
          <HoverTooltip
            :content="
              getStatusMessage(status.output.connection, status.output.reasons)
            "
          >
            <StatusBadge
              :icon="statusIconOutput"
              :reasons="status.output.reasons"
            />
          </HoverTooltip>
        </span>
      </div>
      <ProductLogo class="logo" :variant="logoVariant" />
    </div>
    <div class="editor" :class="{ 'is-open': isOpen }">
      <div class="editor-group">
        <div class="title"><span>Input</span></div>
        <div class="content">
          <div class="input-group">
            <LabelledInput
              v-model="input.host"
              label="Host"
              type="text"
              size="20"
            />
            <LabelledInput
              v-model="input.port"
              label="Port"
              type="number"
              :min="1"
              :max="65535"
              :step="1"
            />
          </div>
          <div class="input-group">
            <LabelledInput
              v-model="input.net"
              label="Net"
              type="number"
              :min="0"
              :max="16"
              :step="1"
            />
            <LabelledInput
              v-model="input.subnet"
              label="Subnet"
              type="number"
              :min="0"
              :max="16"
              :step="1"
            />
            <LabelledInput
              v-model="input.universe"
              label="Universe"
              type="number"
              :min="0"
              :max="16"
              :step="1"
            />
          </div>
        </div>
      </div>

      <div class="editor-group">
        <div class="title">
          <label>
            <input v-model="output.enabled" type="checkbox" />
            <span>Output</span>
          </label>
        </div>
        <div class="content">
          <div class="input-group">
            <LabelledInput
              v-model="output.host"
              label="Host"
              type="text"
              size="15"
              placeholder="192.168.1.10"
            />
            <LabelledInput
              v-model="output.port"
              label="Port"
              type="number"
              :min="1"
              :max="65535"
              :step="1"
            />
          </div>
          <div class="input-group">
            <LabelledInput
              v-model="output.net"
              label="Net"
              type="number"
              :min="0"
              :max="16"
              :step="1"
            />
            <LabelledInput
              v-model="output.subnet"
              label="Subnet"
              type="number"
              :min="0"
              :max="16"
              :step="1"
            />
            <LabelledInput
              v-model="output.universe"
              label="Universe"
              type="number"
              :min="0"
              :max="16"
              :step="1"
            />
          </div>
          <div class="input-group">
            <LabelledInput
              v-model="output.fps"
              label="FPS"
              type="number"
              :min="1"
              :max="44"
              :step="1"
            />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useConfigStore } from "../../store/config";
import LabelledInput from "./LabelledInput.vue";
import ProductLogo from "./ProductLogo.vue";
import StatusBadge from "./StatusBadge.vue";
import {
  ConnectionStatus,
  StatusReason,
  useStatusStore,
} from "../../store/status";
import HoverTooltip from "./HoverTooltip.vue";
import { useDmxStore } from "../../store/dmx";

const isOpen = defineModel<boolean>("open");

const config = useConfigStore();
const status = useStatusStore();
const dmx = useDmxStore();

const input = reactive({
  host: "",
  port: 0,
  net: 0,
  subnet: 0,
  universe: 0,
});

const output = reactive({
  enabled: false,
  host: "",
  port: 0,
  net: 0,
  subnet: 0,
  universe: 0,
  fps: 0,
});

const logoVariant = computed(() => {
  const isError =
    status.input.connection === "error" || status.output.connection === "error";
  if (isError) {
    return "shock";
  }

  if (status.input.connection === "idle" && isInputLost(dmx.lastUpdate)) {
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
      if (isInputLost(dmx.lastUpdate)) {
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

function getStatusMessage(
  connection: ConnectionStatus,
  reasons: StatusReason[],
  lastUpdate?: number
) {
  switch (connection) {
    case "connecting":
      return "Connecting...";
    case "connected":
      if (typeof lastUpdate === "number" && isInputLost(lastUpdate)) {
        return "Connected but no data received";
      }
      return "Connected and transferring data";
    case "error": {
      if (reasons.length === 0) {
        return null;
      }

      const code = reasons[0];

      switch (code) {
        case StatusReason.FAILED_TO_CONNECT:
          return "Failed to connect";
        default:
          return "Unknown error";
      }
    }
    case "idle": {
      if (reasons.includes(StatusReason.INVALID_CONFIG)) {
        return "Invalid configuration";
      }
      return null;
    }
    default:
      return null;
  }
}

function isInputLost(lastUpdate: number) {
  return lastUpdate < now.value - 1000;
}

function setConfig() {
  config.input.host = input.host;
  config.input.port = input.port;
  config.input.net = input.net;
  config.input.subnet = input.subnet;
  config.input.universe = input.universe;

  config.output.enabled = output.enabled;
  config.output.host = output.host;
  config.output.port = output.port;
  config.output.net = output.net;
  config.output.subnet = output.subnet;
  config.output.universe = output.universe;
  config.output.fps = output.fps;
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
    input.host = newInput.host;
    input.port = newInput.port;
    input.net = newInput.net;
    input.subnet = newInput.subnet;
    input.universe = newInput.universe;
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
  }
}

.input-group {
  display: flex;
  gap: 5px;
}

.editor-group {
  display: grid;
  grid-template-columns: minmax(70px, auto) 1fr;
  gap: 5px;

  & > .title {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 10px;
  }

  & > .content {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}
</style>
