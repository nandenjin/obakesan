import { defineStore } from "pinia";
import { computed, ref } from "vue";

const TS_BUFFER_SIZE = 30;

export const useDmxStore = defineStore("dmx", () => {
  const buffer = ref<number[]>(new Array(512).fill(0));

  const cursor = ref(0);
  const timestamps = ref<number[]>(new Array(TS_BUFFER_SIZE).fill(0));

  function tick() {
    timestamps.value[cursor.value] = Date.now();
    cursor.value = (cursor.value + 1) % TS_BUFFER_SIZE;
  }

  const lastUpdate = computed(() => {
    return timestamps.value[
      (cursor.value - 1 + TS_BUFFER_SIZE) % TS_BUFFER_SIZE
    ];
  });

  const fps = computed(() => {
    let sum = 0;
    for (let i = 0; i < TS_BUFFER_SIZE - 1; i++) {
      const idx = (cursor.value + i) % TS_BUFFER_SIZE;
      const diff =
        timestamps.value[(idx + 1) % TS_BUFFER_SIZE] - timestamps.value[idx];
      sum += diff;
    }
    const frameTime = sum / (TS_BUFFER_SIZE - 1);
    if (frameTime === 0 || frameTime > 1000) {
      return 0;
    }
    return 1000 / frameTime;
  });

  return {
    buffer,
    lastUpdate,
    timestamps,
    cursor,
    tick,
    fps,
  };
});
