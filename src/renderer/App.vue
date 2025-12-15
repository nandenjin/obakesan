<template>
  <div class="app" :class="{ 'config-panel-open': configPanelOpen }">
    <header></header>
    <ConfigPanel v-model:open="configPanelOpen" />
    <div @click="configPanelOpen = false">
      <DmxMonitor class="dmx-monitor" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import ConfigPanel from "./components/ConfigPanel.vue";
import DmxMonitor from "./components/DmxMonitor.vue";

const configPanelOpen = ref<boolean>(false);
</script>

<style>
:root {
  interpolate-size: allow-keywords;
  --color-background: #000;
  --color-primary: #fff;
}

html,
body {
  background-color: var(--color-background);
  color: var(--color-primary);
  font: normal 11px monospace;
  margin: 0;
}
</style>

<style scoped>
.app {
  display: grid;
  grid-template-rows: 30px auto 1fr;
  gap: 15px;

  &.config-panel-open {
    max-height: calc(100vh - 30px);
    overflow-y: hidden;

    .dmx-monitor {
      opacity: 0.3;
      pointer-events: none;
    }
  }
}

header {
  -webkit-app-region: drag;
}

.dmx-monitor {
  transition: opacity 0.15s ease-out;
  margin: 0 15px;
}
</style>
