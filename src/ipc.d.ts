import { SS } from "./store";

type IpcEvents = {
  "store:emit": [
    {
      storeId: keyof SS;
      statePatch: Partial<SS[keyof SS]>;
    }
  ];
};

declare module "electron" {
  namespace Electron {
    interface IpcMain {
      on<E extends keyof IpcEvents>(
        channel: E,
        listener: (event: IpcMainEvent, ...args: IpcEvents[E]) => void
      ): this;

      send<E extends keyof IpcEvents>(channel: E, ...args: IpcEvents[E]): this;
    }

    interface IpcRenderer {
      on<E extends keyof IpcEvents>(
        channel: E,
        listener: (event: IpcRendererEvent, ...args: IpcEvents[E]) => void
      ): this;

      send<E extends keyof IpcEvents>(channel: E, ...args: IpcEvents[E]): this;
    }

    interface WebContents {
      send<E extends keyof IpcEvents>(channel: E, ...args: IpcEvents[E]): this;
    }
  }
}
