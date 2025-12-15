import { app, BrowserWindow, ipcMain, Menu } from "electron";
import { join } from "path";
import { installExtension, VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { Controller } from "./Controller";
import consola from "consola";
import { toRaw, watch } from "vue";

let mainWindow: BrowserWindow | null;
let controller: Controller | null;

Menu.setApplicationMenu(null);

app.whenReady().then(async () => {
  controller = new Controller();

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "../preload/preload.js"),
    },
    titleBarStyle: "hidden",
    titleBarOverlay: true,
    backgroundColor: "#111111",
    minWidth: 600,
    minHeight: 300,
  });

  if (app.isPackaged) {
    mainWindow.loadFile("index.html");
  } else {
    const extensions = await installExtension([VUEJS_DEVTOOLS]);
    consola.debug(
      "Installed extensions:",
      extensions.map((ext) => ext.name)
    );

    if (process.env["ELECTRON_RENDERER_URL"]) {
      mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
      mainWindow.loadFile("index.html");
    }

    mainWindow.webContents.openDevTools({
      mode: "undocked",
    });
  }
  watch(
    () => controller?.configStore.input,
    (input) => {
      if (!input) return;

      mainWindow?.setTitle(
        `${input.host}:${input.port} (${input.net}/${input.subnet}/${input.universe})`
      );
    },
    { immediate: true }
  );

  controller.on("store:emit", (storeId, statePatch) => {
    consola.debug("Sending store:emit", storeId, statePatch);
    mainWindow?.webContents.send("store:emit", {
      storeId,
      statePatch: toRaw(statePatch),
    });
  });

  controller.on("error", (error) => {
    consola.error(error);
    mainWindow?.webContents.send("error", error);
  });

  ipcMain.on("store:emit", (_, { storeId, statePatch }) => {
    consola.debug("Received store:emit", storeId, statePatch);
    controller?.emitStoreChange(storeId, statePatch);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
