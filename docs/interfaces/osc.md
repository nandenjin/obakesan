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

| Setting             | Description                                                                                                                          |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| **Host**            | The destination IP address. Use `127.0.0.1` for localhost or a specific IP for remote targets.                                      |
| **Port**            | The destination network port. Default is `8000`.                                                                                     |
| **OSC Path**        | The OSC address pattern to send. Use `:channel` as placeholder for channel numbers, e.g., `/dmx/:channel` or `/0/dmx/:channel`.     |
| **Start Channel**   | The first DMX channel to transmit (1-512).                                                                                           |
| **Length**          | Number of consecutive DMX channels to transmit (1-512).                                                                              |
| **Data Type**       | The data format: **Int** (0-255 integer), **Float** (0.0-1.0 normalized), or **Blob** (binary data for whole universe).            |
| **FPS**             | Frames Per Second. Controls how frequently OSC messages are sent.                                                                    |

### Usage Examples

#### Per-Channel Mode

Set **OSC Path** to `/dmx/:channel` to send individual messages for each channel:
- Channel 1 → `/dmx/1` with integer value
- Channel 100 → `/dmx/100` with integer value

#### Whole Universe Mode

Set **OSC Path** to `/dmx/universe` (without `:channel` placeholder) to send all channels in a single message:
- For **Int** or **Float**: All channel values sent as separate arguments
- For **Blob**: All channel values sent as binary blob

## OSC Protocol Details

Obakesan implements standard OSC protocol over UDP:

- **Transport**: UDP over Ethernet/Wi-Fi
- **Message Format**: OSC messages with type tags
- **Supported Types**: Integer (`i`), Float (`f`), Blob (`b`)
- **Channel Range**: 1-512 DMX channels

## Compatible Software

OSC is widely supported by many applications and hardware:
- TouchOSC
- QLab
- Max/MSP
- Pure Data
- Processing
- OpenFrameworks
- And many more...
