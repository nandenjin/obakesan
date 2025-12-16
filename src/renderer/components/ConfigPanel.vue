<template>
  <nav>
    <div
      class="header"
      :class="{ 'is-open': isOpen }"
      @click="isOpen = !isOpen"
    >
      <div class="indicator">
        <span>
          {{ config.input.host }}:{{ config.input.port }}
          {{ config.input.net }}/{{ config.input.subnet }}/{{
            config.input.universe
          }}
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
        <span>No output</span>
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
        <div class="title"><span>Output</span></div>
        <div class="content"></div>
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

const logoVariant = computed(() => {
  if (status.input.connection === "error") {
    return "shock";
  }
  if (isInputLost(dmx.lastUpdate)) {
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
    default:
      return undefined;
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
  () => config.input,
  (newInput) => {
    input.host = newInput.host;
    input.port = newInput.port;
    input.net = newInput.net;
    input.subnet = newInput.subnet;
    input.universe = newInput.universe;
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
    gap: 50px;
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
  &:has(+ .input-group) {
    margin-bottom: 5px;
  }
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
}
</style>
