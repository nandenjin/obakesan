# Signal Generator Interface

The **Signal Generator** interface generates DMX lighting data for tests. It provides a simple way to verify DMX output and lighting setups without requiring external controllers.

## Input (Signal Generator)

The application generates DMX data based on the selected waveform type.

### Settings

| Setting       | Description                                                  |
| :------------ | :----------------------------------------------------------- |
| **Wave Type** | The type of waveform to generate: Sine, Square, or Sawtooth. |

**Note**: The frequency is fixed at 0.2 Hz (1/5) to provide consistent, predictable test patterns.

### Wave Types

- Sine Wave: `value = floor(((sin((t·f + i/512)·2π) + 1) / 2) · 255)`
- Square Wave: `value = (t·f + i/512) % 1 < 0.5 ? 0 : 255`
- Sawtooth Wave: `value = floor(((t·f + i/512) % 1) · 255)`

Where:

- `t` = elapsed time in seconds
- `f` = frequency (fixed at 0.2 Hz)
- `i` = channel index (0-511)
