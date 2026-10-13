# ESP32 module and service access

[Guide index](../README.md). Saved page 4, MCU_MODULE_PROVISIONAL.

## Current allocation

| GPIO | Saved function | Restriction |
|---|---|---|
| 0, 1 | BQ/service I2C SDA, SCL | Sole 4.7k pullups R4/R6 are on this sheet |
| 2, 3, 4, 8, 10 | Configurable J5 pins 1, 3, 5, 7, 9 | GPIO2/8 boot straps; external driver required for power loads |
| 5, 6, 7 | MCP4251 CS, SCK, MOSI | Write-only SPI; SDO not allocated |
| 9 | BOOT_N, J23 | Reserved recovery access |
| 18, 19 | Native USB D-, D+ | Preserve flashing/debug/serial |
| 20 | CV_AUTO_N | Open-drain release=manual, low=app; not external UART |
| 21 | D22 or remote J28 LED | Boot-ROM pulses possible, not a safety indication |

Five configurable and ten assigned/reserved GPIOs account for all 15 exposed
module pins. No additional pin is free. INA_ALERT and the dedicated INA assembly
are removed; BQ status is polled rather than using another GPIO. The generic
connector does not provide high-voltage or field protection.

U2 is ESP32-C3-MINI-1-N4X, not a complete Beetle board. It requires regulated
3.3 V; never apply USB 5 V directly. Its antenna clearance, module peak current,
chip revision/ESP-IDF compatibility and actual USB operation remain PCB/firmware
qualification tasks. Moving from Beetle improves mechanical integration, not
the count of available application GPIOs after native USB is reserved.

R30/C32 support reset; J23 exposes reset/boot. The 12 October correction joins
R30.2/C32.1 directly to U2.8/J23.1 (MCU_EN); the isolated RC midpoint in the
preceding snapshot was not detected by ERC. A dedicated exported-netlist test
now checks this connection: `../../validation/test-mcu-reset-netlist.ps1`.
C30/C31 now share one explicitly wired ground return, following the same
capacitor-bank presentation convention as MAIN_CONVERTER. Their supply and
ground connections, component data and the reset circuit are unchanged.
R32/R33 are USB series resistors;
J21 is USB data test access. J20 is 3V3 test access, not an external supply input.
USB_DP/USB_DM are explicit bidirectional hierarchical interfaces to USB_INTERFACE
on the root sheet; GPIO18/19 and the series-resistor paths are unchanged.
R68/R69 on MAIN are removable 0 ohm I2C links. J32 shares the same rail and must
not inject external power. Common GND is not galvanic isolation.

R4/R6 moved from the removed sensing sheet and remain the only shared I2C
pullups. Power-off leakage, BQ-on/ESP-off states, USB plus generator faults,
boot straps and radio-current bursts still require tests. D22 and a remote LED
share one resistor: fit only one unless their combined load is requalified.

[Connector pinout](03_CONNECTORS.md), [voltage selector](05_CC_CONTROL.md),
[USB](09_USB_INTERFACE.md), [logic power](07_LOGIC_POWER_USB_ONLY.md),
[control contract](../BQ25756_CONTROL_CONTRACT.md).
