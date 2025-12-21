# Signal Generator Interface

::: warning Testing Tool Only
The Signal Generator is designed as a **testing and mocking tool**, not for design or production use. It provides a simple way to verify DMX output and lighting setups without requiring external controllers.
:::

The **Signal Generator** interface generates DMX lighting data using mathematical waveforms with a fixed frequency of 0.2 Hz (one cycle every 5 seconds).

## Input (Signal Generator)

When configured as a **Signal Generator** input, the application generates continuous DMX data based on the selected waveform type.

### Settings

| Setting       | Description                                                   |
| :------------ | :------------------------------------------------------------ |
| **Wave Type** | The type of waveform to generate: Sine, Square, or Sawtooth. |

**Note**: The frequency is fixed at 0.2 Hz (1/5) to provide consistent, predictable test patterns.

### Wave Types

#### Sine Wave
A smooth, continuous oscillation between 0 and 255. Creates gentle, flowing lighting transitions. Each channel has a slight phase offset creating a "fanning" effect across all 512 channels.

**Mathematical Formula**: `value = floor(((sin((t·0.2 + i/512)·2π) + 1) / 2) · 255)`
- `t` = elapsed time in seconds
- Frequency = 0.2 Hz (fixed)
- `i` = channel index (0-511)

**Use Cases**:
- Testing smooth dimming capability
- Verifying gradient effects
- Checking channel response

#### Square Wave
A binary signal that alternates between 0 and 255. Creates sharp on/off transitions. Each channel has a slight phase offset creating a "fanning" effect across all 512 channels.

**Mathematical Formula**: `value = (t·0.2 + i/512) % 1 < 0.5 ? 0 : 255`
- `t` = elapsed time in seconds
- Frequency = 0.2 Hz (fixed)
- `i` = channel index (0-511)

**Use Cases**:
- Testing strobe effects
- Verifying on/off switching
- Checking binary transitions

#### Sawtooth Wave
A linear ramp from 0 to 255, then resets. Creates a rising fade followed by an instant reset. Each channel has a slight phase offset creating a "fanning" effect across all 512 channels.

**Mathematical Formula**: `value = floor(((t·0.2 + i/512) % 1) · 255)`
- `t` = elapsed time in seconds
- Frequency = 0.2 Hz (fixed)
- `i` = channel index (0-511)

**Use Cases**:
- Testing ramp effects
- Verifying chase sequences
- Checking linear fades

## Technical Details

- **Update Rate**: 30 FPS (frames per second)
- **Fixed Frequency**: 0.2 Hz (one cycle every 5 seconds)
- **Channel Coverage**: All 512 DMX channels
- **Channel Fanning**: Each channel has a progressive phase offset (i/512) creating a wave pattern across channels
- **Value Range**: 0-255 (standard DMX range)
- **Phase Calculation**: Based on elapsed time since start plus channel offset

## Output Compatibility

The Signal Generator can be used with any output interface:

- **Art-Net Output**: Send generated test signals over the network
- **FTDI USB DMX Output**: Send generated test signals via USB DMX interface

This allows you to use the Signal Generator to verify real lighting fixtures or software visualizers are working correctly.

## Example Use Cases

1. **Testing Lighting Fixtures**
   - Use sine wave to verify smooth dimming capability
   - Use square wave for on/off response testing
   - Use sawtooth wave to check fade behavior

2. **Verifying DMX Output**
   - Test Art-Net transmission to ensure proper connectivity
   - Verify USB DMX interface is functioning correctly
   - Check all 512 channels are being transmitted

3. **Troubleshooting**
   - Generate predictable, consistent patterns for debugging
   - Isolate whether issues are in control software or fixtures
   - Verify DMX signal integrity without external controller

## Notes

- The Signal Generator is a **testing tool**, not intended for creative lighting design
- Frequency is fixed at 0.2 Hz (5-second cycles) for consistent, predictable behavior
- The Signal Generator operates independently of external DMX sources
- Switching between Art-Net and Signal Generator input is seamless
- Channels receive progressive phase-offset values creating a wave pattern across all channels
- The fanning effect creates visual dynamics where different channels peak at different times
