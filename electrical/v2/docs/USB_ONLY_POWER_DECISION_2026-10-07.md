# V2 USB power and optional battery

Historical 7 October decision. The BQ24074/TPS63031 implementation below was
superseded on 8 October by the user-selected Beetle-style circuit. Read the
[current decision](BEETLE_POWER_DECISION_2026-10-08.md) and
[current sheet explanation](explanations/per_schematic/07_LOGIC_POWER_USB_ONLY.md).

7 October 2026. Approved direction: USB is the only external logic-power input;
a protected 1S lithium cell is optional and charges from USB. No generator AUX
5 V, source mux, or pedal-powered charging of the logic cell remains in scope.
The previous design is preserved in the
[verified archive](../../archive/v2-abandoned-auxiliary-5v-2026-10-07/README.md).

## Proposed power path

`USB VBUS -> BQ24074 IN -> OUT/system rail -> TPS63031 -> 3V3 -> ESP32`

`Protected 4.2 V-charge 1S cell <-> BQ24074 BAT`

USB supplies the system and any available surplus charges the cell. Without
USB, the battery supplies OUT. If USB cannot supply the load, the charger first
reduces charging, then a fitted battery can supplement it. The ESP32 does not
have to consume energy through a charge/discharge cycle of the cell. A cell is
not required for the chip's system power path, but available input power still
limits battery-absent operation. [TI BQ24074 datasheet](https://www.ti.com/lit/ds/symlink/bq24074.pdf).

Keep charging disabled until the exact protected cell, polarity, connector and
NTC are qualified. The current approximately 100 mA charge setting is a design
candidate, not permission to charge an unidentified cell. A 500 mAh example
would need at least five hours at an uninterrupted 100 mA, plus CV taper;
system loading and temperature can extend that time.

## USB current is a separate requirement

The BQ EN pins select an input ceiling; they do not negotiate USB power. A
legacy USB 2.0 data connection requires a low-power startup and host
configuration before higher bus current is assumed. A USB-C receptacle with
two 5.1 kohm resistors does not itself measure the source's advertised current.
[TI USB current discussion](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/1068597/bq25616-usb-sdp-port-detection-and-input-current-limit-clarification),
[TI Type-C current detection](https://www.ti.com/lit/ds/symlink/tusb320.pdf).

The provisional USB100 mode is conservative, but **does not prove USB-only
Wi-Fi startup or operation**. At 4.4 V system voltage, 100 mA and an assumed
90% regulator efficiency, only about 120 mA at 3.3 V remains before other loads
and tolerances. Espressif lists a 350 mA Wi-Fi transmit peak and recommends a
3.3 V supply capable of at least 500 mA. These are rail-capability figures, not
a claim that the radio constantly consumes 500 mA.
[Module datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-c3-mini-1_datasheet_en.pdf),
[ESP32-C3 hardware guidance](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/schematic-checklist.html).

The low-complexity development path is a default-100 mA setting and a clearly
identified 500 mA commissioning setting, used only with a supply whose current
capability is established. A manual setting is not USB enumeration and must
not be sold as automatic PC-port compliance. Final product choices remain:
host-configured current with controlled radio startup, or hardware Type-C /
charging-port detection. Suspend, inrush, dead-cell startup and repeated cable
attachment also need tests. Firmware remains outside this schematic session.

## Keep the existing small 3V3 converter for now

TPS63031 costs EUR 2.11 at one piece in the 6 October pricebook; the inductor
adds EUR 0.35. It maintains 3.3 V on both sides of the cell's falling voltage.
TI specifies up to 800 mA in its stated buck conditions and up to 500 mA in its
stated boost conditions, not 800 mA throughout the discharge range. Bench-test
radio bursts at low cell voltage and the chosen input/output capacitances.
[TPS63031 datasheet](https://www.ti.com/lit/ds/symlink/tps63031.pdf).

A TLV75533P-class 500 mA LDO is a possible cheaper variant, not selected. At
4.4 V in and 3.3 V out, it loses 0.11 W per 100 mA average load, or 0.55 W at
500 mA. Its worst-case dropout at 500 mA reaches 238 mV for the DBV package
over the full specified temperature range: maintaining nominal 3.3 V then
needs roughly 3.54 V at the regulator input, plus the upstream battery-path
drop. Falling out of regulation does not mean an immediate ESP reset, but its
3.0 V minimum supply must still be respected. Package/PCB thermal resistance
also matters; a headline 500 mA rating is not a thermal guarantee.
[TLV755P datasheet, tables 5.4 and 5.5](https://www.ti.com/lit/ds/symlink/tlv755p.pdf).

Illustrative battery runtime, not a product specification: 3.7 V * 0.5 Ah *
90% / (3.3 V * average system current) gives about 5.0 h at 100 mA, 3.4 h at
150 mA, or 2.0 h at 250 mA. Actual cell capacity, aging, cutoff, converter
efficiency and all peripheral consumption must be measured. No precise LDO
runtime penalty can be claimed without a discharge curve and duty cycle.

## ESP32 module versus Beetle

Keep ESP32-C3-MINI-1-N4X for the integrated reference. It permits the USB
connector and antenna to occupy different board edges and exposes 15 GPIOs,
including native USB. This is packaging freedom, not an increase in MCU
capability. The present assignment uses all 15; USB alone uses GPIO18/19.
Beetle exposes 13 I/O while handling USB on board, so there is no automatic
gain of two spare application pins. Removing the old AUX mux frees no MCU
GPIO because source selection was hardware-controlled.

Beetle remains attractive for hand-built variants: the radio, charger,
regulator, USB and buttons are already assembled. Its USB location is fixed
relative to the antenna, and a carrier board still needs appropriate main-bus
protection. Returning to it is not part of this increment. Compare complete
assemblies and assembly effort, not a bare EUR 2.80 module against a finished
development board. [DFRobot Beetle](https://www.dfrobot.com/product-2566.html)
and [archived circuit analysis](../../components/dfr0868-beetle-esp32-c3/power-input-analysis.md).

## Boundaries retained

- USB-only removes the intentional generator-to-logic supply path. It is not
  galvanic isolation: grounds, sense circuitry and converter controls remain.
- USB ESD protection does not protect a PC against every sustained HV fault.
- The main converter can see generator/receiver voltage with the ESP off.
  Default-off behavior must not depend on a pull-up to a dead 3V3 rail.
- BQ25756 CE and resistor-programmed limits are software-overridable; they are
  not an independent last-resort disconnect.
- Keep the BQ gate driver on its verified REGN-derived baseline for study;
  neither the abandoned AUX rail nor always-on USB is an approved DRV_SUP feed.
- No internal dump load. Loss of the receiver can remove electrical braking.

## Cost impact

The active complete-block budget removes the EUR 14-19 one-off AUX allowance
(EUR 11-16 per board at ten units) and reduces the LV allowance by EUR 1 per
board for the removed mux/network. These are planning deltas, not measured
purchasing savings. The optional cell allowance stays visible separately.
Unresolved USB policy and independent main-power protection may add cost.
See the regenerated [cost dashboard](../bom/COST_DASHBOARD.md).
