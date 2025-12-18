import log from "electron-log/main";
import consola, {
  LogLevels,
  type ConsolaReporter,
  type LogObject,
} from "consola";

// Disable console logging from electron-log
log.transports.console.level = false;
log.initialize();

export class ElectronLogReporter implements ConsolaReporter {
  log(logObj: LogObject) {
    const { level, args, tag } = logObj;

    const text = [tag ? `[${tag}]` : undefined, ...args]
      .filter(Boolean)
      .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
      .join(" ");

    // Consola levels:
    // 0: Fatal
    // 1: Error
    // 2: Warn
    // 3: Log
    // 4: Info
    // 5: Success
    // 6: Debug
    // 7: Trace
    // Silent: -Infinity
    // Verbose: Infinity

    switch (level) {
      case LogLevels.fatal: // Fatal
      case LogLevels.error: // Error
        log.error(text);
        break;
      case LogLevels.warn: // Warn
        log.warn(text);
        break;
      case LogLevels.log: // Log
        log.log(text);
        break;
      case LogLevels.info: // Info
      case LogLevels.success: // Success - treat as info
        log.info(text);
        break;
      case LogLevels.debug: // Debug
        log.debug(text);
        break;
      case LogLevels.trace: // Trace
        log.verbose(text);
        break;
      default:
        // Handle custom levels or others
        if (level < 0) {
          // silent
        } else {
          log.log(text);
        }
        break;
    }
  }
}

consola.addReporter(new ElectronLogReporter());
consola.wrapAll();

export { consola as logger };
