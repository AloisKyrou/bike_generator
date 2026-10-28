# Independent pre-prototype review

## Final cosmetic and synchronization closeout, 13:04:18 local

15 October 2026. The user recovered and closed the schematic editor. The
design owner's recorded final `update_pcb_from_schematic` dry run now reports
**noop, zero changes, nine hierarchy files, no diagnostics or unassigned
footprints, and three preserved board-only footprints**. The stale-lock/sync
reservation in the earlier checkpoint is closed.

The user delegated the cosmetic choice. Native text-property edits standardized
reference and board text to 1x1mm with 0.15mm strokes. This reviewer inspected
the final enlarged charger rendering: U6/C42/C45 references remain legible and
separate. No new local placement issue is apparent. The parent owns the complete
final GerbView inspection and archive, not this bounded recheck.

Evidence inspected in `kicad/exports/prefab-2026-10-15-final/` and
`.konnect-scratch/prefab-silk-final.jsonl` confirms:

- Native saved-file DRC: zero errors, four historical U2/J27 edge-silk warnings,
  zero unconnected items, parity only H1/H2/H4.
- Native ERC: zero errors/warnings. The standalone `erc.json` is an empty
  violation array; the recorded tool result explicitly supplies the zero counts.
- Independent rerun of `verify-netlist.ps1 -SelfTest` on the final XML passes
  81 components / 84 nets and all 17 negative fixtures.
- Final component readback contains 84 footprints. The manufacturing summary
  counts 698 route items, consistent with the owner's 591 segments + 107 vias;
  that summary must not be described as 698 track segments.
- Independent byte-content comparison, ignoring only explicit generation-time
  comment/attribute lines, confirms both copper layers, both masks, board
  outline, both drill files and bottom silk unchanged from the preceding
  `prefab-2026-10-15/gerbers-review/` export. Only front silk differs. This
  corroborates `gerber-regression.csv` without assuming it is correct.

Saved PCB SHA-256:
`A8E3FB40DA3EB63AC25F134258657EAB51D37125FFA2EBA8C6E74F186AA07C9A`
(758277 bytes, 15 October 2026 13:04:18 local).
Local independent visual: `independent-prefab-2026-10-15/charger-detail-final.png`.

**Current scope: CAD correction and synchronization closed; no new electrical
or assembly-rule defect found in this final bounded recheck.** The aggregate
manufacturing tool's `READY` label is not an approval of a fabrication order.
Actual connector fit, the final complete manufacturing-file review, manufacturer
portal preview/quote and explicit order acceptance remain separate. No file was
uploaded and no order was placed by this reviewer. USB/cell/converter/thermal
qualification remains prototype testing, as distinguished below. The earlier
lock, courtyard and font-decision reservations are not current blockers.

## Corrected checkpoint, 12:36:42 local

The design owner corrected the C42/U6 courtyard overlap and local reference
text, refilled copper and saved. A new independent native KiCad CLI check
against that saved board confirms **zero DRC errors, four historical edge-silk
warnings, zero unconnected items, and only H1/H2/H4 intentional parity items**.
Fresh native hierarchy ERC reports zero violations. No CAD mutation, refill,
save or editor action was performed by this independent reviewer.

The updated Direct verifier passes 81 components / 84 nets and rejects all
**17 negative fixtures**: 15 broken-connectivity, one A/W-short and one upstream
C42 regression. Native XML comparison against the original capacitor checkpoint
still finds exactly one pin-net change: C42.1 from VBUS_USB to TP_VCC.

The rendered front PCB, enlarged charger detail and LOGIC_POWER schematic page
were visually inspected. C42 is placed immediately near U6; C42/C45/U6 reference
text is now separate and legible. The schematic shows C42 connected after R45,
with a continuous local branch to U6.VCC. No added local overlap is visible.

The user has now selected **five PCBs / two populated prototypes, JLCPCB,
two layers / 2 oz / 1.6 mm**. This closes the quantity and vendor/process-choice
questions below, not acceptance of final fabrication files or the online order.

**Current verdict: local C42 correction verified; final fabrication-release
review INCOMPLETE.** The final exported Gerbers/drills, manufacturer preview,
remaining edge-silk interpretation and order contract are not approved by this
review. The owner's last synchronization dry run was blocked by a stale
schematic lock after a crash; native DRC parity is consistent but is not a
completed dry run. Resolve/recheck that operation without discarding user edits.
Do not describe the board as fabrication-ready from these checks alone.

Corrected evidence, under `kicad/exports/independent-prefab-2026-10-15/`:
`netlist-corrected.xml`, `erc-corrected.json`, `drc-corrected.json`,
`pcb-front-corrected.png`, `charger-detail.png`, `logic-schematic-corrected.png`.
Visuals were rendered from the owner's `prefab-2026-10-15/` PDFs. Checks used
fresh native exports, not the owner's summarized ERC/DRC reports.

Corrected saved PCB SHA-256:
`B18391968DAAE94E5819210D90F21D564D13922D8C5C482D0AA7CDE64AC48730`
(758123 bytes, 15 October 2026 12:36:42 local).

The preceding failing checkpoint is retained below as history; its C42/U6
error and four new local silk warnings are **resolved**, not current blockers.
The operating-test boundaries remain applicable.

## Earlier checkpoint, superseded by the corrected review above

15 October 2026, saved-board checkpoint 12:23:16 local. Read-only review of the
external-converter variant. No native CAD mutation, editor action, refill,
component substitution, order or manufacturer upload performed by this review.
The design owner is correcting C42 and preparing the final release evidence.

## Verdict at this checkpoint

**NOT READY for a PCB order:** a new C42/U6 courtyard overlap remains in the
saved PCB. Final manufacturing-package and process acceptance are incomplete.
This is a bounded review, not an independent approval of all component ratings
or a substitute for the design owner's final post-correction checks.

## Fresh findings

1. **Error: C42 and U6 courtyards overlap.** Native saved-file DRC reports
   `courtyards_overlap`. Resolve placement locally without changing the selected
   footprints or suppressing the rule, then inspect actual solder access.
2. **Four new silkscreen warnings:** C42/C45 references overlap; C45 reference
   intersects C42 body silk and C42 pad 1; U6 reference intersects C42 pad 2.
   Reposition the affected reference text after fixing placement. These warnings
   do not establish a copper short, but impede manual assembly.
3. **Four historical edge-silk warnings remain:** two U2 antenna-outline and two
   J27 shell-outline items. They are explicit in the report, not waived by this
   reviewer. Inspect plotted output and decide whether harmless clipping is
   acceptable; do not remove electrically meaningful keepouts or pad geometry.

No unconnected items or copper/clearance errors are reported in this saved-file
DRC. Schematic parity has only the intentional board-only H1/H2/H4 footprints.
This check deliberately did not refill zones or save the board. A final native
refill/save and new DRC remain required after all layout corrections.

## Independent C42 connectivity check

Fresh native hierarchy XML export confirms:

| Net | Required endpoints confirmed |
|---|---|
| `/LOGIC_POWER/TP_VCC` | C42.1, R45.2, U6.4 only |
| `/USB_INTERFACE/VBUS_USB` | R45.1; C42 absent; existing USB branches retained |
| `GND` | C42.2, U6.2 and existing returns |

Comparing every ref.pin net membership to the preceding
`capacitors-2026-10-15/netlist.xml` gives exactly one change:
C42.1 moved from VBUS_USB to TP_VCC. All other pin memberships are identical.
The nominal 10uF/16V Murata MPN and explicit PROVISIONAL/JP20 OPEN qualification
note remain present. This closes the intended schematic topology change, not
charger stability, effective-capacitance or USB-host qualification.

Fresh ERC reports zero violations under the project's inherited check settings.
The independent Direct verifier passes 81 components / 84 nets and rejects all
12 existing negative fixtures (11 connectivity and one A/W short). The verifier
used for this checkpoint did not yet contain the owner's new dedicated C42
assertions; the explicit native-XML comparison above supplies that evidence.

## What must precede prototype fabrication

- Resolve the courtyard issue and finish local silk; refill/save, new ERC/DRC,
  parity and synchronization check against that exact saved revision.
- Generate and visually inspect the actual copper, mask, silk, outline and
  drill package; check slots, plated/non-plated split and top/bottom consistency.
  Archive hashes and a clear prototype identifier. Existing PDFs are reviews,
  not a substitute for checking the exported fabrication files.
- Accept a specific fabrication process. The documented geometry screen is
  for JLC's two-layer 2 oz assumptions, not generic PCBWay acceptance. Confirm
  finished copper, hole/slot tolerances and the tight 0.50mm-pitch mask geometry
  in the selected process. The prior report does not equal manufacturer approval.
- Preserve the local HRO/JST footprint evidence and obtain the documented
  connector-fit check (sample or suitable 1:1 inspection). No hole or part change
  follows merely from adjusting courtyard or reference text.
- Finalize build quantity and optional accessories before forming paid baskets.
  Current purchasing rows reconcile: DigiKey 29 MPNs / 62 fitted parts, LCSC
  6 MPNs / 12 fitted parts, with no reference/MPN mismatch in this audit.
  Jumper cap, battery mating leads, mechanical parts and source/receiver fusing
  are outside those 74 components. Supplier stock was not revalidated in this
  independent review; use the dated sourcing study and checkout confirmation.

## Tests that can correctly follow prototype fabrication

These are operating-qualification gates, not reasons to require an already
built board before ordering the first prototype:

- USB enumeration/flashing/debug, supply startup/dropout/load steps, inrush and
  backfeed; first power from a limited bench supply, not an unqualified PC port.
- Optional-cell charge current, temperature and termination. JP20 stays OPEN
  and a cell need not be populated for initial USB-only bring-up.
- External-converter A/W/B voltages/current and logic-loss states, initially
  without a receiver battery. The direct MCP42100 interface has no mechanical
  fallback and no universal unpowered safety guarantee.
- Progressive 1/3/5/7.5/10 A path and bridge cooling tests. The 10 A target is not
  a validated continuous rating; F1 20 A is not a 10 A limiter.
- Source-specific fuse coordination and receiver-battery backfeed protection
  before using an energy-rich source or receiver. F1 alone does not protect all
  reversed-input or receiver-fed faults. Prototype fabrication does not authorize
  those operating scenarios.

Do not reopen the entire architecture to close these tests on paper. Keep the
accepted direct-digipot, USB/optional-1S and two-layer/2oz prototype boundaries
explicit, and advance only to the operating level supported by measured evidence.

## Evidence and scope

Directory: `kicad/exports/independent-prefab-2026-10-15/`:

- `netlist.xml`: fresh native KiCad XML hierarchy export.
- `erc.json`: zero violations, inherited ignored-check settings visible.
- `drc.json`: 1 error, 8 warnings; 0 unconnected; 3 intentional parity items.

Reviewed saved PCB SHA-256:
`6F863EE0BAA2EF8754739015503E827EEAC968395A4812E88FB3E22446596809`
(758177 bytes, saved 15 October 2026 12:23:16 local).

Checks ran with KiCad 10 CLI against saved sources, sequentially, without
`--refill-zones` or `--save-board`. This review did not rerun a full aggregate
Konnect audit, inspect a new final Gerber viewer, or test physical hardware.
Those unperformed checks are not reported as passing. Later design-owner
corrections must supersede this checkpoint with fresh evidence.
