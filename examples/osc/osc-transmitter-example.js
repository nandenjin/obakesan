#!/usr/bin/env node

/**
 * OSC Transmitter Example
 * 
 * This script demonstrates how to send DMX data to obakesan via OSC.
 * It sends test patterns or allows you to manually set channel values.
 * 
 * Usage:
 *   node osc-transmitter-example.js [mode] [host] [port] [path]
 * 
 * Modes:
 *   per-channel  - Send individual channel messages (e.g., /dmx/1, /dmx/2, ...)
 *   blob         - Send whole universe as binary blob (default)
 * 
 * Examples:
 *   node osc-transmitter-example.js blob 127.0.0.1 8000 /dmx
 *   node osc-transmitter-example.js per-channel 127.0.0.1 8000 /dmx/:channel
 */

const dgram = require('dgram');
const osc = require('osc-min');

// Configuration
const MODE = process.argv[2] || 'blob';
const HOST = process.argv[3] || '127.0.0.1';
const PORT = parseInt(process.argv[4]) || 8000;
const OSC_PATH = process.argv[5] || (MODE === 'per-channel' ? '/dmx/:channel' : '/dmx');

console.log('OSC Transmitter Example');
console.log('=======================');
console.log(`Mode: ${MODE}`);
console.log(`Target: ${HOST}:${PORT}`);
console.log(`OSC Path: ${OSC_PATH}`);
console.log('');

// Create DMX buffer (512 channels)
const dmxBuffer = Buffer.alloc(512);

// Create UDP socket
const socket = dgram.createSocket('udp4');

/**
 * Send DMX data as blob (whole universe)
 */
function sendBlob() {
  const msg = osc.toBuffer({
    address: OSC_PATH,
    args: [
      { type: 'blob', value: dmxBuffer }
    ]
  });
  
  const buffer = Buffer.from(msg.buffer, msg.byteOffset, msg.byteLength);
  socket.send(buffer, PORT, HOST, (err) => {
    if (err) console.error('Send error:', err.message);
  });
}

/**
 * Send DMX data as per-channel messages
 */
function sendPerChannel() {
  for (let i = 0; i < 512; i++) {
    const value = dmxBuffer[i];
    if (value > 0) {
      const address = OSC_PATH.replace(':channel', (i + 1).toString());
      const msg = osc.toBuffer({
        address: address,
        args: [{ type: 'integer', value: value }]
      });
      
      const buffer = Buffer.from(msg.buffer, msg.byteOffset, msg.byteLength);
      socket.send(buffer, PORT, HOST);
    }
  }
}

/**
 * Send current DMX buffer
 */
function sendDmx() {
  if (MODE === 'per-channel') {
    sendPerChannel();
  } else {
    sendBlob();
  }
}

/**
 * Generate test pattern - fading chase
 */
let chasePosition = 0;
function generateChasePattern() {
  // Clear buffer
  dmxBuffer.fill(0);
  
  // Create chase effect (8 channels)
  for (let i = 0; i < 8; i++) {
    const pos = (chasePosition + i) % 512;
    const brightness = Math.max(0, 255 - i * 30);
    dmxBuffer[pos] = brightness;
  }
  
  chasePosition = (chasePosition + 1) % 512;
}

/**
 * Generate test pattern - rainbow
 */
function generateRainbowPattern() {
  for (let i = 0; i < 512; i++) {
    const hue = (Date.now() / 20 + i * 2) % 360;
    // Simple hue to brightness conversion
    const brightness = Math.floor((Math.sin(hue * Math.PI / 180) + 1) * 127.5);
    dmxBuffer[i] = brightness;
  }
}

// Start sending test patterns
console.log('Sending test patterns...');
console.log('Press Ctrl+C to stop\n');

let testMode = 0;
const patterns = [
  { name: 'Chase', fn: generateChasePattern },
  { name: 'Rainbow', fn: generateRainbowPattern }
];

console.log(`Pattern: ${patterns[testMode].name}`);

// Send at 30 FPS
const sendInterval = setInterval(() => {
  patterns[testMode].fn();
  sendDmx();
}, 1000 / 30);

// Change pattern every 5 seconds
const patternInterval = setInterval(() => {
  testMode = (testMode + 1) % patterns.length;
  console.log(`Pattern: ${patterns[testMode].name}`);
}, 5000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  clearInterval(sendInterval);
  clearInterval(patternInterval);
  socket.close();
  process.exit(0);
});
