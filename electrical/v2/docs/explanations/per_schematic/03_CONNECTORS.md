# External low-voltage connectors

[Guide index](../README.md). Page 3, CONNECTORS. Updated 8 October 2026.

## One configurable GPIO connector

J5 now consolidates five application GPIOs onto one 2x5 header. The old
dedicated Hall/action/PWM/READY assignments and J22 are removed. No firmware
profiles have been implemented; buttons, cadence sensing, external-load PWM
and READY are future examples, not fixed electrical roles.

| J5 signal pin | ESP GPIO | Adjacent ground pin | Board network |
|---|---|---|---|
| 1 | 2 | 2 | 1k series; 10k pull-up on MCU side |
| 3 | 3 | 4 | 1k series |
| 5 | 4 | 6 | 1k series |
| 7 | 8 | 8 | 1k series; 10k pull-up on MCU side |
| 9 | 10 | 10 | 1k series |

GPIO2 and GPIO8 are boot-strapping pins. Their pull-ups do not make arbitrary
external loading safe during reset/download. Accessories must preserve the
required boot states; disconnect them for recovery if necessary. All pins are
3.3 V logic, not 5 V tolerant, and none is a load-power output. Series resistors
are not complete ESD, hot-plug or external-voltage protection.

Five GPIOs are exposed in this checkpoint. An additional internal CV range
selector could consume one later; that decision is not implemented or approved.

## Status indicator and service

GPIO21 drives D22, a red 3 mm Kingbright WP710A10LID, through R35 (1k).
J28 provides the same current-limited signal for a remote enclosure LED:
pin 1 anode, pin 2 cathode. Fit D22 OR the remote LED, not both on the shared
resistor. Boot ROM UART activity may flash it; this is not a safety indicator.
The separate TP4057 charge-status LED still reports battery charging.

J3 remains the shared I2C service interface: pin 1 3V3, pin 2 GND,
pin 3 SDA, pin 4 SCL. It is not additional configurable GPIOs. Internal buses,
USB/recovery connectors and the spare digipot analog interface remain separate.
Never connect an external source that back-powers 3V3 or the bus.

J32 on the main-converter page now accesses that same bus on the BQ side of
removable R68/R69: pin 1 3V3 reference (NO external power), 2 SCL, 3 SDA,
4 INT, 5 CE, 6 GND. CE bench drive needs current limiting, for example an
external 1k series test lead. It is not a guaranteed emergency stop because
register settings can change CE's function. Removing the two data links does
not disconnect J32's 3V3 reference or the common ground.

## Remaining qualification

Connector family, cable length, accessory power budget, ESD and hot-plug behavior
remain to be specified. An external dump lamp needs its own rated driver and
power protection; there is no internal dump. No external module is compatible
merely because its connector fits.

See [MCU allocation](04_MCU_MODULE.md) and
[approved control requirements](../../CONTROL_REWORK_DECISIONS_2026-10-08.md).
