import * as osc from "osc-min";
import type { OscArgInput } from "osc-min";
import { DmxFrame } from "../DmxFrame";
import { OscDevice } from "./OscDevice";

export interface OscTransmitterOptions {
  /**
   * Destination IP address
   * @default "127.0.0.1"
   */
  host?: string;

  /**
   * Destination Port
   * @default 8000
   */
  port?: number;

  /**
   * OSC address path pattern
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
   * Number of channels to transmit
   * @default 512 (whole universe)
   */
  length?: number;

  /**
   * Data type to send in OSC messages
   * @default "int"
   */
  dataType?: "int" | "float" | "blob";

  /**
   * Local interface to bind to
   */
  bindHost?: string;

  /**
   * Transmission FPS (Frames Per Second)
   * @default 30
   */
  fps?: number;
}

/**
 * OscTransmitter
 * Sends DMX data via OSC messages
 */
export class OscTransmitter {
  host: string = "127.0.0.1";
  port: number = 8000;
  path: string = "/dmx/:channel";
  startChannel: number = 1;
  length: number = 512;
  dataType: "int" | "float" | "blob" = "int";

  /**
   * Internal DMX buffer
   */
  readonly buffer: DmxFrame = new DmxFrame();

  private socketKey: string | null = null;
  private isConnected: boolean = false;
  private interval: NodeJS.Timeout | null = null;
  private fps: number = 30;

  constructor(options?: OscTransmitterOptions) {
    if (options) {
      this.configure(options);
    }
  }

  configure(options: OscTransmitterOptions) {
    this.host = options.host ?? this.host;
    this.port = options.port ?? this.port;
    this.path = options.path ?? this.path;
    this.startChannel = options.startChannel ?? this.startChannel;
    this.length = options.length ?? this.length;
    this.dataType = options.dataType ?? this.dataType;
    if (options.fps !== undefined) {
      this.setFPS(options.fps);
    }
  }

  setFPS(fps: number) {
    this.fps = fps;
    if (this.interval) {
      this.startTimer();
    }
  }

  getFPS(): number {
    return this.fps;
  }

  private startTimer() {
    this.stopTimer();
    if (this.fps > 0) {
      const intervalMs = 1000 / this.fps;
      this.interval = setInterval(() => {
        if (this.isConnected) {
          this.transmit();
        }
      }, intervalMs);
    }
  }

  private stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Initialize the socket connection
   */
  async connect(options?: { bindHost?: string; bindPort?: number }) {
    const bindHost = options?.bindHost ?? "0.0.0.0";
    const bindPort = options?.bindPort ?? 0; // Use random port for sender

    const device = OscDevice.getInstance();
    this.socketKey = await device.bind(bindHost, bindPort);
    this.isConnected = true;
    this.startTimer();
  }

  /**
   * Send DMX frame
   * @param frame Optional frame to update buffer with before sending
   */
  send(frame?: DmxFrame) {
    if (frame) {
      this.buffer.copy(frame);
    }
  }

  /**
   * Transmit current buffer via OSC
   */
  private transmit() {
    if (!this.isConnected || !this.socketKey) return;

    const device = OscDevice.getInstance();

    // Check if path uses channel placeholder
    if (this.path.includes(":channel")) {
      // Send individual channel messages
      for (let i = 0; i < this.length; i++) {
        const channel = this.startChannel + i;
        if (channel > 512) break;

        const value = this.buffer.data[channel - 1];
        if (value !== undefined) {
          const address = this.path.replace(":channel", channel.toString());
          const oscValue = this.createOscValue(value);
          const msg = osc.toBuffer({
            address,
            args: [oscValue],
          });
          const buffer = this.dataViewToBuffer(msg);
          device.send(this.socketKey, buffer, this.host, this.port);
        }
      }
    } else {
      // Send whole universe or range as single message
      this.transmitUniverseMessage(device);
    }
  }

  private transmitUniverseMessage(device: OscDevice) {
    if (this.dataType === "blob") {
      // Send as blob
      const data = Buffer.alloc(this.length);
      for (let i = 0; i < this.length; i++) {
        const channel = this.startChannel + i;
        if (channel <= 512) {
          data[i] = this.buffer.data[channel - 1] ?? 0;
        }
      }
      const msg = osc.toBuffer({
        address: this.path,
        args: [{ type: "blob", value: data }],
      });
      const buffer = this.dataViewToBuffer(msg);
      device.send(this.socketKey!, buffer, this.host, this.port);
    } else {
      // Send as array of int/float values
      const args: OscArgInput[] = [];
      for (let i = 0; i < this.length; i++) {
        const channel = this.startChannel + i;
        if (channel <= 512) {
          const value = this.buffer.data[channel - 1] ?? 0;
          args.push(this.createOscValue(value));
        }
      }
      const msg = osc.toBuffer({
        address: this.path,
        args,
      });
      const buffer = this.dataViewToBuffer(msg);
      device.send(this.socketKey!, buffer, this.host, this.port);
    }
  }

  /**
   * Helper method to convert DataView to Buffer
   */
  private dataViewToBuffer(dataView: DataView): Buffer {
    return Buffer.from(
      dataView.buffer,
      dataView.byteOffset,
      dataView.byteLength
    );
  }

  private createOscValue(value: number): OscArgInput {
    if (this.dataType === "float") {
      // Convert 0-255 to 0.0-1.0
      return { type: "float", value: value / 255.0 };
    } else {
      // Integer (default)
      return { type: "integer", value: Math.round(value) };
    }
  }

  close() {
    this.stopTimer();
    this.socketKey = null;
    this.isConnected = false;
  }
}

/**
 * Create and connect an OSC transmitter
 */
export async function createOscTransmitter(
  options?: OscTransmitterOptions
): Promise<OscTransmitter> {
  const transmitter = new OscTransmitter(options);
  await transmitter.connect({ bindHost: options?.bindHost });
  return transmitter;
}
