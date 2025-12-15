import vue from "@vitejs/plugin-vue";

export default {
  main: {
    build: {
      lib: {
        entry: "./src/main/main.ts",
      },
      rollupOptions: {
        external: ["ftdi-d2xx"],
      },
    },
  },
  preload: {
    build: {
      lib: {
        entry: "./src/preload/preload.ts",
      },
    },
  },
  renderer: {
    plugins: [vue()],
  },
};
