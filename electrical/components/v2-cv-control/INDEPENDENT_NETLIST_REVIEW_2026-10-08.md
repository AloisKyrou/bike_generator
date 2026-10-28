# Independent CV netlist review

## Final frozen export

The owner's final post-cosmetic electrical export was independently checked again:
`electrical/v2/kicad/exports/review-adaptive-2026-10-08/controller-v2.xml`,
export time `2026-10-08T18:55:50`, SHA256
`4C34E5957BE489FF833A1DFBE8B8047BD07FE9264C5FAA5A74B9820D31B2F5DB`.
All 46 static endpoint assertions pass. All minor metadata findings below
are corrected in this candidate: exact descriptions and the three1% values
were manually inspected. No remaining deterministic CV wiring finding.
The owner confirmed this is the final post-cosmetic frozen XML, with no further
schematic changes planned. It supersedes the earlier `B1856C68...` candidate
hash and intermediate ERC-cleanup exports. Any later electrical change requires
another run. Dynamic and fabrication gates are unchanged; this report does
not claim the separately run native ERC results as its own verification.

## Earlier interim review

Reviewer did not mutate KiCad. Read-only review of the schematic owner's
`adaptive-interim.xml`, export time `2026-10-08T18:36:57`, SHA256
`1EAF8F1D1BAC594D8B0E5145A192DA5EE041F3CBEAF569F968B9AD2B35F37DB5`.
This is an interim snapshot, not the final frozen source or fabrication approval.

## Findings

No deterministic CV endpoint, polarity or selected-value error was found.
46 automated assertions pass in `electrical/v2/docs/calculations/cv-netlist-audit.ps1`,
following a separate manual inspection of the structured XML and manufacturer
pin maps cited in `MCP4251_SELECTOR_2026-10-08.md`.

Minor metadata corrections sent to the owner before freeze:

- D23/D24 descriptions retain SOT323 from library symbols despite correct
  SOT23 footprint and exact onsemi MPN. Correct the descriptions.
- K1 description retains Omron while selected MPN is Panasonic TQ2-3V.
- Q21 description retains the generic 2N7002 current rating. Exact selected
  NX6008NBKR, datasheet and footprint are correct; do not treat inherited
  description ratings as the selected component's specifications.
- Declare 1% for R88, and preferably R87/R19, matching the calculation's
  tolerance assumptions. Values and nets are already correct.

## Checked connections

K1 COM3 is FB; NC2 selects R67/RV2 to BQ FBG. NO4 selects R84 to Q21 drain3.
Q21 source2 joins K1 NO7. K1 COM8 joins MCP P1A7/P1W6, R85 and D24 junction3.
K1 NC9 and MCP P1B5 are grounded. The permanent upper resistor R66 remains
249k from BQ_OUT to FB, independent of selector state.

Q22 AO3401A source2 is3V3, drain3 isCV_DRIVE. CV_DRIVE joins Q21 gate1 and
R88.1, before the6.8ohm coil resistor. R88.2 feeds K1 coil1 and D23 cathode3;
K1 coil10 and D23 anode1 are grounded. D23 pin2 is deliberately unconnected.
This is the correct flyback polarity for a high-side coil driver.

GPIO20 is U2 pad30, linked only through R87=100R to Q22 gate1. R19=10k pulls
that gate to3V3. Low selects digital; high-impedance/released selects manual.
There is no pull-down left on this gate. Actual firmware reset/boot behavior
is not established by an electrical netlist and remains a scope-test gate.

D24 BAT54SLT1G pin1 isGND, pin2 is3V3 and pin3 isMCP A/W: correct dual-rail
clamp polarity. R85=110k is A/W-to-GND; R86=10k is3V3-to-GND.

U3 is MCP4251-503E/SL. Pads11/12/14 tie3V3, pad4GND, pad13 deliberately NC.
The documented NC/WP ambiguity on pad11 is compatible with its VDD tie.
SPI CS1/SCK2/SDI3 go to ESP GPIO5/6/7; CS has its10k pullup.
Only channel0 A8/W9/B10 reaches J7 pins1/2/3; connector label says50k.
Obsolete channel1 external header J9 is absent.

## Limits and rerun

This checks static exported connectivity and selected fields, not relay timing,
analog clamp peak voltage, loop stability, thermal behavior, firmware, footprint
mechanical acceptance or PCB layout. The schematic owner separately validated
the stock-compatible relay/diode models on a scratch project. Receiver-safe
brownout and intentional handover remain unqualified until the documented tests.

Run against the final owner export after freeze:

```powershell
powershell -NoProfile -File electrical/v2/docs/calculations/cv-netlist-audit.ps1 -Netlist <final-export.xml>
```

The script parses XML only. It does not call KiCad or modify any source.
