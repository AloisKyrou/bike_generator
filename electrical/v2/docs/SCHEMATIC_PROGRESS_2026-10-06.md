# V2 First Schematic Increment

Date: 2026-10-06. Status: **provisional schematic foundation, not buildable or released hardware**.

Historical snapshot, superseded later the same day by the
[LV2 checkpoint](SCHEMATIC_LV2_PROGRESS_2026-10-06.md). In particular, J20 is
now a test header, NOT an external 3.3 V supply input. The descriptions below
record the first increment only; use the LV2 report for the current circuit.

## Saved Design

The active root is [bike-generator-controller-v2.kicad_sch](../kicad/bike-generator-controller-v2/bike-generator-controller-v2.kicad_sch). It now contains nine sheets, including a real module-support circuit and explicit unfinished power-stage boundaries.

- Replaced the active Beetle sheet with `mcu_module.kicad_sch`, using official Espressif U2 `ESP32-C3-MINI-1-N4X` and its unchanged vendor footprint. The old `mcu.kicad_sch` remains preserved but unreferenced, not an active assembly variant.
- Added C30 10 uF and C31 100 nF decoupling, R30 10 kOhm / C32 1 uF EN timing, and R31 10 kOhm BOOT pull-up. Values are initial design choices, not a qualified reset supervisor or supply transient design.
- Added J20 **regulated 3.3 V bench input only**. The module cannot run from AUX_5V directly. There is currently no generator-powered MCU supply or 1S backup battery path.
- Added native USB data through R32/R33 22 Ohm series resistors to J21. This is a service signal header, **not a protected USB port**. No VBUS, USB connector, ESD device, isolation, or generator-fault containment is implemented.
- Added J22 external PWM request and READY input through R34/R35 1 kOhm, with R36/R37 10 kOhm pull-downs. These are logic signals only. Series resistors are not field protection or a power driver. There is **no internal dump load, switching stage, or DNP dump option**.
- Added J23 EN/BOOT service header.
- Added `lv_power_usb_tbd.kicad_sch` with J24 as the explicit AUX_5V boundary. Regulator, protected USB power, source mux, charger, backup supply and independent safe enable remain marked **NOT IMPLEMENTED**.
- Added `main_converter_tbd.kicad_sch`, marked **NOT IMPLEMENTED**. No converter IC or power envelope is frozen.

Inherited LM5164 auxiliary generation, INA238/shunt sensing, external converter controls and common input protection remain present. The DC J1 and AC J8/D2 assembly options are identified; never energize both inputs. A DC-only build may omit J8/D2, but must retain the common fuse/sensing/protection path and qualify source polarity protection. J2 is the external converter **input** supply, not a receiver output.

The copied power path is not a validated 80 V design. Inherited 70 V continuous restrictions, transient risks and thermal limits remain. The 400 W architecture target is not a qualified continuous rating.

## GPIO Allocation

These are the actual saved U2 connections, not a proposed firmware configuration.

| GPIO | Physical pin | Saved signal | Role / qualification |
| --- | --- | --- | --- |
| 0 | 12 | I2C_SDA | Sensor bus |
| 1 | 13 | I2C_SCL | Sensor bus |
| 2 | 5 | INA_ALERT | Boot strap: qualify reset interaction |
| 3 | 6 | GPIO3_PWM | External accessory PWM request |
| 4 | 18 | GPIO4_HALL | Existing cadence interface |
| 5 | 19 | POT_CS | Existing SPI digipot |
| 6 | 20 | POT_SCK | Existing SPI digipot |
| 7 | 21 | POT_MOSI | Existing SPI digipot |
| 8 | 22 | GPIO8_ACTION | Boot strap: qualify attached controls |
| 9 | 23 | BOOT_N | Boot strap / service access |
| 10 | 16 | GPIO10_READY | External accessory active-high READY |
| 18 | 26 | USB_DM_MCU | Native USB D- |
| 19 | 27 | USB_DP_MCU | Native USB D+ |
| 20 | 30 | POT_SHDN | Existing digipot shutdown command |
| 21 | 31 | UART_TX | Reserved UART / boot log signal |

All 15 GPIO are allocated. GPIO21 may be reassigned only after checking boot activity and debug needs. Final power-stage controls may require reassignment, removing the legacy SPI digipot, or an expander. This module substitution does not create unlimited spare pins. POT_SHDN is not an independent hardware safety gate.

| Interface | Pin 1 | Pin 2 | Pin 3 |
| --- | --- | --- | --- |
| J20 | Regulated +3V3 input | GND | n/a |
| J21 | USB D+ | USB D- | GND |
| J22 | EXT_PWM output | EXT_READY input | GND |
| J23 | MCU_EN | BOOT_N | GND |
| J24 | AUX_5V boundary | GND | n/a |

J20-J24 are generic logical interfaces without selected connector MPNs or assigned footprints. Use an isolated bench source; common GND is not galvanic isolation. A receiver, generator or computer must not be attached on the assumption that these unfinished interfaces are protected.

## Reference and Model Evidence

Module physical pin numbering, footprint pads and top-view orientation were checked against the official Espressif datasheet v2.2. All 53 pin numbers match, including 22 GND leads and 14 NC leads. The footprint has 61 copper pad objects because pad 49 contains nine pieces. See [manufacturer evidence and pin map](../../components/esp32-c3-mini-1-v2/README.md).

Vendor symbol and footprint were downloaded unchanged from pinned Espressif commit `dd76561812ab300351234ba6e0ec1295641796f0`. Disposable placed instances were rendered and inspected. Konnect cannot currently place this footprint's custom-shaped pad through its typed placement handler. Native KiCad `pcbnew.FootprintLoad`, `BOARD.Add`, and `SaveBoard` were used only for a disposable validation board, preserving all 61 pads and the chamfered custom pad. No custom library model was authored. Real V2 schematic mutations used Konnect throughout.

The main-stage study names TI BQ25756EVM as a cost-sensitive candidate and ADI DC2456A/LTC3779 as the high-voltage comparator. BQ25756EVM is a 55 V / 10 A reference, not an 80 V controller-board design. BQ25756 forward CV depends on an external feedback divider; its narrow I2C feedback adjustment is not universal wide-range output voltage control. See the [TI reference archive](../../components/ti-bq25756/README.md) and [architecture specification](CONTROLLER_V2_INTEGRATED_SPEC.md). No unchecked custom BQ symbol or pin map was instantiated.

## Saved Verification

Final exports were regenerated at approximately 08:28 UTC on 2026-10-06:

- Root-hierarchy ERC: **0 errors, 0 warnings** using Konnect `run_erc`.
- Independent native KiCad CLI ERC on the final saved nine-sheet hierarchy also found **0 violations**, including excluded violations. Its [independent report](../kicad/exports/review-2026-10-06/controller-v2-independent-erc.json) records four ignored check categories: `single_global_label`, `four_way_junction`, `simulation_model_issue`, and `footprint_filter`. Structured comparison confirms the ERC configuration is unchanged from V1; no new suppressions were added. This is not a claim that every possible ERC check was enabled.
- Hierarchical pin consistency: **0 issues**.
- Module connectable-pin validation: **0 unconnected pins**; intentional NC pins remain NC.
- Module shorted-net check: **0 shorts**.
- Module geometric overlap check: **0 overlaps**, 34 resolved component bounds and no unresolved bounds.
- Fresh native KiCad XML netlist export: no annotation warnings; **73 components and 66 nets**.
- Focused saved-netlist assertions passed for all 53 U2 pins, all connector mappings, 22 grounded module leads, 14 NC leads, unique references, no active Beetle/J6, and AUX_5V separated from +3V3.
- Root, module, input path and unfinished LV/main sheets were rendered and visually inspected. Power flags and connector value overlaps found during review were corrected.

Review outputs: [nine-sheet PDF](../kicad/exports/review-2026-10-06/controller-v2-first-increment.pdf), [ERC JSON](../kicad/exports/review-2026-10-06/controller-v2-erc.json), [KiCad netlist](../kicad/exports/review-2026-10-06/controller-v2.net), and [XML connectivity](../kicad/exports/review-2026-10-06/controller-v2.xml). These generated review artifacts are local/ignored, not manufacturing files.

ERC cleanliness is only a connectivity check. It does not validate omitted circuits, power sequencing, safety, boot behavior, thermal design, regulator stability or charging behavior.

## Tool Provenance

Konnect 0.12.1 and KiCad 10.0.6 were used. Dynamic tool discovery in the client did not expose loaded toolsets, so a local MCP client used the installed official `konnect.exe --client codex` stdio transport, `tools/list`, and `tools/call`. File-backed schematic handlers saved directly to disk; no live KiCad IPC socket was available. No plugin installation or user config changes were made. No misleading `save_project` call was used on the open baseline PCB.

Tool schemas, timestamped MCP responses, pre-edit PDF snapshot, render images and focused assertion scripts are retained under `.konnect-scratch/v2-2026-10-06/`. Project-scoped Konnect rules now explicitly supersede the inherited Beetle rule for active V2 U2.

## Remaining Gates

1. Select and qualify the converter family, real input/output envelope, bounded wide-range CV control, current control, independent hardware inhibit and receiver-disconnect behavior.
2. Design the regulated 3.3 V supply, source mux, optional 1S backup/charger, protected USB input and fault containment. Qualify startup and brownout behavior before generator operation.
3. Select physical service/accessory connectors; add appropriate ESD, level and cable-fault protection. Qualify external load defaults, boot pulses, PWM capability and safe READY behavior.
4. Qualify GPIO2/8/9 straps with attached circuits, EN timing, supply transients, and compatible ESP-IDF support for N4X chip revision 1.1. Firmware remains out of scope now.
5. Design receiver-side sensing/protection, reverse blocking, charging profiles and termination. Motor compatibility, generator overshoot, bridge cooling and polarity protection remain engineering tests, not configuration-only guarantees.
6. Complete component selection, RF keepout, thermal design, layout and custom-pad-safe synchronization before any PCB work or fabrication review.

**V1 and the V2 PCB were not edited. The V2 PCB intentionally remains the copied V1 baseline and is out of sync with the new schematic. No manufacturing output, firmware change, board order or safety approval was produced.**

Independent final hash verification confirmed all 35 V1 non-Markdown migration-manifest files unchanged and the V2 PCB byte-identical to the V1 PCB baseline.
