import { createPinia } from "pinia";
import { useConfigStore } from "../store/config";
import { useDmxStore } from "../store/dmx";
import { EventEmitter } from "node:events";
import { createPiniaRemoteSync, PiniaRemoteSync } from "../lib/PiniaRemoteSync";
import { SS } from "../store";
import { createApp, watch } from "vue";
import {
  ArtNetReceiver,
  ArtNetReceiverConnectOptions,
  createArtNetReceiver,
} from "../lib/ArtNetReceiver";
import consola from "consola";
import { StatusReason, useStatusStore } from "../store/status";

const logger = consola.withTag("Controller");

type ControllerEvent = {
  "store:emit": <K extends keyof SS>(
    storeId: K,
    statePatch: Partial<SS[K]>
  ) => void;
  error: (error: Error) => void;
};

export class Controller extends EventEmitter {
  pinia = createPinia();
  configStore: ReturnType<typeof useConfigStore>;
  dmxStore: ReturnType<typeof useDmxStore>;
  statusStore: ReturnType<typeof useStatusStore>;
  relay: PiniaRemoteSync;
  vue = createApp({});
  receiver: ArtNetReceiver | null = null;

  constructor() {
    super();

    const relay = createPiniaRemoteSync();
    relay.subscribe((store) => {
      this.emit("store:emit", store.$id as keyof SS, store.$state);
    });
    this.pinia.use(relay.getPlugin());
    this.relay = relay;
    this.vue.use(this.pinia);

    const configStore = useConfigStore(this.pinia);
    this.configStore = configStore;
    const dmxStore = useDmxStore(this.pinia);
    this.dmxStore = dmxStore;
    const statusStore = useStatusStore(this.pinia);
    this.statusStore = statusStore;

    this.setupReceiver();
  }

  setupReceiver() {
    watch(
      this.configStore.input,
      async ({ host, port, net, subnet, universe }) => {
        logger.log("Config store changed", host, port, net, subnet, universe);
        if (this.receiver) {
          logger.log("Shutting down previous receiver...");
          this.receiver.destroy();
        }

        const options: ArtNetReceiverConnectOptions = {
          host,
          port,
          net,
          subnet,
          universe,
        };

        logger.log("Starting receiver...", options);
        try {
          this.statusStore.input.connection = "connecting";
          this.statusStore.input.reasons.clear();

          const receiver = await createArtNetReceiver(options);

          receiver.on("update", () => {
            for (let i = 0; i < 512; i++) {
              this.dmxStore.buffer[i] = receiver.buffer.data[i] ?? 0;
            }
            this.dmxStore.lastUpdate = Date.now();
          });

          receiver.on("error", (error) => {
            logger.error(error);
            this.emit("error", error);
          });

          this.receiver = receiver;
          this.statusStore.input.connection = "connected";
        } catch (error) {
          logger.error(error);
          this.statusStore.input.connection = "error";
          this.statusStore.input.reasons.add(StatusReason.FAILED_TO_CONNECT);
        }
      },
      {
        immediate: true,
      }
    );
  }

  emitStoreChange<K extends keyof SS>(storeId: K, statePatch: Partial<SS[K]>) {
    this.relay.emitByRemote(storeId, statePatch);
  }

  on<K extends keyof ControllerEvent>(
    event: K,
    listener: ControllerEvent[K]
  ): this {
    return super.on(event, listener);
  }

  emit<K extends keyof ControllerEvent>(
    event: K,
    ...args: Parameters<ControllerEvent[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
}
