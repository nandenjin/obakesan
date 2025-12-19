import { createPinia } from "pinia";
import { useConfigStore } from "../store/config";
import { useDmxStore } from "../store/dmx";
import { EventEmitter } from "node:events";
import { createPiniaRemoteSync, PiniaRemoteSync } from "../lib/PiniaRemoteSync";
import { SS } from "../store";
import { createApp, watch } from "vue";
import { DmxFrame } from "../lib/DmxFrame";
import {
  ArtNetReceiver,
  ArtNetReceiverConnectOptions,
  createArtNetReceiver,
  ArtNetTransmitter,
  createArtNetTransmitter,
  ArtNetTransmitterOptions,
} from "../lib/artnet";
import {
  validateHost,
  validatePort,
  validateUniverse,
} from "../lib/artnet/validation";
import {
  OscReceiver,
  OscReceiverConnectOptions,
  createOscReceiver,
  OscTransmitter,
  OscTransmitterOptions,
  createOscTransmitter,
  validatePath,
  validateChannelRange,
} from "../lib/osc";
import {
  createFtdiTransmitter,
  FtdiTransmitter,
  FtdiTransmitterOptions,
  getFtdiDeviceInfo,
  listFtdiDevices,
} from "../lib/FtdiTransmitter";
import { StatusReason, useStatusStore } from "../store/status";
import { logger as baseLogger } from "./lib/logger";

const logger = baseLogger.withTag("Controller");

type ControllerEvent = {
  "store:emit": <K extends keyof SS>(
    storeId: K,
    statePatch: Partial<SS[K]>
  ) => void;
  error: (error: Error) => void;
};

type ConfigStore = ReturnType<typeof useConfigStore>;

export class Controller extends EventEmitter {
  pinia = createPinia();
  configStore: ReturnType<typeof useConfigStore>;
  dmxStore: ReturnType<typeof useDmxStore>;
  statusStore: ReturnType<typeof useStatusStore>;
  relay: PiniaRemoteSync;
  vue = createApp({});
  receiver: ArtNetReceiver | OscReceiver | null = null;
  transmitter: ArtNetTransmitter | FtdiTransmitter | OscTransmitter | null =
    null;

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
    this.setupTransmitter();
    this.setupDeviceScanner();

    // Sync DMX buffer to transmitter
    watch(
      () => this.dmxStore.lastUpdate,
      () => {
        if (this.transmitter) {
          this.transmitter.buffer.set(this.dmxStore.buffer);
        }
      }
    );
  }

  setupReceiver() {
    watch(this.configStore.input, (config) => this.updateReceiver(config), {
      immediate: true,
    });
  }

  private async updateReceiver(config: ConfigStore["input"]) {
    const { type, host, port } = config;
    logger.debug("Config store changed", type, host, port);
    if (this.receiver) {
      logger.debug("Shutting down previous receiver...");
      this.receiver.close();
      this.receiver = null; // Ensure receiver is cleared
    }

    if (type === "artnet") {
      const { net, subnet, universe } = config;
      if (
        !validateHost(host) ||
        !validatePort(port) ||
        !validateUniverse(net, subnet, universe)
      ) {
        logger.info("Stopping receiver due to invalid config");
        this.statusStore.input.connection = "idle";
        this.statusStore.input.reasons = [StatusReason.INVALID_CONFIG];
        return;
      }
      await this.connectArtNetReceiver(config);
    } else if (type === "osc") {
      const { oscPath, oscStartChannel, oscLength } = config;
      if (
        !validateHost(host) ||
        !validatePort(port) ||
        !validatePath(oscPath) ||
        !validateChannelRange(oscStartChannel, oscLength)
      ) {
        logger.info("Stopping OSC receiver due to invalid config");
        this.statusStore.input.connection = "idle";
        this.statusStore.input.reasons = [StatusReason.INVALID_CONFIG];
        return;
      }
      await this.connectOscReceiver(config);
    }
  }

  private async connectArtNetReceiver(config: ConfigStore["input"]) {
    const { host, port, net, subnet, universe } = config;
    const options: ArtNetReceiverConnectOptions = {
      bindHost: host,
      port,
      net,
      subnet,
      universe,
    };

    logger.debug("Starting receiver...", options);
    try {
      this.statusStore.input.connection = "connecting";
      this.statusStore.input.reasons.length = 0;

      const receiver = await createArtNetReceiver(options);

      receiver.on("update", () => {
        for (let i = 0; i < 512; i++) {
          this.dmxStore.buffer[i] = receiver.buffer.data[i] ?? 0;
        }
        this.dmxStore.tick();
      });

      receiver.on("error", (error) => {
        logger.error(error);
        this.emit("error", error);
      });

      this.receiver = receiver;
      this.statusStore.input.connection = "connected";
      logger.success("Receiver started", options);
    } catch (error) {
      logger.error(error);
      this.statusStore.input.connection = "error";
      this.statusStore.input.reasons.push(StatusReason.FAILED_TO_CONNECT);
      logger.fail("Failed to start receiver", options);
    }
  }

  private async connectOscReceiver(config: ConfigStore["input"]) {
    const {
      host,
      port,
      oscPath,
      oscStartChannel,
      oscLength,
      oscDataType,
    } = config;
    const options: OscReceiverConnectOptions = {
      bindHost: host,
      port,
      path: oscPath,
      startChannel: oscStartChannel,
      length: oscLength,
      dataType: oscDataType,
    };

    logger.debug("Starting OSC receiver...", options);
    try {
      this.statusStore.input.connection = "connecting";
      this.statusStore.input.reasons.length = 0;

      const receiver = await createOscReceiver(options);

      receiver.on("update", () => {
        for (let i = 0; i < 512; i++) {
          this.dmxStore.buffer[i] = receiver.buffer.data[i] ?? 0;
        }
        this.dmxStore.tick();
      });

      receiver.on("error", (error) => {
        logger.error(error);
        this.emit("error", error);
      });

      this.receiver = receiver;
      this.statusStore.input.connection = "connected";
      logger.success("OSC receiver started", options);
    } catch (error) {
      logger.error(error);
      this.statusStore.input.connection = "error";
      this.statusStore.input.reasons.push(StatusReason.FAILED_TO_CONNECT);
      logger.fail("Failed to start OSC receiver", options);
    }
  }

  setupDeviceScanner() {
    // Scan for FTDI devices every 3 seconds
    setInterval(async () => {
      try {
        const devices = await listFtdiDevices();
        this.statusStore.ftdiDevices = devices.map((d) => ({
          serialNumber: d.serial_number || "",
          description: d.description || "",
        }));
      } catch {
        // Silent error
      }
    }, 3000);
  }

  setupTransmitter() {
    watch(this.configStore.output, (config) => this.updateTransmitter(config), {
      immediate: true,
    });
  }

  /**
   * Update transmitter with given config. Existing transmitter will be closed or reconnected.
   * @param config
   */
  private async updateTransmitter(config: ConfigStore["output"]) {
    const { enabled, type } = config;
    logger.debug("Updating transmitter config...");

    // Close existing transmitter
    if (this.transmitter) {
      logger.debug("Closing transmitter...");
      await this.transmitter.close();
      this.transmitter = null;
      logger.success("Previous transmitter is successfully closed");
    }

    if (!enabled) {
      logger.info("Transmitter disabled");
      this.statusStore.output.connection = "idle";
      this.statusStore.output.reasons = [StatusReason.DISABLED];
      return;
    }

    switch (type) {
      case "artnet": {
        await this.connectArtNetTransmitter(config);
        break;
      }
      case "ftdi": {
        await this.connectFtdiTransmitter(config);
        break;
      }
      case "osc": {
        await this.connectOscTransmitter(config);
        break;
      }
    }
  }

  /**
   * Connect ArtNet transmitter with given config. Existing transmitter will be closed or reconnected.
   * @param config
   */
  private async connectArtNetTransmitter(config: ConfigStore["output"]) {
    const { host, port, net, subnet, universe, fps } = config;
    if (
      !validateHost(host) ||
      !validatePort(port) ||
      !validateUniverse(net, subnet, universe)
    ) {
      logger.info("ArtNetTransmitter is stopped due to invalid config");
      this.statusStore.output.connection = "idle";
      this.statusStore.output.reasons = [StatusReason.INVALID_CONFIG];
      return;
    }

    const options: ArtNetTransmitterOptions = {
      host,
      port,
      net,
      subnet,
      universe,
      fps,
    };

    logger.debug("Starting ArtNet transmitter...", options, `FPS: ${fps}`);
    this.statusStore.output.connection = "connecting";
    this.statusStore.output.reasons = [];

    try {
      this.transmitter = await createArtNetTransmitter(options);
      this.statusStore.output.connection = "connected";

      logger.success("ArtNetTransmitter started", options, `FPS: ${fps}`);

      // Sync buffer immediately
      this.transmitter.send(new DmxFrame().set(this.dmxStore.buffer));
    } catch (error) {
      logger.error("Failed to start transmitter", error);
      this.statusStore.output.connection = "error";
      this.statusStore.output.reasons = [StatusReason.FAILED_TO_CONNECT];
      logger.fail("ArtNetTransmitter failed to start", options, `FPS: ${fps}`);
    }
  }

  /**
   * Connect FTDI USB transmitter with given config. Existing transmitter will be closed or reconnected.
   * @param config
   */
  private async connectFtdiTransmitter(config: ConfigStore["output"]) {
    const { deviceSerial, fps } = config;
    const deviceInfo = await getFtdiDeviceInfo(deviceSerial);
    if (!deviceInfo) {
      logger.info("FTDITransmitter is stopped due to invalid config");
      this.statusStore.output.connection = "idle";
      this.statusStore.output.reasons = [StatusReason.DEVICE_UNAVAILABLE];
      return;
    }

    const options: FtdiTransmitterOptions = {
      fps,
      deviceInfo,
    };

    logger.debug("Starting FTDI transmitter...", options);
    this.statusStore.output.connection = "connecting";
    this.statusStore.output.reasons = [];

    try {
      this.transmitter = await createFtdiTransmitter(options);
      this.statusStore.output.connection = "connected";

      // Sync buffer immediately
      this.transmitter.send(new DmxFrame().set(this.dmxStore.buffer));
      logger.success(
        "FTDITransmitter is successfully started",
        options,
        `FPS: ${fps}`
      );
    } catch (error) {
      logger.fail("FTDITransmitter is failed to start", error);
      this.statusStore.output.connection = "error";
      this.statusStore.output.reasons = [StatusReason.FAILED_TO_CONNECT];
    }
  }

  /**
   * Connect OSC transmitter with given config. Existing transmitter will be closed or reconnected.
   * @param config
   */
  private async connectOscTransmitter(config: ConfigStore["output"]) {
    const {
      host,
      port,
      oscPath,
      oscStartChannel,
      oscLength,
      oscDataType,
      fps,
    } = config;
    if (
      !validateHost(host) ||
      !validatePort(port) ||
      !validatePath(oscPath) ||
      !validateChannelRange(oscStartChannel, oscLength)
    ) {
      logger.info("OSC transmitter is stopped due to invalid config");
      this.statusStore.output.connection = "idle";
      this.statusStore.output.reasons = [StatusReason.INVALID_CONFIG];
      return;
    }

    const options: OscTransmitterOptions = {
      host,
      port,
      path: oscPath,
      startChannel: oscStartChannel,
      length: oscLength,
      dataType: oscDataType,
      fps,
    };

    logger.debug("Starting OSC transmitter...", options, `FPS: ${fps}`);
    this.statusStore.output.connection = "connecting";
    this.statusStore.output.reasons = [];

    try {
      this.transmitter = await createOscTransmitter(options);
      this.statusStore.output.connection = "connected";

      logger.success("OSC transmitter started", options, `FPS: ${fps}`);

      // Sync buffer immediately
      this.transmitter.send(new DmxFrame().set(this.dmxStore.buffer));
    } catch (error) {
      logger.error("Failed to start OSC transmitter", error);
      this.statusStore.output.connection = "error";
      this.statusStore.output.reasons = [StatusReason.FAILED_TO_CONNECT];
      logger.fail("OSC transmitter failed to start", options, `FPS: ${fps}`);
    }
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
