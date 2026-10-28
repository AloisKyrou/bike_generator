# Direct digipot schematic checkpoint, 14 October 2026

## Decision applied

The user accepts a direct prototype-style MCP42100 interface rather than a
complex automatic mechanical/digital selector. Three DPDT relays and their
approximately 139 mA coil load are removed, not replaced by a falsely described
six-transistor fail-to-manual arrangement. Unpowered mechanical fallback is no
longer part of this variant's active circuit.

Removed physical references: K1, K2, K3, Q22, R19, R87, R88, R89, R90, D23,
D24, D25, J42, J43. Removed GPIO20/AUTO_N hierarchy connection; GPIO20 is NC.
Kept MCP42100, C4, R11, two independent three-pin output headers, USB/1S/ESP32
and both INA238 monitors. No new part, package or supplier was introduced.

CC_CV_DIGIPOT replaces CC_CV_SELECTOR in the architecture. The child filename
is unchanged. Its content is compact A4, with six direct horizontal signal
wires rather than relay/contact labels. SPI labels face away from wires and
connector fields no longer collide. Root and MCU notes describe the actual
direct architecture and its limitations.

## Evidence

- 81 schematic components, 84 exported nets, nine sheets.
- Full-hierarchy ERC: 0 errors, 0 warnings.
- Direct netlist contract: pass; eleven missing-connection fixtures and one
  intentional A/W-short fixture are rejected.
- Modified root, MCU and digipot sheets: no floating wires, unconnected
  connectable pins, orphan items, merged named nets or symbol-overlap findings.
- Hierarchy pin validation: zero mismatches; annotation dry run: no changes,
  duplicate references, unresolved symbols or unreadable child sheets.
- Root, MCU and digipot raster renders inspected, including note/page bounds.
- Working BOM regenerated from native KiCad-exported XML, not hand-counted.
- Exported-netlist comparison against the preceding checkpoint preserves all
  non-selector connectivity partitions and all 81 retained values/footprints.

Evidence scratch: `ext-direct-current.xml`, `ext-direct-check-result.json`,
`ext-direct-erc.json`, `ext-direct-*.png` under repository `.konnect-scratch/`.
Review PDF: `kicad/exports/direct-digipot-2026-10-14/`.

These are saved schematic checks only. PCB synchronization/routing/DRC belong
to the separate PCB-owner pass; no fabrication or energization approval is made.

## Important behavior

Both /RS and /SHDN remain high, SPI /CS has its existing 10 kOhm pull-up.
Power-on sets both wipers to 0x80, while valid powered idle operation retains
the last written code. Neither behavior establishes a safe output for an
unknown converter. Power logic and initialize before converter enable; stop
converter before logic power loss. Prevent terminal back-power when U3 is off.

Datasheet basis and exact pin contract are in [CONTROL_AND_SENSING.md](CONTROL_AND_SENSING.md).
The receiver must have independently bounded converter voltage/current; INA
readback is not protection against fast excursions. The optional battery does
not remove the need to handle depletion or disconnection safely.
