# Three-Wire Selector Checkpoint

Historical snapshot, superseded later on 14 October 2026 by
[the direct digipot checkpoint](DIRECT_DIGIPOT_CHECKPOINT_2026-10-14.md).
The relays, driver and manual headers below are no longer active. Current
schematic and PCB status must not be inferred from this earlier report.

Engineering checkpoint, 14 October 2026. Not approved for power-up or fabrication.
User approved preserving three independent A/W/B terminals for both CC and CV.

## Active Changes

- New active sheet: `kicad/bike-generator-external-controller/cc_selector_3wire.kicad_sch`.
- Root hierarchy now uses `CC_CV_SELECTOR`; GPIO20 is `AUTO_N`.
- MCU notes corrected for dual INA238 monitoring, replacing inherited BQ wording.
- Original `cc_control.kicad_sch` and two-wire `cc_selector.kicad_sch` remain
  unlinked historical studies. Their components are not in the active BOM.
- No PCB synchronization, firmware changes, or V1/V2 source modifications.

## Contact Contract

All four analog headers use pin1=A, pin2=W, pin3=B. J7/J9 go to the converter;
J42/J43 connect the external 100k mechanical CC/CV potentiometers.

| Relay pole | Common / converter | NC / mechanical | NO / MCP42100 |
|---|---|---|---|
| K1 first | 3 / J7.1 | 2 / J42.1 | 4 / U3.8 |
| K1 second | 8 / J7.2 | 9 / J42.2 | 7 / U3.9 |
| K2 first | 3 / J9.1 | 2 / J43.1 | 4 / U3.7 |
| K2 second | 8 / J9.2 | 9 / J43.2 | 7 / U3.6 |
| K3 first | 3 / J7.3 | 2 / J42.3 | 4 / U3.10 |
| K3 second | 8 / J9.3 | 9 / J43.3 | 7 / U3.5 |

All 18 analog nets are distinct in the exported netlist. There are no A/W
straps or permanent analog-terminal connections to board ground.

Q22 is AO3401A: pin2 source=3V3, pin1 gate through R87=100R to GPIO20,
R19=10k gate-source pullup, pin3 drain=common coil supply. Each TQ2-3V coil
has its own 6.8R series resistor R88/R89/R90 and BAT54LT1G flyback
D23/D24/D25. Coil pin1 is positive; pin10 is ground. Flyback pin3 is
cathode, pin1 anode; pin2 is NC. U3 reset and shutdown remain high;
R11 holds chip-select high. Models reuse the accepted physical pin maps in
`../components/v2-cv-control/SELECTOR_MODEL_VALIDATION_2026-10-08.md`.

Steady-state GPIO20 high/released selects manual NC contacts. Low after SPI
initialization energizes all three coils and selects digital NO contacts.
Expected combined coil current is approximately 139mA at 3.3V.

## Verification

Saved-file Konnect / KiCad checks completed after the edits:

- Root ERC: zero errors and warnings; hierarchy interface check: zero issues.
- Selector wire and component connectivity: valid, zero floating endpoints or
  unconnected pins. Short and orphan checks: zero findings.
- Native XML: 95 components / 110 nets.
- Independent `verify-netlist.ps1 -InterfaceMode ThreeWire -SelfTest`: PASS;
  eight broken-connectivity fixtures and one A/W-short fixture rejected.
- Rendered root, MCU and selector inspected. Passive field overlaps corrected;
  A/W paths use direct wires, with labels for the physically separated B poles.
- No active editor/project locks or pending tool sessions at handoff.

Evidence in local scratch: `ext3-final.xml`, `ext3-final-erc.json`, and
`ext3-finish-check-result.json`. Netlist SHA256:
`A01D1DD7BAE5BBC0591DAEF66845723C1A0B5154033B8E3D7D6A3CB01D3BFF46`.

Review PDF and PNGs:
`kicad/exports/three-wire-2026-10-14/external-controller-three-wire-review.pdf`.

Inherited external PCB remains byte-identical to V1, SHA256:
`B6C1248F91D1D950E8D2141FAA64D977A4DDE9D1C13A673F252443F9A13E9F0F`.
It is stale relative to this schematic and must not be fabricated.

## Remaining Gates

Three terminals do not make an arbitrary converter electrically compatible.
Verify analog terminal voltage, current, common-ground requirements and
converter behavior before connecting it. Digital terminals must remain within
0...3V3 relative to board ground and the selected +/-1mA constraint.

The three relays do not switch simultaneously. Mixed mechanical/digital
states, contact bounce, break-before-make feedback gaps, power-down injection
and receiver response remain unqualified. Steady-state manual fallback is
not a guarantee of safe transfer during loss of logic power.

The extra coil load requires USB, protected-cell, RT9080 current/thermal and
brownout validation. Existing JAE connector manufacturing suitability,
source fusing, battery qualification and purchasing gates remain unchanged.
