import vue from "@vitejs/plugin-vue";
import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: "./src/main/main.ts",
      },
      externalizeDeps: {
        include: ["ftdi-d2xx"],
      },
    },
  },
  preload: {
    build: {
      lib: {
        entry: "./src/preload/preload.ts",
      },
      externalizeDeps: {
        exclude: ["consola"],
      },
    },
  },
  renderer: {
    plugins: [vue()],
  },
});
