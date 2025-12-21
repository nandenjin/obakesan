# OSC Examples

This directory contains example scripts for testing OSC communication with obakesan.

## Prerequisites

Make sure you have Node.js installed and the `osc-min` package:

```bash
npm install osc-min
```

## Examples

### OSC Receiver Example

Receives DMX data from obakesan via OSC and prints it to the console.

**Usage:**
```bash
node osc-receiver-example.js [port] [path]
```

**Examples:**
```bash
# Listen on default port 8000 for /dmx messages
node osc-receiver-example.js

# Listen on port 9000 for /universe/0 messages
node osc-receiver-example.js 9000 /universe/0

# Listen on port 8000 for /myapp/dmx messages
node osc-receiver-example.js 8000 /myapp/dmx
```

**Setup in obakesan:**
1. Open obakesan
2. Click on the configuration panel
3. Set Output to "OSC"
4. Configure:
   - Host: `127.0.0.1` (or IP of machine running the script)
   - Port: `8000` (or your chosen port)
   - OSC Path: `/dmx` (or your chosen path)
   - FPS: `30`
5. Start the receiver script
6. obakesan will send DMX data as OSC messages

### OSC Transmitter Example

Sends test DMX patterns to obakesan via OSC.

**Usage:**
```bash
node osc-transmitter-example.js [mode] [host] [port] [path]
```

**Modes:**
- `blob` - Send whole universe as binary blob (default, recommended for obakesan output)
- `per-channel` - Send individual channel messages (for obakesan input with `:channel` placeholder)

**Examples:**
```bash
# Send blob data to obakesan on localhost:8000
node osc-transmitter-example.js blob 127.0.0.1 8000 /dmx

# Send per-channel data to obakesan input
node osc-transmitter-example.js per-channel 127.0.0.1 8000 /dmx/:channel
```

**Setup in obakesan:**

For receiving (Input):
1. Open obakesan
2. Click on the configuration panel
3. Set Input to "OSC"
4. Configure:
   - Host: `0.0.0.0` (listen on all interfaces)
   - Port: `8000` (or your chosen port)
   - OSC Path: `/dmx/:channel` (for per-channel) or `/dmx` (for blob)
   - Start Ch: `1`
   - Length: `512`
   - Data Type: Choose based on your sender
5. Start the transmitter script
6. You should see DMX values updating in obakesan

## Test Patterns

The transmitter example includes several test patterns:

- **Chase**: A moving light chase effect across channels
- **Rainbow**: A colorful wave pattern across all channels

Patterns automatically rotate every 5 seconds.

## Troubleshooting

**No data received:**
- Check that the host and port match between obakesan and the script
- Verify firewall settings allow UDP traffic on the specified port
- Ensure the OSC path matches exactly (case-sensitive)

**Performance issues:**
- Reduce FPS in obakesan or the transmitter script
- Use blob mode instead of per-channel for better performance
- Check network bandwidth if sending over network

## Integration with Other Software

These examples can be adapted to work with other OSC-compatible software:

- TouchOSC
- QLab
- Max/MSP
- Pure Data
- Processing
- OpenFrameworks

Simply modify the host, port, and OSC path parameters to match your setup.
