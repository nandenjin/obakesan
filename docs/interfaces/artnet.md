# Art-Net Interface

The **Art-Net** interface allows the application to send and receive DMX lighting data over a network (Ethernet or Wi-Fi).

## Input (Receiver)

When configured as an **Input**, the application listens for Art-Net data coming from lighting consoles or other software.

### Settings

| Setting       | Description                                                                                        |
| :------------ | :------------------------------------------------------------------------------------------------- |
| **Net**       | The high-level network address group (0-127). Usually `0`.                                         |
| **Subnet**    | The sub-group address (0-15). Usually `0`.                                                         |
| **Universe**  | The specific DMX universe (0-15).                                                                  |
| **Bind Host** | The specific network adapter (IP address) to listen on. Use `0.0.0.0` to listen on all interfaces. |

Ensure that the Net, Subnet, and Universe match the settings on your sending device.

## Output (Transmitter)

When configured as an **Output**, the application sends DMX data to other Art-Net nodes or visualizers.

### Settings

| Setting         | Description                                                                                       |
| :-------------- | :------------------------------------------------------------------------------------------------ |
| **Target Host** | The IP address of the destination device. Use `255.255.255.255` for broadcast (send to everyone). |
| **Target Port** | The network port. Standard Art-Net UDP port is `6454`.                                            |
| **Net**         | The destination Net address (0-127).                                                              |
| **Subnet**      | The destination Subnet address (0-15).                                                            |
| **Universe**    | The destination Universe address (0-15).                                                          |
| **FPS**         | Frames Per Second. Controls how frequently DMX packets are sent.                                  |

## Specifications

Obakesan supports the standard Art-Net 4 protocol specifications.

- **Transport**: UDP over Ethernet/Wi-Fi
- **Default Port**: 6454
- **Addressing**: 15-bit address space (Net + Subnet + Universe)
