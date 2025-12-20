import { EventEmitter } from "node:events";
import { DmxFrame } from "./DmxFrame";

export type WaveType = "sine" | "square" | "sawtooth";

export interface SignalGeneratorOptions {
  /**
   * Wave type
   * @default "sine"
   */
  waveType?: WaveType;
  /**
   * Frequency in Hz
   * @default 1
   */
  frequency?: number;
  /**
   * Update rate in FPS
   * @default 30
   */
  fps?: number;
}

interface SignalGeneratorEvents {
  update: () => void;
  error: (error: Error) => void;
}

/**
 * SignalGenerator
 * Generates DMX data with various wave patterns.
 */
export class SignalGenerator extends EventEmitter {
  waveType: WaveType = "sine";
  frequency: number = 1;
  fps: number = 30;

  /**
   * DMX data buffer
   */
  readonly buffer: DmxFrame = new DmxFrame();

  private interval: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private isRunning: boolean = false;

  constructor(options?: SignalGeneratorOptions) {
    super();
    if (options) {
      this.waveType = options.waveType ?? "sine";
      this.frequency = options.frequency ?? 1;
      this.fps = options.fps ?? 30;
    }
  }

  /**
   * Start generating signals
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.stop();
    }

    this.startTime = Date.now();
    this.isRunning = true;

    const intervalMs = 1000 / this.fps;
    this.interval = setInterval(() => {
      this.generateFrame();
      this.emit("update");
    }, intervalMs);
  }

  /**
   * Generate a single frame of DMX data based on current time and settings
   */
  private generateFrame(): void {
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;
    const phase = (elapsedSeconds * this.frequency) % 1; // 0 to 1
    let value: number;
    switch (this.waveType) {
      case "sine":
        // Sine wave: 0 to 255
        value = Math.floor((Math.sin(phase * 2 * Math.PI) + 1) * 127.5);
        break;
      case "square":
        // Square wave: 0 or 255
        value = phase < 0.5 ? 0 : 255;
        break;
      case "sawtooth":
        // Sawtooth wave: 0 to 255 linearly
        value = Math.floor(phase * 255);
        break;
      default:
        value = 0;
    }

    // Set all 512 channels to the same value efficiently
    for (let i = 0; i < 512; i++) {
      this.buffer.data[i] = value;
    }
  }

  on<K extends keyof SignalGeneratorEvents>(
    eventName: K,
    listener: SignalGeneratorEvents[K]
  ): this {
    return super.on(eventName, listener);
  }

  once<K extends keyof SignalGeneratorEvents>(
    eventName: K,
    listener: SignalGeneratorEvents[K]
  ): this {
    return super.once(eventName, listener);
  }

  emit<K extends keyof SignalGeneratorEvents>(
    eventName: K,
    ...args: Parameters<SignalGeneratorEvents[K]>
  ): boolean {
    return super.emit(eventName as string, ...args);
  }

  off<K extends keyof SignalGeneratorEvents>(
    eventName: K,
    listener: SignalGeneratorEvents[K]
  ): this {
    return super.off(eventName, listener);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
    }
  }

  close() {
    this.stop();
  }
}

/**
 * Create a signal generator
 */
export async function createSignalGenerator(
  options?: SignalGeneratorOptions
): Promise<SignalGenerator> {
  const generator = new SignalGenerator(options);
  await generator.start();
  return generator;
}
