# OSC Interface

The **OSC (Open Sound Control)** interface allows the application to send and receive DMX lighting data over a network using the OSC protocol.

## Input (Receiver)

When configured as an **Input**, the application listens for OSC messages containing DMX data.

### Settings

| Setting             | Description                                                                                                                          |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| **Host**            | The network adapter (IP address) to listen on. Use `0.0.0.0` to listen on all interfaces.                                           |
| **Port**            | The network port to listen on. Default is `8000`.                                                                                    |
| **OSC Path**        | The OSC address pattern to match. Use `:channel` as placeholder for channel numbers, e.g., `/dmx/:channel` or `/0/dmx/:channel`.    |
| **Start Channel**   | The first DMX channel to receive (1-512).                                                                                            |
| **Length**          | Number of consecutive DMX channels to receive (1-512).                                                                               |
| **Data Type**       | The data format: **Int** (0-255 integer), **Float** (0.0-1.0 normalized), or **Blob** (binary data for whole universe).            |

### Usage Examples

#### Per-Channel Mode

Set **OSC Path** to `/dmx/:channel` to receive individual channel messages:
- `/dmx/1` with value `255` sets channel 1 to 255
- `/dmx/100` with value `128` sets channel 100 to 128

#### Whole Universe Mode

Set **OSC Path** to `/dmx/universe` (without `:channel` placeholder) to receive all channels in a single message:
- For **Int** or **Float**: Message arguments are interpreted as consecutive channel values
- For **Blob**: Binary data contains channel values as bytes

## Output (Transmitter)

When configured as an **Output**, the application sends DMX data via OSC messages.

### Settings

| Setting      | Description                                                                                      |
| :----------- | :----------------------------------------------------------------------------------------------- |
| **Host**     | The destination IP address. Use `127.0.0.1` for localhost or a specific IP for remote targets. |
| **Port**     | The destination network port. Default is `8000`.                                                 |
| **OSC Path** | The OSC address to send data to, e.g., `/dmx` or `/universe/0`.                                 |
| **FPS**      | Frames Per Second. Controls how frequently OSC messages are sent.                                |

**Note**: Output always sends the **whole DMX universe (512 channels) as a binary blob** for maximum efficiency and simplicity.

### Usage Example

The transmitter sends all 512 DMX channels as a binary blob in a single OSC message:
- OSC Address: `/dmx` (or your custom path)
- Data Type: Blob (binary data containing 512 bytes)
- Each byte represents one DMX channel value (0-255)

## OSC Protocol Details

Obakesan implements standard OSC protocol over UDP:

- **Transport**: UDP over Ethernet/Wi-Fi
- **Message Format**: OSC messages with type tags
- **Output Format**: Binary blob containing 512 DMX channel values
- **Input Support**: Integer (`i`), Float (`f`), and Blob (`b`) types
- **Channel Range**: 1-512 DMX channels

## Example Scripts

Example scripts for testing and integration are available in the `examples/osc/` directory:

- **osc-receiver-example.js** - Receives DMX data from obakesan and prints to console
- **osc-transmitter-example.js** - Sends test patterns to obakesan (supports both input modes)

See [`examples/osc/README.md`](../../examples/osc/README.md) for usage instructions.

## Compatible Software

OSC is widely supported by many applications and hardware:
- TouchOSC
- QLab
- Max/MSP
- Pure Data
- Processing
- OpenFrameworks
- And many more...
