import { defineStore } from "pinia";
import { ref } from "vue";

export const useDmxStore = defineStore("dmx", () => {
  const state = ref(0);
  const buffer = ref<Uint8ClampedArray>(new Uint8ClampedArray(512));
  const lastUpdate = ref<number>(0);

  return {
    state,
    buffer,
    lastUpdate,
  };
});
