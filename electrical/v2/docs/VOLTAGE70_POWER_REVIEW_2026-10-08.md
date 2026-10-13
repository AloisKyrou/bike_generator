# Independent 70 V-class power review

8 October 2026, final export reconciled 9 October. Read-only scoped review of the owner's exported schematic,
not a PCB review, complete safety assessment or energization approval.

## Result

No new power-path wiring or selected-part mismatch was found in the reviewed
candidate. The following known qualification gates remain material:

1. **Input and receiver protection remain unqualified.** SMCJ70A's rated clamp
   is not coordinated with BQ's 85 V absolute limit, even after fitting 100 V
   FETs and capacitors. ACOV stops switching without isolating exposed parts.
   Reversed direct DC at J1 can conduct through fitted D2 ahead of F1. The
   drawing now explicitly requires source-adjacent fusing and a separate fuse
   near a receiver battery; it does not claim universal fault containment.
2. **Continuous current and thermal capability remain unqualified.** F1's
   standard 25% continuous derating gives 15 A before temperature re-rating,
   close to the 14.771 A input screening ceiling. FET gate drive, REGN heat,
   rectifier cooling, hot shunts, terminals and all-max manual operation need
   physical proof. The app's approximately 400 W ambition is not a hardware cap.
3. **L3 is still a 75 V terminal-to-terminal part.** Normal operation near
   70 V leaves little switching-excursion margin. This must be measured; the
   higher external semiconductor ratings do not upgrade inductor insulation.
4. **Capacitor mounting and dynamics remain qualification gates.** The
   standard footprint differs from Panasonic's recommended lands. The 5+7
   bank clears the static initial/endurance-drift capacitance screen, but
   current sharing, mounting, temperatures and loop stability are not proven.

The separate CV selector review owns manual/app brownout and receiver-safe
handover. Those issues are not cleared by this power audit.

## Evidence boundary

Reviewed XML:
`electrical/v2/kicad/exports/review-voltage70-2026-10-08/controller-v2.xml`

Final XML SHA256: `C94BA60B4DDE5FDD86566964E3B5836A4A9803ECECB7E6B4A1FEE86BAE8B3329`.
Final review PDF SHA256: `BF0AEB691519C6CB35F097AAD11249C5BE25F82D5D436F996E49EAAC5BB91403`.
Candidate contains 146 components, 125 nets, eight sheets. Any later source
or export refresh requires hash reconciliation before treating this as final.
The initial reviewed export was `36AB8503A85258D2049D9BD2B91F9B29C5DEB965F7040D53E51953524CEFDCF3`;
the owner confirmed subsequent refreshes through `04A6B9E8...` and the final
hash changed metadata and presentation only. All 483 positive assertions were
rerun successfully on the final hash on 9 October.

Read-only checks used exported XML and archived primary datasheets. No native
KiCad command or mutation was run by this reviewer. Owner-produced MAIN and
POWER_PATH PNGs in that export directory were visually inspected: direct power
wiring, capacitor polarity, source/receiver notes and open commissioning links
were legible, with no newly identified material overlap in those two sheets.
This is not full-hierarchy visual coverage.

The final owner-generated `erc.json` was inspected and contains zero violations across
eight sheets. It retains ignores for single global label, four-way junction,
simulation model issue and footprint-filter mismatch. This report inspected
that result; it did not rerun ERC or equate zero ERC with physical correctness.

## Verified endpoints

- Q10-Q13 use `SIR870ADP-T1-RE3` and `PowerPAK_SO-8_Single`, with all three
  source pins tied correctly, high-side drains on their respective rails,
  low-side sources grounded and gates connected through R76-R79 to the
  appropriate BQ HIDRV/LODRV pins. Vishay's exact RE3 ordering mapping is
  documented in the component study, not inferred from the suffix alone.
- Input shunt remains the sole `CSS4J-4026K-5L00F`: force and Kelvin pins
  retain their direction and separated schematic nets; sense filters reach
  ACP/ACN. R74 and J30 remain absent. R62 remains 1.47k/0805, not the old 1 A
  study limit. Output `WSL25125L000FEB` sense direction reaches SRP/SRN.
- Input bulk is C73/C81 upstream and C74/C82/C87 local. Output bulk is
  C75/C83/C84/C85/C88 local and C76/C86 receiver-side. All twelve parts are
  `100SXV27M`, 27 uF/100 V, positive pin 1 to its rail and negative pin 2 to
  ground, using `Capacitor_SMD:CP_Elec_10x12.5`. C79/C80 retain the intended
  split output ceramic placement.
- R63/R64/R65 are the exact 1M/105k/19.6k Yageo 0.1% 0805 parts. Their
  ACUV/ACOV chain and pin endpoints match the independent input-window study.
- J2 is absent. F1 remains `0456020.ER`, displayed 20 A/100 VDC; D1 remains
  cathode toward the protected rail. J1 and D2 remain upstream of F1, making
  the documented reversed-DC bypass condition real, not hypothetical wiring.
- J31/JP30/JP31 retain selected Phoenix 1711725 terminal models. Their
  electrical connectivity does not establish wire-loop ampacity or enclosure
  touch safety. JP30/JP31 are shown open; no commissioning action occurred.
- USB D20 polarity, 1k R51, NTC connector/network, shared R4/R6 pull-ups,
  generic GPIO-header endpoints and absence of stale INA net names pass the
  retained checks. This is selected endpoint coverage, not a claim that every
  USB power-fault state was simulated or tested.

## Calculation and model evidence

[Power-stage study](../../components/ti-bq25756/power-stage-70v/README.md) and
its `screen.mjs` retain exact source links, archive hashes, prices and limits.
The calculation reproduces TI's 51 uF and 674 uF worked examples, and screens
the actual >=9.8 V input window rather than assuming 4.2 V operation. Default
boost compensation requires approximately 113.24 uF at the worst sampled
16 V region. Five/seven Panasonic cans retain 86.4/120.96 uF after both initial
-20% tolerance and another -20% endurance shift, without ceramic credit.

The numerical grid is an engineering screen, not exhaustive proof over every
mode or component variation. Fast-transient mode, real ESR/trace inductance,
auto-tuning, receiver dynamics and low-temperature performance remain checks.
Ripple screen is approximately 5.426 A input /7.680 A output total. Estimated
equal-ESR local per-can currents are 1.206/1.182 A, below the 3 A rating only
applicable at <=105 C. Above105 C the part's ripple rating drops to 0.94 A.

Independently viewed owner's `models/cap-pads.png` and manufacturer
`models/panasonic-land.png`: stock footprint indicates positive left pad and
proper enclosure; F12 manufacturer's recommended land gap is4.3 mm, total
span13.1 mm and width1.9 mm. Do not describe the stock larger-width/different-
span layout as an exact manufacturer land match. Owner's saved-model readback
and package verification remain the source of full model acceptance evidence.

## Reproducible tests

`review-power-endpoints.ps1 -Netlist <candidate.xml> -Voltage70` passes
**483 endpoint/part assertions**. The new switch explicitly checks the updated
parts/counts and absent J2 while preserving historical default expectations.
Running the unchanged default mode on the prior continuation XML still passes
**252 assertions**. Native files are not parsed or rewritten by these checks.

The associated `power-stage-70v/negative-audit.ps1` mutates disposable XML
copies only, testing rejection of old MOSFET, old bulk part, wrong capacitor
polarity, missing local capacitor, wrong OV resistor and wrong F1 variant.
All **six deliberately broken fixtures were rejected** against both the initial
export and the final `C94BA60B...` export in the completed 9 October rerun.

## Handoff

No new native correction requested from this scoped review. Documentation's
incorrect Q30-Q33 reference was corrected to actual Q10-Q13. Final export/hash
refresh, whole-board review and the known physical qualification gates remain
with the design owner/root workflow. This is not manufacture ready.
