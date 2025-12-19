import { contextBridge, ipcRenderer } from "electron/renderer";
import consola from "consola";

const logger = consola.withTag("preload");

window.addEventListener("message", (event) => {
  logger.debug("Received message", event);
  switch (event.data.type) {
    case "renderer:store:emit": {
      ipcRenderer.send("store:emit", {
        storeId: event.data.storeId,
        statePatch: event.data.statePatch,
      });
      break;
    }
  }
});

ipcRenderer.on("store:emit", (_, { storeId, statePatch }) => {
  logger.debug("Received store:emit");
  window.postMessage(
    {
      type: "preload:store:emit",
      storeId,
      statePatch,
    },
    location.origin
  );
});

const showLogfileInFolder = () => ipcRenderer.invoke("show-logfile-in-folder");
export type { showLogfileInFolder };
contextBridge.exposeInMainWorld("showLogfileInFolder", showLogfileInFolder);
