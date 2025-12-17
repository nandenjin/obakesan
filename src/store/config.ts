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

  const output = reactive({
    enabled: false,
    type: "artnet" as "artnet" | "ftdi",
    host: "127.0.0.1",
    port: 6454,
    net: 0,
    subnet: 0,
    universe: 0,
    fps: 30,
    deviceSerial: "",
  });

  return {
    input,
    output,
  };
});
