#!/usr/bin/env node

/**
 * OSC Receiver Example
 * 
 * This script demonstrates how to receive DMX data from obakesan via OSC.
 * It listens for OSC messages on the specified port and prints received DMX values.
 * 
 * Usage:
 *   node osc-receiver-example.js [port] [path]
 * 
 * Examples:
 *   node osc-receiver-example.js 8000 /dmx
 *   node osc-receiver-example.js 9000 /universe/0
 */

const dgram = require('dgram');
const osc = require('osc-min');

// Configuration
const PORT = process.argv[2] || 8000;
const OSC_PATH = process.argv[3] || '/dmx';

console.log('OSC Receiver Example');
console.log('====================');
console.log(`Listening on port: ${PORT}`);
console.log(`Expected OSC path: ${OSC_PATH}`);
console.log('Waiting for DMX data from obakesan...\n');

// Create UDP socket
const socket = dgram.createSocket('udp4');

socket.on('error', (err) => {
  console.error(`Socket error: ${err.message}`);
  socket.close();
});

socket.on('message', (msg, rinfo) => {
  try {
    // Parse OSC message
    const oscMsg = osc.fromBuffer(msg);
    
    if (oscMsg.address === OSC_PATH) {
      // Handle blob data (whole universe)
      if (oscMsg.args.length > 0 && oscMsg.args[0].type === 'blob') {
        const dmxData = oscMsg.args[0].value;
        
        // Print first 16 channels for demonstration
        const channels = [];
        for (let i = 0; i < Math.min(16, dmxData.byteLength); i++) {
          channels.push(`Ch${i + 1}:${dmxData.getUint8(i)}`);
        }
        
        console.log(`[${new Date().toISOString()}] ${OSC_PATH} -> ${channels.join(' ')}`);
        
        // Print stats
        const nonZeroChannels = [];
        for (let i = 0; i < dmxData.byteLength; i++) {
          const val = dmxData.getUint8(i);
          if (val > 0) {
            nonZeroChannels.push(i + 1);
          }
        }
        
        if (nonZeroChannels.length > 0) {
          console.log(`  Active channels (${nonZeroChannels.length}): ${nonZeroChannels.slice(0, 10).join(', ')}${nonZeroChannels.length > 10 ? '...' : ''}`);
        }
      }
    }
  } catch (err) {
    console.error(`Error parsing OSC message: ${err.message}`);
  }
});

socket.on('listening', () => {
  const address = socket.address();
  console.log(`Socket listening on ${address.address}:${address.port}\n`);
});

// Bind to port
socket.bind(PORT);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  socket.close();
  process.exit(0);
});
