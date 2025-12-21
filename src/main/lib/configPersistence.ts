import { app } from "electron";
import { join } from "path";
import { readFile, writeFile, mkdir } from "fs/promises";
import * as TOML from "@iarna/toml";
import { logger as baseLogger } from "./logger";
import { PersistableConfigSchema, type PersistableConfig } from "../../store/config";
import { z } from "zod";

const logger = baseLogger.withTag("ConfigPersistence");

const CONFIG_SCHEMA_VERSION = "1";
const CONFIG_FILE_NAME = "config.toml";

/**
 * Schema for the persisted configuration file
 * This includes metadata (schemaVersion, appVersion) plus the persistable config
 */
const PersistedConfigSchema = z.object({
  schemaVersion: z.string(),
  appVersion: z.string(),
}).merge(PersistableConfigSchema);

export type PersistedConfig = z.infer<typeof PersistedConfigSchema>;

/**
 * Get the path to the config file
 */
function getConfigPath(): string {
  return join(app.getPath("userData"), CONFIG_FILE_NAME);
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

    // Validate structure using zod
    const result = PersistedConfigSchema.safeParse(parsed);
    if (!result.success) {
      logger.warn("Config file has invalid structure, using defaults", result.error);
      return null;
    }

    // Validate schema version
    if (result.data.schemaVersion !== CONFIG_SCHEMA_VERSION) {
      logger.warn(
        `Config schema version mismatch: expected ${CONFIG_SCHEMA_VERSION}, got ${result.data.schemaVersion}`
      );
      return null;
    }

    logger.success("Config loaded successfully");
    return result.data;
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
 * @param config The persistable configuration from the store
 */
export async function saveConfig(config: PersistableConfig): Promise<void> {
  try {
    const configPath = getConfigPath();
    const userDataPath = app.getPath("userData");

    // Ensure userData directory exists
    await mkdir(userDataPath, { recursive: true });

    // Add metadata to the persistable config
    const persistedConfig: PersistedConfig = {
      schemaVersion: CONFIG_SCHEMA_VERSION,
      appVersion: app.getVersion(),
      ...config,
    };

    const tomlContent = TOML.stringify(persistedConfig as unknown as TOML.JsonMap);
    await writeFile(configPath, tomlContent, "utf-8");

    logger.debug(`Config saved to ${configPath}`);
  } catch (error) {
    logger.error("Failed to save config", error);
    throw error;
  }
}
