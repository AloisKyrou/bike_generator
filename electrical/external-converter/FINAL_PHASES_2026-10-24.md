# External controller: final review and order phases

24 October 2026. **NEEDS ATTENTION / fabrication release INCOMPLETE.**
Scope: external converter controller, not integrated BQ25756 V2.
Target remains 5 bare JLCPCB boards, components for 2, self assembly,
2 copper layers / 2 oz each / 1.6 mm. No upload, purchase or substitution.

## Fresh checks and retained evidence

Saved PCB SHA256:
`CC446D8AED03ABE445527A3FD0EE7F5F9E3DA734A938B1D602E7A4B2C1468F8D`.
Byte-identical to the last fully reviewed board: 588 tracks, 107 vias,
84 footprints. User routing is preserved; no CAD change in this recheck.

- Fresh KiCad 10.0.6 ERC: zero violations, nine sheets.
- Fresh exported XML: 81 parts, 84 nets, 287 pin assignments; no component
  or connectivity changes from the independent 15 October export.
- Direct connectivity verifier and all 17 negative fixtures pass.
- Fresh saved-file DRC: zero errors, four `silk_edge_clearance` warnings,
  zero unconnected. Separate parity findings are only board-only H1/H2/H4.
- The four visible warnings concern U2 antenna and J27 shell artwork crossing
  intentional outline edges; no copper waiver or suppression was introduced.
- DRC used existing saved zone fill. No new live refill/sync was claimed:
  Konnect reports no running editor and an unconfigured IPC socket this session.

Evidence: `.konnect-scratch/review-20261024/drc.json` and
`.konnect-scratch/electrical-review-20261024/{netlist.xml,erc.json}`.
Copies and their hash manifest are in `kicad/exports/readiness-2026-10-24/`;
these are review evidence, not a fabrication package.
See [fresh electrical recheck](REVIEW_ELECTRICAL_2026-10-24.md) and
[detailed routing review](FULL_PREFAB_REVIEW_2026-10-15.md).
The latter's pinout, decoupling, power-copper and return-path analyses remain
applicable to this unchanged source. They are not newly measured hardware tests.

## Close before PCB order

### 1. Local USB routing correction

Keep placements and power/sense routing unless a specific local obstruction
requires a bounded move. Main work area: U8 to R32/R33, approximately
x60..118 / y32..43 mm. Do not apply a global autorouter or a four-layer redesign.

The existing front pair crosses bottom-plane interruptions around x76, 78,
90, 96.8 and 98. Its bottom segment near x100..115 lacks a continuous opposite
ground reference. Repair these specific returns, not merely the drawn widths.

Plan with live pads/traces first, then apply/read back one local group at a time:
keep a paired short path, clear a reference corridor by rerouting obstructing
low-speed nets where practical, provide reference copper and adjacent ground
return vias at unavoidable transitions. Preserve all non-USB connectivity.
Keep J21 test branches short and unpopulated in normal use. Inspect actual filled
copper on both sides, not just trace centerlines. Remove the overlapping 3V3
segment at x90 only after confirming the retained trunk covers its connections.

Espressif recommends 90 ohm differential routing, continuous reference copper
and local ground return vias at transitions. This board has no verified 90 ohm
geometry; calculate against the actual stackup and record remaining prototype
compromises rather than claiming certified impedance or guaranteed USB failure.
[Official layout guidance](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/pcb-layout-design.html#usb),
checked 24 October 2026. USB enumeration/flash remains a physical test.

### 2. Connector fit decision

No wrong pin map is established. The previous mechanical report distinguishes
nominal drawing agreement from worst-case finished-hole fit. Close this with
a specific disposition, not a demand that every standard connector receive
custom metrology before a first prototype. Any new drill/footprint edits need
approval; prior permission enlarged copper pads only, not holes.

Candidates already calculated: Harwin holes 1.00 to 1.05 mm; J26 JST holes
0.75 to 0.80 mm, subject to whole-footprint clearance/annulus checks. They reduce
undersize risk, but do not establish guaranteed fit over all tolerances.
Phoenix and USB nominal drawing differences must be judged separately.
Never enlarge a plated hole after manufacture as the normal assembly solution.
The independent 24 October purchasing/mechanical review recommends retaining
the nominal holes for this prototype with explicit first-board fit inspection.
Thus enlargement is an optional risk reduction, not a proven mandatory repair;
both dispositions need an explicit record. The user has been asked which to use.

### 3. Procurement freeze

Existing drafts allocate 35 MPN groups / 74 fitted components per board to
DigiKey and LCSC. They are not current reserved baskets. A fresh check found
only 3 INA238AIDGSR at the planned supplier, while 4 are needed. Resolve the
exact part or an explicitly approved packaging alternative before purchasing.
Do not buy three costly sensors and leave the second board incomplete.

Concrete alternative reviewed, NOT selected: INA237AIDGSR, listed at
USD3.23 each with 11,792 in stock at DigiKey on 24 October (four = USD12.92
before tax/freight). It retains the 85 V / 16-bit measurement class but has
larger maximum offset/gain errors. The 50 uV offset alone corresponds to
25 mA with a 2 mOhm shunt, versus 2.5 mA for the INA238's 5 uV specification.
The sourcing report confirms matching pins 1..10 and the current/power
calculation registers. Firmware must not require the INA238 device-ID register
at 0x3F; alert read/clear behavior must also follow the selected datasheet.
User approval precedes any BOM/CAD change; no rerouting is indicated by that
pin comparison. This is a different measurement grade, not just new packaging.
[TI INA237](https://www.ti.com/product/INA237),
[exact DigiKey item](https://www.digikey.com/en/products/detail/texas-instruments/INA237AIDGSR/14004323).

See [current sourcing findings](bom/ORDER_READINESS_2026-10-24.md).
All other 34 allocated MPNs have enough listed stock in that review; inventory
is not reserved. Recheck stock, exact manufacturer, MOQ, tax, shipping and delivered
total. Keep accessories and PCB fabrication separate from the fitted BOM.

### 4. One coherent fabrication package

After changes: native save/refill, saved-file ERC/DRC, schematic parity and
sync dry-run. Re-export Gerbers and separate plated/non-plated drills into a
new directory bound to the final saved source hash. Inspect all layers in
GerbView, especially USB slots, antenna cutout, fine-pitch mask and silkscreen.
Include assembly PDF, current schematic PDF and BOM for self assembly;
no factory CPL is needed. Optional stencil is a separate choice, not included
silently in the board order.

The previous `prefab-2026-10-15-final` ZIP is OBSOLETE. Do not order it.
Before payment, inspect actual JLC preview/settings and quote with the user.
No portal preview or upload has been performed in this review.

JLC's public capability page was rechecked on 24 October: two-layer 2 oz
trace/space 0.16/0.16 mm, component PTH annulus at least 0.254 mm, PTH tolerance
+0.13/-0.08 mm, and legend height/stroke 1.0/0.15 mm. The unchanged board's
previous geometry screen remains applicable; any drill/routing edit needs a
new screen. Controlled impedance is listed for 4 or more layers, not this
two-layer order. Calculated USB geometry is therefore not a vendor impedance
guarantee. [JLC capabilities](https://jlcpcb.com/capabilities/pcb-capabilities).

## First-board test sequence (after fabrication)

1. Dry-fit connectors; inspect polarity and soldering. Measure rail resistance
   before power. Fit low SMT before heat-sensitive through-hole plastics/LEDs.
2. No cell, generator, receiver or converter. JP20 OPEN. Start from a protected,
   current-limited 5 V source; inspect 3V3, current draw and temperature. Do not
   use a valuable PC as the first electrical test supply.
3. Verify USB enumeration, flash, serial/debug and reset. Test boot with generic
   GPIO accessories disconnected. USB serial is not an exposed UART RX/TX pair.
4. Check INA addresses 0x40/0x41, offsets and calibration against known low-energy
   sources/loads. Check digipot codes/resistances before connecting its terminals.
5. Qualify the actual converter A/W/B interfaces within the powered MCP rails
   and project +/-1 mA limit. Logic and safe codes first, converter second.
   Stop the converter before removing logic power; there is no manual fallback.
6. Test the protected 1S cell/charger separately, with qualified cell charge
   rating and suitable supply. Measure charge current, handover and USB backfeed.
   JP20 OPEN is not complete PC isolation or a universal USB current guarantee.
7. Increase main-path current progressively with a limited source and suitable
   load; log bridge, terminals, shunts and copper temperatures. Add bridge cooling
   before high-current tests. 10 A is a target, not yet a continuous rating.
8. Only then use an energy-rich generator/battery harness with suitable source
   and receiver fusing. F1 is 20 A fault protection, not a 10 A operating limiter;
   reversed J1 and receiver-fed faults can bypass it. TVS is not a guaranteed
   clamp below every IC limit. No universal no-fire claim is established.

These hardware tests are not reasons to keep redesigning the approved prototype
on paper. Conversely, passing ERC/DRC does not replace them.
