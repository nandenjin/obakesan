# Design Concept

Obakesan is a DMX monitor and converter for developers building custom systems without relying on commercial products. As a standalone app requiring no dedicated hardware, it provides cross-conversion between Art-Net and USB DMX. The design focuses on data visibility through minimal UI and easy integration into existing workflows.

## Design Approach

### Simple and Practical

Works as a standalone app without requiring dedicated hardware or complex configuration. Focuses on essential features and prioritizes ease of use across different environments.

### Integration with Existing Workflows

Provides cross-conversion between Art-Net and USB DMX, allowing integration into existing toolchains. Open source enables customization when needed.

## UI Design

### Data Visibility

Displays DMX channel values in matrix format. Highlights channels with changing values to help locate relevant information among many channels.

### Minimal Layout

Features a simple interface with only necessary elements. The visual organization is designed to feel natural for designers and artists.

### Use Alongside Other Tools

Compact window size allows displaying alongside production software. Designed for workflows where you monitor output while adjusting parameters.

## Target Users

Designed for developers building custom systems without relying on commercial products, including lighting control for interactive works and installations, and development and testing of custom controllers and automation systems.

## Technical Stack

- **Electron**: Cross-platform support
- **Vue.js**: Reactive UI implementation
- **MIT License**: Published as open source
