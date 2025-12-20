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
  createFtdiTransmitter,
  FtdiTransmitter,
  FtdiTransmitterOptions,
  getFtdiDeviceInfo,
  listFtdiDevices,
} from "../lib/FtdiTransmitter";
import {
  createSignalGenerator,
  SignalGenerator,
} from "../lib/SignalGenerator";
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
  receiver: ArtNetReceiver | null = null;
  signalGenerator: SignalGenerator | null = null;
  transmitter: ArtNetTransmitter | FtdiTransmitter | null = null;

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
    watch(this.configStore.input, (config) => this.updateInput(config), {
      immediate: true,
    });
  }

  private async updateInput(config: ConfigStore["input"]) {
    const { type } = config;
    
    // Clean up existing input sources
    if (this.receiver) {
      this.receiver.close();
      this.receiver = null;
    }
    if (this.signalGenerator) {
      this.signalGenerator.close();
      this.signalGenerator = null;
    }

    switch (type) {
      case "artnet":
        await this.updateReceiver(config);
        break;
      case "signal":
        await this.updateSignalGenerator(config);
        break;
    }
  }

  private async updateReceiver(config: ConfigStore["input"]) {
    const { host, port, net, subnet, universe } = config;
    logger.debug("Config store changed", host, port, net, subnet, universe);

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

  private async updateSignalGenerator(config: ConfigStore["input"]) {
    const { waveType, frequency } = config;
    logger.debug("Starting signal generator...", { waveType, frequency });

    try {
      this.statusStore.input.connection = "connecting";
      this.statusStore.input.reasons.length = 0;

      const generator = await createSignalGenerator({
        waveType,
        frequency,
        fps: 30,
      });

      generator.on("update", () => {
        for (let i = 0; i < 512; i++) {
          this.dmxStore.buffer[i] = generator.buffer.data[i] ?? 0;
        }
        this.dmxStore.tick();
      });

      generator.on("error", (error) => {
        logger.error(error);
        this.emit("error", error);
      });

      this.signalGenerator = generator;
      this.statusStore.input.connection = "connected";
      logger.success("Signal generator started", { waveType, frequency });
    } catch (error) {
      logger.error(error);
      this.statusStore.input.connection = "error";
      this.statusStore.input.reasons.push(StatusReason.FAILED_TO_CONNECT);
      logger.fail("Failed to start signal generator", { waveType, frequency });
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
