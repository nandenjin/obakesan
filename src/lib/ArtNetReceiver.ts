import { EventEmitter } from "node:events";
import { createSocket, RemoteInfo, Socket } from "node:dgram";
import { DmxFrame } from "./DmxFrame";

const ARTNET_HEADER = "Art-Net\0";

/**
 * Art-Net protocol opcodes
 */
enum ArtNetOpcode {
  OP_POLL = 0x2000,
  OP_POLL_REPLY = 0x2100,
  OP_DATA = 0x5000,
}

interface ArtNetReceiverClientOptions {
  /**
   * Host to bind to
   * @default "0.0.0.0"
   */
  host?: string;
  /**
   * Port to bind to
   * @default 6454
   */
  port?: number;
  /**
   * Short name of the device
   * @default "lightingkit"
   */
  shortName?: string;
  /**
   * Long name of the device
   * @default "Lightingkit: ArtNetReceiverClient"
   */
  longName?: string;
}

interface ArtNetReceiverClientEvents {
  data: (
    net: number,
    subnet: number,
    universe: number,
    sequence: number,
    data: DmxFrame
  ) => void;
  poll: (rinfo: RemoteInfo) => void;
  pollreply: (address: string) => void;
  listening: () => void;
  close: () => void;
  error: (error: Error) => void;
}

/**
 * Art-Net receiver socket
 * @internal
 */
class ArtNetReceiverClient extends EventEmitter {
  /**
   * Socket to receive Art-Net packets
   */
  listener: Socket | null = null;
  host: string;
  port: number;
  /**
   * Short name of the device
   * @default "lightingkit"
   */
  shortName: string;
  /**
   * Long name of the device
   * @default "Lightingkit: ArtNetReceiverClient"
   */
  longName: string;
  receivers: Set<ArtNetReceiver> = new Set();

  constructor(options?: ArtNetReceiverClientOptions) {
    super();
    this.host = options?.host ?? "0.0.0.0";
    this.port = options?.port ?? 6454;
    this.shortName = options?.shortName ?? "lightingkit";
    this.longName = options?.longName ?? "Lightingkit: ArtNetReceiverClient";
  }

  /**
   * Parse Art-Net packet and emit events
   * @param msg Art-Net packet
   * @param rinfo Remote info
   */
  parseMessage(msg: Buffer<ArrayBufferLike>, rinfo: RemoteInfo) {
    if (msg.length < 12) {
      return;
    }
    const header = msg.subarray(0, 8);
    if (header.toString() !== ARTNET_HEADER) {
      return;
    }

    const protocolVersion = msg.readUint16BE(10);
    if (protocolVersion !== 14) {
      return;
    }

    const opcode = msg.readUint16LE(8);
    switch (opcode) {
      case ArtNetOpcode.OP_POLL: {
        this.emit("poll", rinfo);
        this.sendPollReply(rinfo);
        break;
      }

      case ArtNetOpcode.OP_DATA: {
        const subuni = msg.readUint8(14);
        const subnet = (subuni >> 4) & 0x0f;
        const universe = subuni & 0x0f;

        const net = msg.readUint8(15);

        const sequence = msg.readUint8(12);
        const length = msg.readUint16BE(16);
        const data = Array.from(msg.subarray(18, 18 + length));
        const frame = new DmxFrame().set(data);
        this.emit("data", net, subnet, universe, sequence, frame);
        break;
      }
    }
  }

  private sendPollReply(rinfo: RemoteInfo) {
    if (!this.listener) {
      return;
    }

    const reply = Buffer.alloc(239);
    // ID
    reply.write(ARTNET_HEADER, 0);
    // OpCode
    reply.writeUInt16LE(ArtNetOpcode.OP_POLL_REPLY, 8);
    // IP Address
    const ip = this.host;
    if (ip.match(/\d+\.\d+\.\d+\.\d+/)) {
      const [ip0, ip1, ip2, ip3] = ip.split(".").map((v) => parseInt(v));
      reply.writeUInt8(ip0, 10);
      reply.writeUInt8(ip1, 11);
      reply.writeUInt8(ip2, 12);
      reply.writeUInt8(ip3, 13);
    }
    // Port
    reply.writeUInt16LE(this.port, 14);
    // VersInfo
    reply.writeUInt16BE(0x0100, 16);
    // NetSwitch
    reply.writeUInt8(0, 18);
    // SubSwitch
    reply.writeUInt8(0, 19);
    // Oem
    reply.writeUInt16BE(0x00ff, 20); // OemUnknown
    // UbeaVersion
    reply.writeUInt8(0, 22);
    // Status1
    reply.writeUInt8(0x00, 23); // Normal
    // EstaMan
    reply.writeUInt16LE(0, 24);
    // ShortName
    reply.write(this.shortName, 26);
    // LongName
    reply.write(this.longName, 44);
    // NodeReport
    reply.write("Working fine!", 108);
    // NumPorts (Hi=0, Lo=4)
    reply.writeUInt16BE(4, 172);
    // PortTypes
    // 0x80 = Output from network (Can output DMX512)
    const PORT_TYPE = 0x80; // Output
    reply.writeUInt8(PORT_TYPE, 174);
    reply.writeUInt8(PORT_TYPE, 175);
    reply.writeUInt8(PORT_TYPE, 176);
    reply.writeUInt8(PORT_TYPE, 177);
    // GoodInput
    reply.writeUInt8(0, 178);
    reply.writeUInt8(0, 179);
    // GoodOutput
    reply.writeUInt8(0, 182);
    reply.writeUInt8(0, 183);
    // SwIn
    reply.writeUInt8(0, 186);
    // SwOut
    reply.writeUInt8(0, 190);
    // SwVideo
    reply.writeUInt8(0, 194);
    // SwMacro
    reply.writeUInt8(0, 195);
    // SwRemote
    reply.writeUInt8(0, 196);
    // Spare
    reply.writeUInt8(0, 197);
    // Style (StNode=0x00)
    reply.writeUInt8(0x00, 200);
    // Mac
    const mac = "00:00:00:00:00:00";
    const macBytes = mac.split(":").map((v) => parseInt(v, 16));
    macBytes.forEach((byte, i) => reply.writeUInt8(byte, 201 + i));

    this.listener.send(reply, this.port, rinfo.address);
    this.emit("pollreply", rinfo.address);
  }

  async registerReceiver(receiver: ArtNetReceiver) {
    if (this.receivers.size === 0) {
      await this.openListener();
    }
    this.receivers.add(receiver);
  }

  unregisterReceiver(receiver: ArtNetReceiver) {
    this.receivers.delete(receiver);
    if (this.receivers.size === 0) {
      this.closeListener();
    }
  }

  async openListener() {
    const listener = createSocket({ type: "udp4", reuseAddr: true });

    this.listener = listener;
    return new Promise<void>((resolve, reject) => {
      const onListining = () => {
        listener.on("error", (e) => {
          console.error(e);
          listener.off("error", onError);
          listener.close();
          if (this.listener === listener) {
            this.listener = null;
          }
          this.emit("error", e);
        });
        listener.on("message", (msg, rinfo) => {
          this.parseMessage(msg, rinfo);
        });
        this.emit("listening");
        resolve();
      };
      const onError = (e: Error) => {
        listener.off("listening", onListining);
        listener.close();
        if (this.listener === listener) {
          this.listener = null;
        }
        reject(e);
      };

      listener.once("listening", onListining);
      listener.once("error", onError);
      listener.bind(this.port, this.host);
    });
  }

  closeListener() {
    if (!this.listener) {
      return;
    }
    this.listener.close();
    this.listener = null;
    this.emit("close");
  }

  on<K extends keyof ArtNetReceiverClientEvents>(
    eventName: K,
    listener: ArtNetReceiverClientEvents[K]
  ): this {
    return super.on(eventName, listener);
  }

  once<K extends keyof ArtNetReceiverClientEvents>(
    eventName: K,
    listener: ArtNetReceiverClientEvents[K]
  ): this {
    return super.once(eventName, listener);
  }

  off<K extends keyof ArtNetReceiverClientEvents>(
    eventName: K,
    listener: ArtNetReceiverClientEvents[K]
  ): this {
    return super.off(eventName, listener);
  }

  emit<K extends keyof ArtNetReceiverClientEvents>(
    eventName: K,
    ...args: Parameters<ArtNetReceiverClientEvents[K]>
  ): boolean {
    return super.emit(eventName as string, ...args);
  }
}

/**
 * Options for ArtNetReceiver
 * @example
 * ```typescript
 * const receiver = createArtNetReceiver({
 *   host: "0.0.0.0",
 *   port: 6454,
 *   net: 0,
 *   subnet: 0,
 *   universe: 0,
 * });
 * receiver.on("update", () => {
 *   const dmxData = receiver.buffer;
 *   console.log(dmxData);
 * });
 * ```
 */
export interface ArtNetReceiverOptions {
  /**
   * Net address  of the receiver
   * @default 0
   */
  net?: number;
  /**
   * Subnet address of the receiver
   * @default 0
   */
  subnet?: number;
  /**
   * Universe address of the receiver
   * @default 0
   */
  universe?: number;
}

export interface ArtNetReceiverConnectOptions extends ArtNetReceiverOptions {
  host?: string;
  port?: number;
}

interface ArtNetReceiverEvents {
  update: () => void;
  error: (error: Error) => void;
}

export class ArtNetReceiver extends EventEmitter {
  private client: ArtNetReceiverClient | null = null;
  net: number = 0;
  subnet: number = 0;
  universe: number = 0;

  /**
   * DMX data buffer
   */
  readonly buffer: DmxFrame = new DmxFrame();

  constructor() {
    super();
  }

  /**
   * Connect to ArtNet receiver. If already connected, disconnects first.
   * @param options ArtNet receiver options
   */
  async connect(options: ArtNetReceiverConnectOptions): Promise<void>;
  async connect(
    client: ArtNetReceiverClient,
    options?: ArtNetReceiverOptions
  ): Promise<void>;
  async connect(
    clientOrOptions: ArtNetReceiverClient | ArtNetReceiverConnectOptions,
    options?: ArtNetReceiverOptions
  ) {
    if (this.client) {
      this.client.unregisterReceiver(this);
      this.client = null;
    }

    if (clientOrOptions instanceof ArtNetReceiverClient) {
      this.client = clientOrOptions;
    } else {
      this.client =
        ArtNetReceiverClientManager.getInstance().getClient(clientOrOptions);
    }

    this.net = options?.net ?? 0;
    this.subnet = options?.subnet ?? 0;
    this.universe = options?.universe ?? 0;

    await this.client!.registerReceiver(this);
  }

  on<K extends keyof ArtNetReceiverEvents>(
    eventName: K,
    listener: ArtNetReceiverEvents[K]
  ): this {
    return super.on(eventName, listener);
  }

  once<K extends keyof ArtNetReceiverEvents>(
    eventName: K,
    listener: ArtNetReceiverEvents[K]
  ): this {
    return super.once(eventName, listener);
  }

  emit<K extends keyof ArtNetReceiverEvents>(
    eventName: K,
    ...args: Parameters<ArtNetReceiverEvents[K]>
  ): boolean {
    return super.emit(eventName as string, ...args);
  }

  off<K extends keyof ArtNetReceiverEvents>(
    eventName: K,
    listener: ArtNetReceiverEvents[K]
  ): this {
    return super.off(eventName, listener);
  }

  destroy() {
    if (!this.client) {
      return;
    }
    this.client.unregisterReceiver(this);
  }
}

/**
 * ArtNet receiver client manager
 * @internal
 */
class ArtNetReceiverClientManager {
  private static instance: ArtNetReceiverClientManager;
  private sockets = new Map<string, ArtNetReceiverClient>();

  private constructor() {}

  static getInstance(): ArtNetReceiverClientManager {
    if (!ArtNetReceiverClientManager.instance) {
      ArtNetReceiverClientManager.instance = new ArtNetReceiverClientManager();
    }
    return ArtNetReceiverClientManager.instance;
  }

  getClient(options: ArtNetReceiverClientOptions): ArtNetReceiverClient {
    const host = options.host;
    const port = options.port;
    const socketKey = `${host}:${port}`;

    let socket = this.sockets.get(socketKey);
    if (!socket) {
      socket = new ArtNetReceiverClient(options);
      this.sockets.set(socketKey, socket);
    }

    return socket;
  }
}

/**
 * Create an ArtNet receiver
 */

export async function createArtNetReceiver(
  options?: ArtNetReceiverConnectOptions
): Promise<ArtNetReceiver>;
export async function createArtNetReceiver(
  client: ArtNetReceiverClient,
  options?: ArtNetReceiverOptions
): Promise<ArtNetReceiver>;
export async function createArtNetReceiver(
  clientOrOptions:
    | ArtNetReceiverClient
    | ArtNetReceiverConnectOptions
    | undefined,
  receiverOptions?: ArtNetReceiverOptions
): Promise<ArtNetReceiver> {
  if (clientOrOptions instanceof ArtNetReceiverClient) {
    const receiver = new ArtNetReceiver();
    await receiver.connect(clientOrOptions, receiverOptions);
    return receiver;
  }

  const options: ArtNetReceiverConnectOptions = clientOrOptions ?? {};
  options.host = options.host ?? "0.0.0.0";
  options.port = options.port ?? 6454;

  const client = ArtNetReceiverClientManager.getInstance().getClient(options);
  return createArtNetReceiver(client, options);
}
