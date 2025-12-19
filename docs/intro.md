# What is Obakesan?

Obakesan is a DMX monitor & converter for developers building their own media art installations and stage systems. It features Art-Net and USB DMX cross-conversion, real-time monitoring, and is free and open source.

Get started right away with the [Quick Start](./quickstart.md) guide.

## Features

### Easy Integration into Development Workflows

No dedicated hardware or complex configuration required. Works as a standalone app on Windows, macOS, and Linux—ready to use immediately.

Compact window size allows display alongside production software. Perfect for workflows where you monitor output while adjusting parameters in real-time.

### Simple & Beautiful UI

Minimal design focused on data visibility. Provides an elegant interface that designers and artists feel comfortable using.

### Freedom from Commercial Products

Provided as open source and free of charge, with customization available as needed.

## Use Cases

Obakesan can be utilized in various scenarios including development, on-site operations, and troubleshooting.

### Development Debugging

```
Production software (TouchDesigner, MaxMSP, etc.)
  -- (Art-Net) -->
  Monitor with Obakesan
```

Even without physical equipment, you can verify DMX values being sent from production software. Check behavior immediately and continue development without requiring actual devices.

### Protocol Conversion and Monitoring

```
PC control program
  -- (Art-Net) -->
  Convert & monitor with Obakesa
    -- (USB DMX) -->
    Output to devices
```

By routing through Obakesan, you can keep the interface implementation in your control program unified while supporting various output destinations depending on the situation. Visually monitoring data allows immediate detection of programming errors.

### Network Monitoring On Site

```
Art-Net broadcasted signals
--> Monitor with Obakesan

Monitor Art-Net packets flowing between devices on site. Verify that distributed data is correct by checking network signals.

### Troubleshooting

When things don't work as expected, it's often unclear whether the problem is in production software, wiring, or equipment. By checking data with Obakesan, you can isolate whether signals are being transmitted correctly.
```

## About the Name

"Obakesan" (おばけさん, meaning "ghost" + honorific for friends) comes from a character in the puppetry performance "The Friend Behind Me" (うしろのともだち) by Puppetry Troupe NEU from University of Tsukuba, Japan. The original work was created by Miyuki Isogai (a.k.a. "Jackpot").
