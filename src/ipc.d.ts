import { SS } from "./store";

type IpcEvents = {
  "store:emit": [
    {
      storeId: keyof SS;
      statePatch: Partial<SS[keyof SS]>;
    }
  ];
};

type IpcRequests = {
  "show-logfile-in-folder": () => void;
};

declare module "electron/main" {
  namespace Electron {
    interface IpcMain {
      on<E extends keyof IpcEvents>(
        channel: E,
        listener: (event: IpcMainEvent, ...args: IpcEvents[E]) => void
      ): this;

      send<E extends keyof IpcEvents>(channel: E, ...args: IpcEvents[E]): this;

      handle<R extends keyof IpcRequests>(
        channel: R,
        listener: (
          event: IpcMainInvokeEvent,
          ...args: Parameters<IpcRequests[R]>
        ) => Promise<ReturnType<IpcRequests[R]>> | ReturnType<IpcRequests[R]>
      ): void;

      handleOnce<R extends keyof IpcRequests>(
        channel: R,
        listener: (
          event: IpcMainInvokeEvent,
          ...args: Parameters<IpcRequests[R]>
        ) => Promise<ReturnType<IpcRequests[R]>> | ReturnType<IpcRequests[R]>
      ): void;

      removeHandler(channel: keyof IpcRequests): void;
    }
  }

  declare module "electron/renderer" {
    namespace Electron {
      interface IpcRenderer {
        on<E extends keyof IpcEvents>(
          channel: E,
          listener: (event: IpcRendererEvent, ...args: IpcEvents[E]) => void
        ): this;

        send<E extends keyof IpcEvents>(
          channel: E,
          ...args: IpcEvents[E]
        ): this;

        invoke<R extends keyof IpcRequests>(
          channel: R,
          ...args: Parameters<IpcRequests[R]>
        ): Promise<ReturnType<IpcRequests[R]>>;
      }

      interface WebContents {
        send<E extends keyof IpcEvents>(
          channel: E,
          ...args: IpcEvents[E]
        ): this;
      }
    }
  }
}
