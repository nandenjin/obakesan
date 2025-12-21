import { defineStore } from "pinia";
import { reactive } from "vue";
import { z } from "zod";

/**
 * Schema for input configuration
 */
export const InputConfigSchema = z.object({
  host: z.string(),
  port: z.number(),
  net: z.number(),
  subnet: z.number(),
  universe: z.number(),
});

/**
 * Schema for output configuration
 */
export const OutputConfigSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(["artnet", "ftdi"]),
  host: z.string(),
  port: z.number(),
  net: z.number(),
  subnet: z.number(),
  universe: z.number(),
  fps: z.number(),
  deviceSerial: z.string(),
});

/**
 * Schema for the persistable config (what should be saved to disk)
 */
export const PersistableConfigSchema = z.object({
  input: InputConfigSchema,
  output: OutputConfigSchema,
});

export type InputConfig = z.infer<typeof InputConfigSchema>;
export type OutputConfig = z.infer<typeof OutputConfigSchema>;
export type PersistableConfig = z.infer<typeof PersistableConfigSchema>;

export const useConfigStore = defineStore("config", () => {
  const input = reactive<InputConfig>({
    host: "0.0.0.0",
    port: 6454,
    net: 0,
    subnet: 0,
    universe: 0,
  });

  const output = reactive<OutputConfig>({
    enabled: false,
    type: "artnet",
    host: "127.0.0.1",
    port: 6454,
    net: 0,
    subnet: 0,
    universe: 0,
    fps: 30,
    deviceSerial: "",
  });

  /**
   * Get the persistable state (what should be saved to disk)
   */
  const getPersistableState = (): PersistableConfig => {
    return {
      input: { ...input },
      output: { ...output },
    };
  };

  /**
   * Restore state from persisted config
   */
  const restoreState = (config: PersistableConfig) => {
    Object.assign(input, config.input);
    Object.assign(output, config.output);
  };

  return {
    input,
    output,
    getPersistableState,
    restoreState,
  };
});
