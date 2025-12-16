<template>
  <div
    class="app"
    :class="{
      'config-panel-open': configPanelOpen,
      [`is-platform-${platform}`]: true,
    }"
  >
    <div class="title-bar"></div>
    <div class="scroll-area">
      <header>
        <ConfigPanel v-model:open="configPanelOpen" class="config-panel" />
      </header>

      <main @click="configPanelOpen = false">
        <DmxMonitor class="dmx-monitor" />
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import ConfigPanel from "./components/ConfigPanel.vue";
import DmxMonitor from "./components/DmxMonitor.vue";
import { platform } from "./util";

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
  overflow: hidden;
  user-select: none;
}
</style>

<style scoped>
.app {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 15px;
  width: 100vw;
  height: 100vh;

  &.config-panel-open {
    header {
      background: var(--color-background);
    }

    .dmx-monitor {
      opacity: 0.3;
      pointer-events: none;
    }
  }
}

.scroll-area {
  position: relative;
  overflow-y: auto;

  scrollbar-color: color-mix(in srgb, var(--color-primary) 50%, transparent)
    transparent;
}

.title-bar {
  height: env(titlebar-area-height, 20px);
  -webkit-app-region: drag;
}

header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background: linear-gradient(
    to bottom,
    var(--color-background) 85%,
    transparent
  );
}

.dmx-monitor {
  transition: opacity 0.15s ease-out;
  margin: 15px;
}
</style>
