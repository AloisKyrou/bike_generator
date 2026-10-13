# USB connector data and power

[Guide index](../README.md). Saved page 8, USB_INTERFACE.

## Two paths in one connector

J27 USB-C carries 5 V power to the logic-power sheet and D+/D- data to the
ESP's native GPIO19/GPIO18 USB pins through U8 and R32/R33. USB power does
not enter the ESP module directly. U8 is an ESD protector, not the USB
controller. R49/R50 provide the connector's sink-identification resistors.
J25 is VBUS test access, not a second intended external logic-power source.

USB_DP/USB_DM now leave this sheet through bidirectional hierarchical labels
and visible root-sheet wires to the MCU. The former global signal labels are
removed without changing their component connections. J25's VBUS_USB net and
nearby PWR_FLAG are explicitly named; the flag declares incoming power to ERC
and provides no physical protection.

The native ESP32-C3 Serial/JTAG interface supports flashing, serial transmit/
receive and debugging with suitable tools/firmware. It is not a general-purpose
USB-OTG interface. Reset/boot recovery must remain accessible if software
misconfigures USB or enters an incompatible sleep state.
[Espressif USB guide](https://docs.espressif.com/projects/esp-idf/en/stable/esp32c3/api-guides/usb-serial-jtag-console.html).

## Why this is a separate page

Connector, cable-facing protection and USB data are easier to review together.
The adjacent logic-power page explains current allocation, battery charging
and 3.3 V regulation without mixing them with connector pin duplication.

## What remains unfinished

Define permissible USB source current and verify no-cell boot, radio bursts,
hot-plug and suspend. The Beetle-style path has no combined system/charge
input-current limiter; JP20 charging permission is not USB authorization.
Verify battery-powered data-line behavior with an unpowered PC or VBUS absent.
ESD protection does not provide galvanic isolation or contain every sustained
generator-voltage fault through shared grounds and sensing/control circuits.

Flashing/debugging is a V2 completion requirement, not removed functionality.

12 October verification: dedicated `test-usb-service-netlist.ps1` checks the
saved connector/ESD/series-resistor/GPIO18/19 paths and J23 recovery access.
The serial interface here is native USB CDC-ACM, not a physical UART bridge.
GPIO20/21 remain selector/LED; an external UART would use configurable J5 pins
and firmware mapping. Opening JP20 only disables cell charging: it does not
disconnect USB data, flash or debug, and is not automatic host protection.
See the [current closure record](../../PRELAYOUT_CLOSURE_2026-10-12.md).

The correct net connections are present; physical operation and protection
still require validation. See [logic power](07_LOGIC_POWER_USB_ONLY.md) and
[USB fault review](../../USB_AND_LV_FAULT_REVIEW.md).
