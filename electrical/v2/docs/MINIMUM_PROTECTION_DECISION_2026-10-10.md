# Minimum-cost protection baseline

10 October 2026. User authorized choosing the cheapest practical protection
approach and proceeding. This freezes the design direction, not a tested safety
rating, purchasing approval or permission to connect a battery.

## Superseding single-input decision

The user subsequently selected [one input fuse at RECTIFIED_RAW](SINGLE_INPUT_FUSE_2026-10-10.md).
F_SRC below is historical comparison only, removed from the base accessory BOM.
F1 remains onboard, F_BAT remains conditional. Unfused energy-rich sources are
not covered by the one-fuse baseline. The rest of this note records the earlier
decision; do not add both quoted fuses automatically or bypass F1.

## Earlier selected approach

- Retain drawn F1 (Littelfuse 0456020.ER) and D1 (SMCJ70A). Do not bypass F1
  or substitute a slower cartridge solely on its current/voltage label.
- No additional active reverse-polarity/backfeed controller, series power diode,
  internal dump or expensive prewired fuse holder in this baseline.
- Use factory axial-leaded ceramic fuses for required external source protection.
  Solder their leads, not ordinary cartridge end caps. Insulate joints and
  support the fuse/cables against pulling and vibration. No clips or holder.
  An accessory PCB is optional; its footprint/copper would need verification.
- Keep existing voltage/current controls and thresholds. Board damage after
  wrong wiring is accepted; no-fire and receiver survival are NOT established.

## Connection rules

| Connection | Baseline requirement |
|---|---|
| Direct receiver battery at J31 | F_BAT in its positive lead close to the battery, before the cable; omit only if documented existing protection covers that cable and relevant faults. |
| Energy-rich DC source at J1 | F_SRC close to the source, before the input cable. Reversed J1 can conduct through D2 before F1. |
| Pedal generator without attached battery | No automatic second input fuse. Retain F1; qualify winding/cable heating and sustainable short-circuit current. |
| Power-station charging port | Verify whether the port can supply fault energy backwards; no blanket F_BAT requirement or exemption. |
| Existing source fuse/BMS | Credit only documented interruption/current/time coverage for the wiring. A BMS label alone is insufficient. |

Do not connect J1 and J8 sources together. A controller-board fuse does not
protect the cable ahead of it. F_SRC and F_BAT are harness identifiers, not
added schematic references. Neither generator current nor fuse omission is
qualified merely by selecting this baseline.

## Selected parts and cost

Lowest-cost verified solder-leaded options among the checked listings, not a
claim of lowest price worldwide. Observed 2026-10-10, EUR excluding VAT,
delivery, insulation, strain relief and assembly. Stock is not reserved.

| Item | Littelfuse MPN | Current | Single | At ten, each | Stock |
|---|---|---:|---:|---:|---:|
| F_SRC | 0324020.MX280P | 20 A | 2.290 | 1.756 | 1188 |
| F_BAT | 0324015.MXP | 15 A | 2.400 | 1.836 | 3297 |

Both: EUR4.69 single / EUR3.592 per pair at ten of each. Only F_BAT: EUR2.40.
Neither is fitted automatically to every setup. See the
[conditional accessory BOM](../bom/protection-accessories.csv).
Parts/support are within the existing BOX harness allowance, not added twice.
The 20 A MX280P is cheaper than the earlier EUR3.25 MXP quote. Both selected
parts have a 125 VDC / 10 kA DC interrupt rating. Higher-current family members
must not inherit that breaking capacity without checking their own ratings.

Sources:
- [F_SRC price/stock](https://www.digikey.fr/en/products/detail/littelfuse-inc/0324020-MX280P/3426109).
- [F_BAT price/stock](https://www.digikey.fr/en/products/detail/littelfuse-inc/0324015-MXP/778519).
- [Manufacturer datasheet](https://www.littelfuse.com/assetdocs/littelfuse_fuse_314_324_datasheet.pdf?assetguid=24deec6d-9c03-4f0e-b612-8499127355f3),
  revised VL 10/29/24: page 1 opening times; page 2 derating/ratings; page 3
  soldering/dimensions; page 4 ordering. Browser read succeeded; direct PDF
  download was refused by the manufacturer. No local PDF/hash is claimed.
  Archive before physical-model acceptance.

## Current and fault limits

The family specifies 25% continuous-current derating in addition to temperature
derating. Reference-temperature screens: input 14.77 / 0.75 = 19.69 A (20 A
selection); output 9.91 / 0.75 = 13.21 A (15 A selection). These only screen
normal operation, not fault clearing. At twice rated current, 15/20 A versions
allow up to 30 seconds to open. Nominal melting I2t is 292/631 A2s respectively
at the 10x-current test. Neither is a precision current limit or fast
semiconductor protector. Lower-current assemblies may need smaller fuses.

- Fuses do not regulate voltage. D1 can clamp above BQ/FET limits; generator
  open-circuit voltage and overspeed remain gates.
- Backfeed below opening current can persist. No reverse-current blocking is
  provided by a fuse. A failed converter or wrong setpoint can damage or
  overcharge a receiver without opening the fuse.
- Opposing energized sources can impose summed voltage across an interruption:
  70 V + 70 V exceeds 125 VDC. No live reversed-connection coverage is claimed.
  Connect with generator stopped, sources isolated where possible and polarity
  measured. Stored-energy and credible fault states still require analysis.
- A loose hot joint can remain below fuse current. Cable, connections,
  insulation, support, enclosure, temperature and clearing coordination matter.

## Implementation and next gate

No KiCad, PCB or firmware mutation in this decision pass. The saved schematic
remains the 146-component/125-net voltage70 checkpoint. These are source-adjacent
harness parts, not an on-board substitute. No custom footprint is created.

Next: trace battery-backfeed/reverse-fault paths and check cable/connector/fuse
clearing coordination, then finish existing handover, thermal and surge checks.
Reopen hardware for a concrete failed check, not blanket optional features.
JP20/JP30/JP31 remain open; no energization or manufacturing release.
