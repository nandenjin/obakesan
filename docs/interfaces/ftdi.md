# FTDI Interface

The **FTDI** interface enables DMX512 output using generic USB-to-DMX adapters based on the FTDI chip (e.g. FT232R).

Due to limitations of serial ports, **the FTDI interface is only for output (transmitter).**

## Configuration

To use an FTDI device, ensure it is plugged into a USB port on your computer.

### Device Selection

The application will automatically list available FTDI devices. Select your specific device from the dropdown menu (identified by its Serial Number).

### Settings

| Setting | Description                                                                    |
| :------ | :----------------------------------------------------------------------------- |
| **FPS** | Frames Per Second. Controls how frequently DMX packets are sent to the device. |

## Supported Hardware

Most generic USB-DMX cables that use an **FTDI** chipset are supported.

- **Chipsets**: FT232R, FT232H, etc.
- **Protocol**: Raw DMX via D2XX driver

## Specifications

- **Output Standard**: DMX512
- **Update Rate**: Configurable
