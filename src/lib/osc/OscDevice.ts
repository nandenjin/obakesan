import * as dgram from "node:dgram";
import { EventEmitter } from "node:events";

/**
 * OscDevice manages UDP sockets for OSC communication
 * Similar to ArtNetDevice, but simpler since OSC doesn't have device discovery
 */
export class OscDevice extends EventEmitter {
  private static instance: OscDevice | null = null;
  private sockets: Map<string, dgram.Socket> = new Map();

  private constructor() {
    super();
  }

  static getInstance(): OscDevice {
    if (!OscDevice.instance) {
      OscDevice.instance = new OscDevice();
    }
    return OscDevice.instance;
  }

  /**
   * Create or reuse a socket for given host and port
   * @param host Host to bind to
   * @param port Port to bind to
   * @returns Socket key identifier
   */
  async bind(host: string, port: number): Promise<string> {
    const key = `${host}:${port}`;

    if (this.sockets.has(key)) {
      return key;
    }

    const socket = dgram.createSocket("udp4");

    await new Promise<void>((resolve, reject) => {
      socket.on("error", (err) => {
        reject(err);
      });

      socket.bind(port, host, () => {
        resolve();
      });
    });

    this.sockets.set(key, socket);
    return key;
  }

  /**
   * Get socket by key
   */
  getSocket(key: string): dgram.Socket | undefined {
    return this.sockets.get(key);
  }

  /**
   * Send data via socket
   */
  send(key: string, data: Buffer, host: string, port: number): void {
    const socket = this.sockets.get(key);
    if (socket) {
      socket.send(data, port, host);
    }
  }

  /**
   * Close and remove socket
   */
  closeSocket(key: string): void {
    const socket = this.sockets.get(key);
    if (socket) {
      socket.close();
      this.sockets.delete(key);
    }
  }

  /**
   * Close all sockets
   */
  closeAll(): void {
    for (const socket of this.sockets.values()) {
      socket.close();
    }
    this.sockets.clear();
  }
}
