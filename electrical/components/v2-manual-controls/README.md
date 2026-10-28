# V2 manual controls and indicator candidates

Research date: 8 October 2026. This directory is sourcing and calculation
evidence, not a fabrication release. KiCad changes belong to the schematic
build owner; no KiCad source was modified by this research pass.

## Current ceiling proposal

Use Bourns `3296W-1-503LF`, 50 kohm, with a fixed 5.49 kohm 1% series
resistor (`Yageo RC0805FR-075K49L`, 0805 candidate).

```text
BQ ICHG pin9 -- fixed 5.49k -- RV pin3 (CW end)
                             RV pin2 (wiper) --+
                             RV pin1 (CCW) ---+-- PGND
```

Clockwise moves the wiper toward pin3, reducing resistance and increasing the
current ceiling. The pin1-to-pin2 connection makes a lost wiper contact revert
to the full track resistance, hence a lower ceiling. It does not protect against
a broken track, broken solder joint, shorted fixed resistor, or every fault.
Place the fixed resistor next to ICHG. Never put a zero-ohm trimmer endstop
directly between ICHG and ground: that disables the hardware current limit.

TI SLUSEN5A, section 5.3 p7 specifies **RICHG maximum 100 kohm**, whereas
RILIM_HIZ maximum is 50 kohm. Section 5.5 p8 gives KICHG min/typ/max
48/50/52 A.kohm at its listed 5-milliohm shunt and programming-resistor
conditions. Section 6.3.4.1.1 describes resistor and register current limits.
These values come from the [TI datasheet](../ti-bq25756/bq25756.pdf),
[official URL](https://www.ti.com/lit/ds/symlink/bq25756.pdf).

Our arithmetic, reproduced by `node current-ceiling.mjs`:

| Quantity | Result |
|---|---:|
| Nominal full clockwise ceiling | 9.107 A |
| Nominal full counterclockwise ceiling | 0.901 A |
| High-current endstop using K=52, -1% fixed R, -1% shunt | 9.664 A |
| Same endstop including worst TCR magnitudes over -55..155 C resistor temperatures | 9.934 A |
| Largest total programming resistance, +1% fixed R and +10% pot | 60.545 kohm |
| Worst low-current endstop with K=52, -1% fixed R/shunt, -10% pot | 1.041 A |

This intentionally gives margin below the provisional 10 A sizing target.
It is NOT a continuous board rating or a guarantee of exact 1 A adjustment on
every unit. K accuracy is specified at listed test points, not throughout the
whole trimmer range. Transients, aging, layout and thermal behavior
remain qualification work. Endstop resistance cannot be zero or exceed 100 kohm
under the stated initial tolerance model.

**Separate endstop limits do not bound combined power.** For example, 53 V
and 9.9 A allow about 525 W output, exceeding the 400 W input architecture
target before losses. A 15 A input limit at 55 V permits 825 W input. These
current calculations therefore do not prove both manual controls can be at
maximum without damaging the board. Conservative commissioning limits,
independent power/thermal controls, or full-envelope stage qualification remain
mandatory before that claim, especially with the ESP absent.

TCR evidence: Vishay WSL25125L000FEA uses **110 ppm/C component TCR**, not
the advertised <20 ppm/C alloy-only figure. Archived
[`vishay-wsl.pdf`](../ti-bq25756/power-stage/vishay-wsl.pdf), document30100,
23-Nov-2023 p2, specifies this for 5..6.9 milliohm parts, measured -55..155 C.
The Yageo exact-part [manufacturer specsheet](https://yageogroup.com/component-documentation/download/specsheet/RC0805FR-075K49L)
gives 100 ppm/C for the fixed resistor. `current-ceiling.mjs` uses independent
worst negative drift magnitudes over that resistor-temperature interval, with
25 C reference. This is a design bound using the stated TCR model, not approval
to operate the whole board at 155 C. KICHG=52 is retained from the controller's
specified test conditions; interpolation and thermal qualification remain open.

Cold startup can use this hardware ceiling. Loss of ESP power after host writes
does not necessarily restore all BQ registers: input limit retention and watchdog
behavior must be handled by the main control contract. This pot remains a
ceiling in app mode, not an automatic switch between two independent current
settings.

## Trimmer model evidence

Manufacturer document: Bourns 3296, REV.02/26, p1 dimensions/electrical diagram,
p2 revision marker. [Official PDF](https://www.bourns.com/pdfs/3296.pdf), archived
as `bourns-3296-rev-02-26.pdf`. The web search index reported the older 07/24
revision; the actual downloaded page2 footer, independently inspected by the
schematic owner, takes precedence.

The family is sealed THT cermet, 25-turn nominal, +/-10%, 0.5 W at 70 C.
It is a setup trimmer, not a repeatedly operated front-panel control. Select
the voltage-trimmer resistance after the independent manual CV divider is
calculated; the same W package can be reused for another standard value.

Read-only Konnect queries confirmed `Device:R_Potentiometer` and
`Potentiometer_THT:Potentiometer_Bourns_3296W_Vertical` exist:

| Manufacturer terminal | Function | Symbol pin | Footprint pad/local XY mm |
|---|---|---|---|
| 1 | CCW end | 1, passive | 1 / 0,0 |
| 2 | Wiper | 2, passive | 2 / -2.54,0 |
| 3 | CW end | 3, passive | 3 / -5.08,0 |

Counts: three physical leads, three symbol pins, three electrical pads, no
duplicates. Footprint drill 0.8 mm, pad diameter 1.44 mm. Manufacturer lead
diameter 0.51 +/-0.03 mm; inline pitch 2.54 mm. Standard F.Fab is 9.53 x
4.83 mm; courtyard has nominal 0.25 mm clearance and silkscreen is present.
The schematic owner independently reconciled the manufacturer's end/lead-side
illustration to the component-side footprint and rendered disposable placements:
pin1 is nearest the screw, matching the standard footprint. Three-pin mapping,
readback and native SVG inspection passed. Do not mirror the lead-side drawing
straight onto the top-view footprint.

Raw read-only queries are `read-trimmer.json` and `read-pot-symbol.json`;
official helper responses were written to `.konnect-scratch/v2-2026-10-06/`.

## Status indicator

Candidate: Kingbright `WP710A10LID`, red 3 mm THT low-current LED.
Manufacturer document DSAL0510 / 1101029029, Rev11A, 27 June 2023, p1
mechanical drawing and p2 electrical data. [Official PDF](https://www.kingbrightusa.com/images/catalog/SPEC/WP710A10LID.pdf)
archived as `kingbright-WP710A10LID.pdf`.

Proposal: GPIO21 -> 1 kohm -> LED anode; cathode -> GND. Nominal 1.7 V Vf
gives approximately 1.6 mA at 3.3 V. Candidate resistor is
`RC0805FR-071KL` (0805). The leaded LED can face an enclosure aperture or be
fitted remotely instead; enclosure position remains unchosen. Do not fit two
parallel LEDs expecting equal brightness from one resistor.

Manufacturer does not number the two LED terminals: short lead is cathode;
the package drawing labels it. KiCad convention is `Device:LED` pin1=K,
pin2=A, unlike many informal LED numbering conventions. Candidate standard
footprint `LED_THT:LED_D3.0mm`, 2.54 mm pitch. Manufacturer recommended drill
is 0.9 mm; the owner independently verified the library pitch, holes and
cathode=pin1 map and inspected a disposable placement's native SVG.

## I2C power-off review

BQ SCL/SDA use open-drain signaling and external logic-rail pullups; use the
ESP 3.3 V rail, never a permanently powered BQ-side pullup into an unpowered ESP.
TI absolute maximum is 6 V, not a VDD-relative limit. The 1 uA leakage row at
3.3 V is specified under powered electrical-characteristic conditions; it is
not an explicit unpowered Ioff specification. No manufacturer statement
guaranteeing powered-off bus isolation was found in this pass.

Therefore direct common-bus connection is a plausible simple prototype path,
but do not label it power-off-qualified. Test: USB only/BQ unpowered; main only/
ESP unpowered; both on; rail ramp transitions; attached output battery with
generator absent. Check SDA/SCL levels and injection/backpower current. Series
resistors alone do not prove safe isolation. An isolator is not selected merely
because the datasheet lacks an explicit Ioff row.

## Dated sourcing observations

Prices exclude VAT/shipping unless stated. Stock is an observation, not a
reservation. Exact parts are candidates, not authorized purchases.

| MPN | Supplier observation | Unit price 1 / 10 | Link |
|---|---|---|---|
| 3296W-1-503LF | DigiKey France, 9,491 stock | EUR1.93 / 1.608 | [product](https://www.digikey.fr/fr/products/detail/bourns-inc/3296W-1-503LF/1088059) |
| 3296W-1-204LF | CV trimmer candidate, DigiKey France opened, 1,770 stock | EUR2.31 / 1.921 | [product](https://www.digikey.fr/en/products/detail/bourns-inc/3296W-1-204LF/1088052) |
| WP710A10LID | DigiKey France indexed observation, 12,817 stock | EUR0.23 / 0.157 | [product](https://www.digikey.fr/en/products/detail/kingbright/WP710A10LID/2657763) |
| RC0805FR-075K49L | DigiKey US indexed observation, 53,119 stock | USD0.10 / 0.034 | [product](https://www.digikey.com/en/products/detail/yageo/RC0805FR-075K49L/730946) |
| RC0805FR-071KL | DigiKey France opened, 848,479 stock | EUR0.09 / 0.030 | [product](https://www.digikey.fr/en/products/detail/yageo/RC0805FR-071KL/727444) |

## Precision resistor sourcing update

Completion-pass availability check, 8 October 2026: the exact 0805 precision
parts also have authorized-distributor stock evidence. DigiKey US indexed
`RT0805BRD07249KL` at 3,982 units and USD0.10 / 0.083 for 1 / 10 pieces
([product](https://www.digikey.com/en/products/detail/yageo/RT0805BRD07249KL/1075740));
`RT0805BRD077K5L` at 10,576 units and the same USD price breaks
([product](https://www.digikey.com/en/products/detail/yageo/RT0805BRD077K5L/5139422)).
Regional/cached listings disagree on inventory, so recheck before purchasing.
These USD observations are not silently imported as EUR into the cost tracker.
The separate [model acceptance](yageo-model-validation-2026-10-08.md) verifies
the actual parts and hand-solder lands; stock alone does not validate a model.

## Archive hashes

| File | SHA-256 |
|---|---|
| bourns-3296-rev-02-26.pdf | BF6040C7A149986640A90CF501C71D30274D3458294794A74216D714BD9D4ED7 |
| kingbright-WP710A10LID.pdf | A000C07B43034775702537EABC2C3C7FDE9F3390DE6408437307A59B560E9D9B |
| panasonic-tq.pdf | 77C8C77C0036759AE750809C39D0520218805949FF0971C2BEEE80017BFEC838 |
| yageo-RC0805FR-075K49L.pdf | FD52E8D37026CFC79366AAC8212791FDEC88F512585A19AEEB94CC809B4669F1 |

The relay archive is research only; see `RELAY_CANDIDATE.md`.
