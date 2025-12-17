import { createApp, toRaw } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import { createPiniaRemoteSync } from "../lib/PiniaRemoteSync";
import consola from "consola";

const logger = consola.withTag("renderer");

const app = createApp(App);

const pinia = createPinia();

const piniaRemoteSync = createPiniaRemoteSync();
piniaRemoteSync.subscribe((store) => {
  window.postMessage(
    {
      type: "renderer:store:emit",
      storeId: store.$id,
      statePatch: toRaw(store.$state),
    },
    "*"
  );
});
window.addEventListener("message", (event) => {
  switch (event.data.type) {
    case "preload:store:emit":
      logger.debug("Received preload:store:emit", event.data);
      piniaRemoteSync.emitByRemote(event.data.storeId, event.data.statePatch);
      break;
  }
});
pinia.use(piniaRemoteSync.getPlugin());

app.use(pinia);

app.mount("#app");
