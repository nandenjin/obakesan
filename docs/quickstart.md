<script setup lang="ts">
  import pkg from "../package.json"
  </script>

# Quick Start

## Installation

Available for Windows, macOS, and Linux.

- Version {{ pkg.version }}
  - <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-win.exe`">Windows (Installer)</a>
  - <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-mac.dmg`">macOS (.dmg)</a>
  - <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-linux.AppImage`">Linux (AppImage)</a>
  - <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-linux.deb`">Linux (Debian/.deb)</a>
  - <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-linux.snap`">Linux (Snap)</a>

For other versions, visit the [Download page](./download.md).

## Key Features

### DMX Data Monitoring

Monitor DMX channel values in real-time.

### Protocol Conversion

Forward received signals to any output interface, functioning as a simple protocol converter.

## Supported Interfaces

Currently supports the following interfaces (protocols):

- [Art-Net](./interfaces/artnet) - Network-based DMX protocol
- [Signal Generator](./interfaces/generator) - Generate test signals with mathematical waveforms
- [FTDI USB DMX](./interfaces/ftdi) (output only) - USB DMX interface
