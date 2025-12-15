import { defineStore } from "pinia";
import { ref } from "vue";

export const useDmxStore = defineStore("dmx", () => {
  const buffer = ref<number[]>(new Array(512).fill(0));
  const lastUpdate = ref<number>(0);

  return {
    buffer,
    lastUpdate,
  };
});
