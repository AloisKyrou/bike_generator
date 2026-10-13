# V2 LV2 Schematic Checkpoint

2026-10-06, 12:03 UTC. Provisional schematic study, **not a build or fabrication release**. This checkpoint supersedes the first increment's requirement for a separate 3.3 V bench input. It does not complete the product's wake, safety or main conversion functions.

## Saved Circuit

The previously empty LV sheet now contains a wired USB/AUX priority mux, 1S backup charger with power path, fixed 3.3 V buck-boost regulator, and USB-C data/ESD interface. The upstream LM5164 circuit is reused unchanged. Closing service jumper JP21 enables the new regulator; opening it pulls EN low. This is an interim service arrangement, not the intended automatic wake workflow.

J20 is now a 3.3 V test header only, supplied by U7. Its old external-input power flag was removed. J21 and J25 are USB data/VBUS test points, not second host or parallel power inputs. USB-C J27 routes both connector orientations through U8 to the ESP32's existing 22 ohm data resistors. No firmware or MCU GPIO assignment changed.

The main converter remains physically absent. Its on-sheet note now records the selected BQ25756 study, 55 V input and output working ceiling, provisional 15 A input / 10 A output sizing, and the missing independent protection. No custom symbol was created, no unverified BQ pin map was instantiated, and no internal dump hardware was added.

## Added Components

Exactly 33 new non-power-symbol component references were placed relative to the first increment:

| References | Quantity | Value / Candidate MPN |
| --- | ---: | --- |
| U5 | 1 | TI TPS2116DRLR source mux |
| U6 | 1 | TI BQ24074RGTR charger / power path |
| U7 | 1 | TI TPS63031DSKR fixed 3.3 V buck-boost |
| U8 | 1 | ST USBLC6-2SC6 USB ESD array |
| Q1 | 1 | Nexperia 2N7002,215 mode inverter |
| L2 | 1 | Bourns SRN4018-2R2M, 2.2 uH |
| J27 | 1 | GCT USB4105-GF-A-120 USB-C receptacle |
| J25, J26 | 2 | VBUS test header; qualified protected 1S / NTC / GND connector, exact MPN pending |
| JP20, JP21 | 2 | Open charge-enable / regulator-service-enable jumpers, physical implementation pending |
| R40 | 1 | 287k 1%, 0805 |
| R41, R47, R48 | 3 | 100k, R41 1%, 0805 |
| R42, R43 | 2 | 47k, 0805 |
| R44 | 1 | 1M, 0805 |
| R45 | 1 | 2.87k 1%, 0805 |
| R46 | 1 | 8.87k 1%, 0805 |
| R49, R50 | 2 | 5.1k 1% USB CC Rd, 0805 |
| C40, C41, C43, C49, C50 | 5 | 100 nF / 10 V, 0805 |
| C42 | 1 | 1 uF / 10 V, 0805 |
| C44, C45, C46, C47, C48 | 5 | 10 uF / 10 V, 0805 |

Exact passive manufacturers, dielectric, effective capacitance under bias, connector footprints and jumper implementation remain procurement/assembly gates. Existing J24 was retained and relabeled AUX 5 V test. Supply symbols and two new ERC power flags are not BOM hardware. No PCB was synchronized; the copied board remains intentionally out of sync.

## Operating Intent

- Valid USB has priority. TPS2116 ST is pulled high for VIN1 selection; Q1 inverts it to BQ24074 EN2. EN1 is grounded, selecting USB 100 mA mode when USB is active and resistor-programmed input mode for AUX.
- The 287k / 100k priority divider sets a nominal 3.87 V USB threshold. The broad PR1 reference tolerance plus resistor tolerance gives approximately 3.5-4.25 V, not a precision 4.35 V USB-valid detector. A weak USB source can remain selected below the charger's useful input range while the backup cell supplements the system. USB-brownout/AUX-failover behavior is an explicit qualification gate.
- AUX input current is approximately 1610 / 2870 = 561 mA nominal; 1720 / (2870 x 0.99) = 606 mA worst-case programming calculation. This leaves margin below the upstream regulator's nominal rating, but does not prove its thermal performance.
- Charge current is approximately 890 / 8870 = 100 mA nominal; 975 / (8870 x 0.99) = 111 mA worst case. JP20 open pulls CE high, disabling charge. Charging requires a specifically qualified protected 4.2 V Li-ion pack and valid 10k NTC. No NTC-bypass resistor was fitted.
- BQ24074 ITERM and TMR are intentionally open for manufacturer defaults; unused CHG/PGOOD outputs have no-connect flags, not fabricated status wiring. System loading is on OUT rather than BAT to preserve charge termination behavior.
- TPS63031 uses fixed-output feedback tied to VOUT, 2.2 uH inductor, 10 uF input plus VINA bypass and two 10 uF output capacitors. PS/SYNC is grounded for power-save operation. Its switch-current rating is not a 1 A output guarantee: manufacturer capability depends on cell voltage and operating mode. ESP radio peaks, brownout and low-cell cutoff need measurement with the selected cell and effective capacitance.
- A 100 mA USB charger-input setting plus mux/divider overhead is not a complete USB-compliance claim. Battery-free USB boot/radio operation is not guaranteed; battery supplement may be required. Enumeration, suspend and authorized current behavior remain firmware/hardware qualification work.

## Evidence And Verification

All actual KiCad mutations used Konnect MCP file-backed tools via the official Konnect 0.12.1 executable's MCP `tools/call` interface. Tool discovery/schema checks preceded use; each mutation returned saved-file readback. No generic source-file editing, PCB save, library simplification or custom model creation was used. The pre-LV snapshot is local under `.konnect-scratch/v2-2026-10-06/`.

Manufacturer PDFs, model provenance, all-pin CSVs and SHA-256 hashes are in [the LV evidence archive](../../components/ti-lv-power-v2/README.md). Five power models cover 41 leads; USB models cover another 23 logical pins, four physical shield tabs and two mechanical locating holes. Scratch instances were placed, saved, queried and rendered before active use. The local ST PDF is explicitly the older manufacturer Rev. 2 Farnell mirror; current official Rev. 7 pin/package tables were cross-checked and revision differences documented. Current ST local downloads timed out.

Saved hierarchy ERC after wiring: **0 errors, 0 warnings** under the inherited project settings. The unchanged ignored categories are `single_global_label`, `four_way_junction`, `simulation_model_issue` and `footprint_filter`; this is not an all-checks certification. Manufacturer package acceptance, hardware safety, thermal feasibility and layout are independent release gates.

The saved XML was inspected for all U5/U6/U7 pins, hidden/stacked power pins and exposed pads, J20's actual +3V3 connection, and all J27/U8 USB connections. USBLC6 internally connects each paired I/O pin; exported PCB nets are separate before/after the device as expected, not a broken D+/D- path. Root, MCU, LV and main-stage renders were visually inspected after the last connectivity change.

- [Nine-sheet review PDF](../kicad/exports/review-lv2-2026-10-06/controller-v2-lv2.pdf)
- [Native KiCad XML netlist](../kicad/exports/review-lv2-2026-10-06/controller-v2-lv2.xml)
- [Independent native KiCad hierarchy ERC](../kicad/exports/review-lv2-2026-10-06/root-independent-erc.json): nine sheets, zero violations; [independent Konnect ERC](../kicad/exports/review-lv2-2026-10-06/root-konnect-erc.json): zero errors/warnings. LV and MCU short checks returned zero reported shorts.
- Local final renders: `.konnect-scratch/v2-2026-10-06/lv2-final.png`, `mcu-lv2-final.png`, `root-lv2-final.png`, `main-lv2-final.png`.

The root review added [48 manufacturer endpoint/MPN assertions](validation/test-lv-power-netlist.ps1), which pass against the 106-component XML. The only subsequent schematic edit moved the U8 reference text away from its VBUS label; PDF/XML/render exports were refreshed without a connectivity change.

## Remaining Gates

Automatic source wake, button timing, MCU shutdown request, forced-off behavior and battery-off leakage are not implemented. No existing GPIO was silently reassigned to create a wake claim.

The 5.5 V mux/regulator operating bounds require upstream transient and fault containment. USBLC6 provides ESD suppression, not sustained overvoltage protection or HV-to-PC isolation. VBUS OVP, CC protection, unpowered USB data behavior, fault current and grounding remain unresolved. Do not connect a valuable PC to a generator-powered prototype before that review.

BQ25756 power-stage CAD/model acceptance, feedback-range architecture, output sensing and disconnection, receiver protection, independent OVP/OCP/thermal shutdown, and actual worst-case power calculations remain unfinished. The BQ CE/ICHG/ILIM hardware inputs can be disabled by registers and cannot be claimed as independent firmware-fault protection. The old MCP42100 control circuit is preserved, not approved for direct BQ feedback use.
