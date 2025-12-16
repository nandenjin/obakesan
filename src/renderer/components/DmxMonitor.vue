<template>
  <div
    class="dmx-monitor"
    :class="{ 'size-mini': containerWidth < breakpointW }"
  >
    <div class="table">
      <div></div>
      <div class="header-top">
        <div v-for="i in numColumn" :key="i" class="cell">+{{ i - 1 }}</div>
      </div>
      <div class="header-left">
        <div v-for="i in Math.ceil(512 / numColumn)" :key="i" class="cell">
          {{ (i - 1) * numColumn + 1 }}
        </div>
      </div>
      <div ref="body" class="body">
        <div
          v-for="ch in 512"
          :key="ch"
          class="channel"
          :class="{ 'is-active': dmxStore.buffer[ch - 1] > 0 }"
        >
          <span class="value">{{ dmxStore.buffer[ch - 1] }}</span>
          <span
            class="gauge"
            :style="{
              transform: `scaleY(${
                Math.floor((dmxStore.buffer[ch - 1] / 255) * 20) / 20
              })`,
            }"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import { useDmxStore } from "../../store/dmx";
import consola from "consola";

const logger = consola.withTag("DmxMonitor");

const body = useTemplateRef("body");

const dmxStore = useDmxStore();
const containerWidth = ref<number>(800);

const breakpointW = 800;
const cellSize = computed(() => (containerWidth.value < breakpointW ? 30 : 40));
const cellGap = computed(() => (containerWidth.value < breakpointW ? 3 : 4));
const numColumn = computed(() =>
  Math.floor(containerWidth.value / (cellSize.value + cellGap.value))
);

const onResize = () => {
  if (!body.value) {
    logger.warn("Ref for root body is not found");
    return;
  }
  const bounding = body.value.getBoundingClientRect();
  containerWidth.value = bounding.width;
};

onMounted(() => {
  window.addEventListener("resize", onResize);
  onResize();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});
</script>

<style scoped>
.dmx-monitor {
  --cell-size: 40px;
  --cell-gap: 4px;
  --cell-font-size: 13px;

  &.size-mini {
    --cell-size: 30px;
    --cell-gap: 3px;
    --cell-font-size: 10px;
  }

  .table {
    &,
    .header-top,
    .header-left,
    .body {
      display: grid;
      gap: var(--cell-gap);
    }

    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr;
    user-select: none;
    font-size: var(--cell-font-size);

    .header-top,
    .body {
      grid-template-columns: repeat(auto-fit, minmax(var(--cell-size), 1fr));
    }

    .header-top,
    .header-left {
      color: #888;
    }

    .header-top .cell {
      text-align: center;
    }

    .header-left .cell,
    .channel {
      height: var(--cell-size);
      line-height: var(--cell-size);
    }

    .header-left .cell {
      text-align: right;
    }

    .channel {
      position: relative;
      background-color: #222;
      text-align: center;
      border-radius: 5px;

      .value {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: block;
        height: var(--cell-size);
        margin: auto;
        z-index: 1;
      }

      .gauge {
        will-change: transform;
        display: block;
        width: 100%;
        height: 100%;
        background-color: #666;
        transform-origin: bottom center;
      }

      &:not(.is-active) {
        .value {
          color: #888;
        }
      }
    }
  }
}
</style>
