import { defineStore } from "pinia";
import { reactive } from "vue";

export const useConfigStore = defineStore("config", () => {
  const input = reactive({
    host: "0.0.0.0",
    port: 6454,
    net: 0,
    subnet: 0,
    universe: 0,
  });

  return {
    input,
  };
});
