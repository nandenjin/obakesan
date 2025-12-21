# Signal Generator Interface

The **Signal Generator** interface allows the application to generate DMX lighting data using mathematical waveforms. This is useful for testing lighting setups, creating effects, or demonstrating DMX control without requiring external lighting consoles.

## Input (Signal Generator)

When configured as a **Signal Generator** input, the application generates continuous DMX data based on the selected waveform and frequency parameters.

### Settings

| Setting       | Description                                                                 |
| :------------ | :-------------------------------------------------------------------------- |
| **Wave Type** | The type of waveform to generate: Sine, Square, or Sawtooth.               |
| **Frequency** | How fast the waveform cycles, measured in Hertz (Hz). Range: 0.1 to 100 Hz. |

### Wave Types

#### Sine Wave
A smooth, continuous oscillation between 0 and 255. Creates gentle, flowing lighting transitions.

**Mathematical Formula**: `(sin(φ·2π) + 1) · 127.5`

**Use Cases**:
- Smooth fading effects
- Breathing lights
- Gentle color transitions

#### Square Wave
A binary signal that alternates between 0 and 255. Creates sharp on/off transitions.

**Mathematical Formula**: `phase < 0.5 ? 0 : 255`

**Use Cases**:
- Strobe effects
- On/off switching
- Sharp color changes

#### Sawtooth Wave
A linear ramp from 0 to 255, then resets. Creates a rising fade followed by an instant reset.

**Mathematical Formula**: `phase · 255`

**Use Cases**:
- Ramping effects
- Chase sequences
- Linear dimming cycles

### Frequency Control

The frequency parameter controls how many complete wave cycles occur per second:

- **0.1 Hz**: One cycle every 10 seconds (very slow)
- **1 Hz**: One cycle per second (default)
- **10 Hz**: Ten cycles per second (fast)
- **100 Hz**: One hundred cycles per second (very fast)

### Technical Details

- **Update Rate**: 30 FPS (frames per second)
- **Channel Coverage**: All 512 DMX channels are set to the same value
- **Value Range**: 0-255 (standard DMX range)
- **Phase Calculation**: Based on elapsed time since start

## Output Compatibility

The Signal Generator can be used with any output interface:

- **Art-Net Output**: Send generated signals over the network
- **FTDI USB DMX Output**: Send generated signals via USB DMX interface

This allows you to use the Signal Generator to drive real lighting fixtures or software visualizers.

## Example Use Cases

1. **Testing Lighting Fixtures**
   - Use sine wave at 1 Hz to verify smooth dimming capability
   - Use square wave for strobe testing

2. **Creating Visual Effects**
   - Combine with Art-Net output to create synchronized effects across multiple fixtures
   - Use different frequencies for varied visual dynamics

3. **Demonstration Mode**
   - Showcase DMX control capabilities without requiring external controller
   - Generate predictable patterns for troubleshooting

## Notes

- The Signal Generator operates independently of external DMX sources
- Switching between Art-Net and Signal Generator input is seamless
- All channels receive the same waveform value for simplicity
