/**
 * Validate host IP address or hostname
 * Note: This performs basic validation. More comprehensive validation could be added
 * if needed, but being permissive allows for various network configurations.
 */
export function validateHost(host: string): boolean {
  if (!host || host.trim().length === 0) return false;
  // Allow IP addresses, hostnames, and localhost
  return true;
}

/**
 * Validate port number
 */
export function validatePort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

/**
 * Validate OSC address path
 */
export function validatePath(path: string): boolean {
  if (!path || path.trim().length === 0) return false;
  // OSC paths should start with /
  if (!path.startsWith("/")) return false;
  return true;
}

/**
 * Validate channel range
 */
export function validateChannelRange(
  startChannel: number,
  length: number
): boolean {
  if (!Number.isInteger(startChannel) || !Number.isInteger(length))
    return false;
  if (startChannel < 1 || startChannel > 512) return false;
  if (length < 1) return false;
  if (startChannel + length - 1 > 512) return false;
  return true;
}
