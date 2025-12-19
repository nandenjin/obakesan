import type { showLogfileInFolder } from "../preload";

declare global {
  interface Window {
    /**
     * Show the folder containing the log file in the file explorer
     * @see {@link showLogfileInFolder}
     */
    showLogfileInFolder: typeof showLogfileInFolder;
  }
}
