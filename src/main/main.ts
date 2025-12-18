import { app, BrowserWindow, ipcMain, Menu } from "electron";
import { join } from "path";
import { installExtension, VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { Controller } from "./Controller";
import { watch } from "vue";
import { toRawDeep } from "../lib/reactive";
import electronUpdater, { type AppUpdater } from "electron-updater";
import { logger } from "./lib/logger";

/**
 * Get auto updater instance from electron-updater
 * @see https://www.electron.build/auto-update
 */
export function getAutoUpdater(): AppUpdater {
  const { autoUpdater } = electronUpdater;
  return autoUpdater;
}

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
    logger.ready("Main window is ready");

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
      logger.error(error);
      mainWindow?.webContents.send("error", error);
    });

    mainWindow!.show();

    // Check for updates after the app is ready
    getAutoUpdater().checkForUpdatesAndNotify();
  });

  ipcMain.on("store:emit", (_, { storeId, statePatch }) => {
    logger.debug("Received store:emit", storeId, statePatch);
    controller?.emitStoreChange(storeId, statePatch);
  });

  if (app.isPackaged) {
    logger.info("Loading renderer from dist...");
    mainWindow.loadFile(pathForEntry);
  } else {
    logger.debug("Installing extensions...");
    const extensions = await installExtension([VUEJS_DEVTOOLS]);
    logger.info(
      "Installed extensions:",
      extensions.map((ext) => ext.name)
    );

    if (process.env["ELECTRON_RENDERER_URL"]) {
      logger.info("Loading renderer from dev server...");
      mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
      logger.info("Loading renderer from dist...");
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
