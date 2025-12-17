import { app, BrowserWindow, ipcMain, Menu } from "electron";
import { join } from "path";
import { installExtension, VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { Controller } from "./Controller";
import consola from "consola";
import { watch } from "vue";
import { toRawDeep } from "../lib/reactive";

const pathForEntry = join(__dirname, "../renderer/index.html");

let mainWindow: BrowserWindow | null;
let controller: Controller | null;

Menu.setApplicationMenu(null);

app.whenReady().then(async () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "../preload/preload.js"),
    },
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "rgba(0,0,0,0)",
      symbolColor: "#FFFFFF",
    },
    backgroundColor: "#111111",
    minWidth: 600,
    minHeight: 300,
  });

  mainWindow.on("ready-to-show", () => {
    consola.debug("Main window is ready");

    controller = new Controller();
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
      mainWindow?.webContents.send("store:emit", {
        storeId,
        statePatch: toRawDeep(statePatch),
      });
    });

    controller.on("error", (error) => {
      consola.error(error);
      mainWindow?.webContents.send("error", error);
    });

    mainWindow!.show();
  });

  ipcMain.on("store:emit", (_, { storeId, statePatch }) => {
    consola.debug("Received store:emit", storeId, statePatch);
    controller?.emitStoreChange(storeId, statePatch);
  });

  if (app.isPackaged) {
    consola.debug("Loading renderer from dist...");
    mainWindow.loadFile(pathForEntry);
  } else {
    consola.debug("Installing extensions...");
    const extensions = await installExtension([VUEJS_DEVTOOLS]);
    consola.debug(
      "Installed extensions:",
      extensions.map((ext) => ext.name)
    );

    if (process.env["ELECTRON_RENDERER_URL"]) {
      consola.debug("Loading renderer from dev server...");
      mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
      consola.debug("Loading renderer from dist...");
      mainWindow.loadFile(pathForEntry);
    }

    mainWindow.webContents.openDevTools({
      mode: "undocked",
    });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
