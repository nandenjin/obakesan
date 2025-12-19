import { app } from "electron";
import { join } from "path";
import { readFile, writeFile, mkdir } from "fs/promises";
import * as TOML from "@iarna/toml";
import { logger as baseLogger } from "./logger";

const logger = baseLogger.withTag("ConfigPersistence");

const CONFIG_SCHEMA_VERSION = "1";
const CONFIG_FILE_NAME = "config.toml";

/**
 * Structure of the persisted configuration
 */
export interface PersistedConfig {
  schemaVersion: string;
  appVersion: string;
  input: {
    host: string;
    port: number;
    net: number;
    subnet: number;
    universe: number;
  };
  output: {
    enabled: boolean;
    type: "artnet" | "ftdi";
    host: string;
    port: number;
    net: number;
    subnet: number;
    universe: number;
    fps: number;
    deviceSerial: string;
  };
}

/**
 * Get the path to the config file
 */
function getConfigPath(): string {
  return join(app.getPath("userData"), CONFIG_FILE_NAME);
}

/**
 * Validate that a parsed config has the expected structure
 */
function validateConfig(config: unknown): config is PersistedConfig {
  if (!config || typeof config !== "object") return false;
  
  const c = config as Record<string, unknown>;
  
  // Check required top-level fields
  if (typeof c.schemaVersion !== "string") return false;
  if (typeof c.appVersion !== "string") return false;
  if (!c.input || typeof c.input !== "object") return false;
  if (!c.output || typeof c.output !== "object") return false;
  
  const input = c.input as Record<string, unknown>;
  const output = c.output as Record<string, unknown>;
  
  // Validate input structure
  if (typeof input.host !== "string") return false;
  if (typeof input.port !== "number") return false;
  if (typeof input.net !== "number") return false;
  if (typeof input.subnet !== "number") return false;
  if (typeof input.universe !== "number") return false;
  
  // Validate output structure
  if (typeof output.enabled !== "boolean") return false;
  if (output.type !== "artnet" && output.type !== "ftdi") return false;
  if (typeof output.host !== "string") return false;
  if (typeof output.port !== "number") return false;
  if (typeof output.net !== "number") return false;
  if (typeof output.subnet !== "number") return false;
  if (typeof output.universe !== "number") return false;
  if (typeof output.fps !== "number") return false;
  if (typeof output.deviceSerial !== "string") return false;
  
  return true;
}

/**
 * Load configuration from disk
 * @returns The loaded configuration or null if it doesn't exist or is invalid
 */
export async function loadConfig(): Promise<PersistedConfig | null> {
  try {
    const configPath = getConfigPath();
    logger.info(`Loading config from ${configPath}`);
    
    const content = await readFile(configPath, "utf-8");
    const parsed = TOML.parse(content);

    // Validate structure
    if (!validateConfig(parsed)) {
      logger.warn("Config file has invalid structure, using defaults");
      return null;
    }

    // Validate schema version
    if (parsed.schemaVersion !== CONFIG_SCHEMA_VERSION) {
      logger.warn(
        `Config schema version mismatch: expected ${CONFIG_SCHEMA_VERSION}, got ${parsed.schemaVersion}`
      );
      return null;
    }

    logger.success("Config loaded successfully");
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      logger.info("No config file found, using defaults");
    } else {
      logger.error("Failed to load config", error);
    }
    return null;
  }
}

/**
 * Save configuration to disk
 * @param config The configuration to save
 */
export async function saveConfig(config: PersistedConfig): Promise<void> {
  try {
    const configPath = getConfigPath();
    const userDataPath = app.getPath("userData");

    // Ensure userData directory exists
    await mkdir(userDataPath, { recursive: true });

    const tomlContent = TOML.stringify(config as unknown as TOML.JsonMap);
    await writeFile(configPath, tomlContent, "utf-8");

    logger.debug(`Config saved to ${configPath}`);
  } catch (error) {
    logger.error("Failed to save config", error);
    throw error;
  }
}

/**
 * Create a persisted config object from the current state
 * @param input Input configuration
 * @param output Output configuration
 * @returns A persisted config object
 */
export function createPersistedConfig(
  input: PersistedConfig["input"],
  output: PersistedConfig["output"]
): PersistedConfig {
  return {
    schemaVersion: CONFIG_SCHEMA_VERSION,
    appVersion: app.getVersion(),
    input,
    output,
  };
}
