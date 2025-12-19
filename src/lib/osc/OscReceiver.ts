import { EventEmitter } from "node:events";
import * as osc from "osc-min";
import type { OscArgOutputOrArray } from "osc-min";
import { DmxFrame } from "../DmxFrame";
import { OscDevice } from "./OscDevice";

export interface OscReceiverOptions {
  /**
   * OSC address path pattern to listen for
   * Supports placeholders: :channel for channel number
   * @default "/dmx/:channel"
   * @example "/0/dmx/:channel"
   * @example "/dmx/universe/0/:channel"
   */
  path?: string;

  /**
   * Start channel (1-based)
   * @default 1
   */
  startChannel?: number;

  /**
   * Number of channels to receive
   * @default 512 (whole universe)
   */
  length?: number;

  /**
   * Data type to expect in OSC messages
   * @default "int"
   */
  dataType?: "int" | "float" | "blob";
}

export interface OscReceiverConnectOptions extends OscReceiverOptions {
  bindHost?: string;
  port?: number;
}

interface OscReceiverEvents {
  update: () => void;
  error: (error: Error) => void;
}

/**
 * OscReceiver
 * Receives DMX data via OSC messages
 */
export class OscReceiver extends EventEmitter {
  path: string = "/dmx/:channel";
  startChannel: number = 1;
  length: number = 512;
  dataType: "int" | "float" | "blob" = "int";

  /**
   * DMX data buffer
   */
  readonly buffer: DmxFrame = new DmxFrame();

  private socketKey: string | null = null;
  private isConnected: boolean = false;
  private pathRegex: RegExp | null = null;

  constructor(options?: OscReceiverOptions) {
    super();
    if (options) {
      this.path = options.path ?? this.path;
      this.startChannel = options.startChannel ?? this.startChannel;
      this.length = options.length ?? this.length;
      this.dataType = options.dataType ?? this.dataType;
    }
    this.updatePathRegex();
  }

  private updatePathRegex() {
    // Convert path pattern to regex
    // Example: "/dmx/:channel" -> /^\/dmx\/(\d+)$/
    const pattern = this.path
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape special chars
      .replace(/:channel/g, "(\\d+)"); // Replace :channel with number capture
    this.pathRegex = new RegExp(`^${pattern}$`);
  }

  /**
   * Connect to OSC receiver. If already connected, disconnects first.
   * @param options OSC receiver options
   */
  async connect(options: OscReceiverConnectOptions): Promise<void> {
    if (this.isConnected) {
      this.close();
    }

    this.path = options.path ?? this.path;
    this.startChannel = options.startChannel ?? this.startChannel;
    this.length = options.length ?? this.length;
    this.dataType = options.dataType ?? this.dataType;
    this.updatePathRegex();

    const host = options.bindHost ?? "0.0.0.0";
    const port = options.port ?? 8000;

    try {
      const device = OscDevice.getInstance();
      this.socketKey = await device.bind(host, port);
      const socket = device.getSocket(this.socketKey);

      if (!socket) {
        throw new Error("Failed to create socket");
      }

      socket.on("message", (msg) => {
        this.handleMessage(msg);
      });

      this.isConnected = true;
    } catch (error) {
      this.emit("error", error as Error);
      throw error;
    }
  }

  /**
   * Handle incoming OSC message
   * @internal
   */
  private handleMessage(msg: Buffer) {
    try {
      const oscMsg = osc.fromBuffer(msg);

      // Handle single message
      if ("address" in oscMsg && "args" in oscMsg) {
        this.processOscMessage(oscMsg.address, oscMsg.args);
      }
      // Handle bundle (multiple messages)
      else if ("elements" in oscMsg) {
        for (const element of oscMsg.elements) {
          if ("address" in element && "args" in element) {
            this.processOscMessage(element.address, element.args);
          }
        }
      }
    } catch (error) {
      this.emit("error", error as Error);
    }
  }

  private processOscMessage(
    address: string,
    args: OscArgOutputOrArray[]
  ) {
    if (!this.pathRegex) return;

    // Check if path uses channel placeholder
    if (this.path.includes(":channel")) {
      const match = address.match(this.pathRegex);
      if (match && match[1]) {
        const channel = parseInt(match[1], 10);
        if (channel >= 1 && channel <= 512) {
          const value = this.extractValue(args);
          if (value !== null) {
            this.buffer.set(channel, value);
            this.emit("update");
          }
        }
      }
    } else {
      // Whole universe or range transfer
      if (address === this.path) {
        this.handleUniverseMessage(args);
      }
    }
  }

  private handleUniverseMessage(args: OscArgOutputOrArray[]) {
    if (this.dataType === "blob") {
      // Extract blob data
      for (const arg of args) {
        if (arg.type === "blob") {
          const data = arg.value; // DataView
          for (let i = 0; i < Math.min(this.length, data.byteLength); i++) {
            const channel = this.startChannel + i;
            if (channel <= 512) {
              this.buffer.set(channel, data.getUint8(i));
            }
          }
          this.emit("update");
          break;
        }
      }
    } else {
      // Extract array of int/float values
      let channelIndex = 0;
      for (const arg of args) {
        const value = this.extractValue([arg]);
        if (value !== null && channelIndex < this.length) {
          const channel = this.startChannel + channelIndex;
          if (channel <= 512) {
            this.buffer.set(channel, value);
            channelIndex++;
          }
        }
      }
      if (channelIndex > 0) {
        this.emit("update");
      }
    }
  }

  private extractValue(args: OscArgOutputOrArray[]): number | null {
    if (args.length === 0) return null;

    const arg = args[0];
    if (arg.type === "integer") {
      return Math.max(0, Math.min(255, arg.value));
    } else if (arg.type === "float") {
      // Assume float is 0.0-1.0 range, convert to 0-255
      const floatVal = Math.max(0, Math.min(1, arg.value));
      return Math.round(floatVal * 255);
    }
    return null;
  }

  on<K extends keyof OscReceiverEvents>(
    eventName: K,
    listener: OscReceiverEvents[K]
  ): this {
    return super.on(eventName, listener);
  }

  once<K extends keyof OscReceiverEvents>(
    eventName: K,
    listener: OscReceiverEvents[K]
  ): this {
    return super.once(eventName, listener);
  }

  emit<K extends keyof OscReceiverEvents>(
    eventName: K,
    ...args: Parameters<OscReceiverEvents[K]>
  ): boolean {
    return super.emit(eventName as string, ...args);
  }

  off<K extends keyof OscReceiverEvents>(
    eventName: K,
    listener: OscReceiverEvents[K]
  ): this {
    return super.off(eventName, listener);
  }

  close() {
    if (this.socketKey && this.isConnected) {
      const device = OscDevice.getInstance();
      const socket = device.getSocket(this.socketKey);
      if (socket) {
        socket.removeAllListeners("message");
      }
      this.isConnected = false;
      this.socketKey = null;
    }
  }
}

/**
 * Create an OSC receiver
 */
export async function createOscReceiver(
  options?: OscReceiverConnectOptions
): Promise<OscReceiver> {
  const receiver = new OscReceiver();
  if (options) {
    await receiver.connect(options);
  }
  return receiver;
}
