import { defineStore } from "pinia";
import { reactive } from "vue";

export const useConfigStore = defineStore("config", () => {
  const input = reactive({
    type: "artnet" as "artnet" | "osc",
    host: "0.0.0.0",
    port: 6454,
    net: 0,
    subnet: 0,
    universe: 0,
    // OSC-specific settings
    oscPath: "/dmx/:channel",
    oscStartChannel: 1,
    oscLength: 512,
    oscDataType: "int" as "int" | "float" | "blob",
  });

  const output = reactive({
    enabled: false,
    type: "artnet" as "artnet" | "ftdi" | "osc",
    host: "127.0.0.1",
    port: 6454,
    net: 0,
    subnet: 0,
    universe: 0,
    fps: 30,
    deviceSerial: "",
    // OSC-specific settings
    oscPath: "/dmx/:channel",
    oscStartChannel: 1,
    oscLength: 512,
    oscDataType: "int" as "int" | "float" | "blob",
  });

  return {
    input,
    output,
  };
});
