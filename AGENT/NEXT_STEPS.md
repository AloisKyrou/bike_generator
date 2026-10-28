# Next steps and release gates

## Decisions closed, implementation pending (28 October 2026)

INA237AIDGSR for U1/U10 is user-approved (reconfirmed 25 October); Harwin
1.05 mm/JST J26 0.80 mm hole variants are approved too. Do not reopen these
decisions. Apply via KiCad/Konnect, verify models/fields and annuli, sync BOM,
then repair USB locally and rerun final checks/exports. As of 28 October the
IPC connection is still unconfigured; none of those CAD changes is applied.
Keep the 24 October review as evidence for the unchanged saved board, not as
verification of the future INA237/hole/USB edits. No order-ready package yet.

## External restart, 24 October 2026

Current action list: [final phases](../electrical/external-converter/FINAL_PHASES_2026-10-24.md).
Fresh saved ERC/DRC and connectivity rechecks pass within documented scope;
CAD unchanged. Finish local USB return repair, connector-fit decision, current
INA procurement and coherent new exports. No live IPC available yet; user
asked to open exact PCB. Old ZIP remains obsolete. No upload/order authorized.

## Latest external order gate, 15 October 2026

Read [full review](../electrical/external-converter/FULL_PREFAB_REVIEW_2026-10-15.md).
Not released for order: repair USB reference/pair routing locally and close
finished-hole fit acceptance, then regenerate all fabrication outputs. The old
prefab-2026-10-15-final ZIP predates user I2C/3V3 edits and is obsolete.
Current saved PCB CC446D8A...C1468F8D,588tracks107vias; fresh DRC0errors/4known
silk warnings/0unconnected, ERC0,17fixturesPASS. No new schematic defect found.
Keep prototype USB/cell/converter/10A tests separate from these pre-order gates.

## Active external-converter variant, 15 October 2026

LATEST: [prototype preparation](../electrical/external-converter/PREFAB_CLOSEOUT_2026-10-15.md).
C42 correction applied/verified;591tracks107vias,ERC0,DRC0errors/4historic
silkedge warnings/0unconnected,17negativefixturesPASS. User chose5JLCPCBbare
boards and2componentsets. Gerbers/drills andtwo-supplierdrafts generated.
Final sync NOOP after recovery; refs/board labels enlarged to1mm/0.15mm without
new DRC findings. Latest exports in prefab-2026-10-15-final/. Still need
connectorfit acceptance and portalpreview/quote before upload/order authorization.
No order/upload. Older checkpoints below are superseded where inconsistent.

Latest study: [TP4057 input bypass](../electrical/external-converter/TP4057_INPUT_BYPASS_STUDY_2026-10-15.md)
proposes reconnecting existing C42 after R45, at U6.VCC, with no added part.
NOT APPLIED: implement via KiCad/Konnect and rerun netlist/ERC/DRC/parity before
closing this layout point. The [supplier plan](../electrical/external-converter/bom/SUPPLIER_PLAN_2026-10-15.md)
covers35 MPNs/74 fitted purchased parts with DigiKey + LCSC; accessories and
fabrication remain separate. No purchase or CAD changes in this study.

Latest work is the separate [external controller](../electrical/external-converter/README.md),
not a continuation of the older V2/V1 checkpoints below. Its direct-digipot PCB
is fully connected:585 tracks,106 vias,ERC0,zero airwires,sync noop.
Read the [latest 2 oz review](../electrical/external-converter/REVIEW_2OZ_2026-10-15.md).
Local HRO/JST enlarged PTH lands resolve the previous J27/J26 annulus findings.
DRC zero errors, four visible silk-edge warnings; routing unchanged.
Bounded JLC geometry screen passes; PCBWay needs separate detailed-rule checks.
User confirmed two layers/2oz on14October2026;10A remains a design objective.
Native stackup now 70 um per face / 1.6 mm total; verify the fabrication contract;
this approval does not select a fabricator or authorize an order.
BOM now has zero missing purchasable MPNs: the five 10 uF capacitors are
PROVISIONAL Murata GRM21BR61C106KE15L (16V/0805). Read the
[capacitor review](../electrical/external-converter/CAPACITOR_SELECTION_2026-10-15.md).
Resolve TP4057 VCC bypass before freeze: C42 is upstream of R45, not directly
at U6.VCC. Charge and combined-condition capacitance/rail qualification remain
open; JP20 OPEN. The 43.96-73.17 EUR planning budget is not a supplier basket.
Return-path numerical
review is complete with no mandatory copper repair. F1 remains 20 A, not a
10 A limiter; source fault/current/cable/fuse coordination is still required.
Manufacturer/stackup, thermal/current, USB/1S,
external-converter compatibility and battery-side fusing are not qualified.
No fabrication release. The older V1 manufacturing contract below is not
automatically the contract for this new board.

## Current V2 work

V1 and V2 have independent projects and local libraries. Follow the
[active V2 checkpoint](../electrical/v2/README.md) and
[full-function completion criteria](../electrical/v2/docs/explanations/IMPLEMENTATION_NOTES.md).
The [current V2 schematic](../electrical/v2/docs/SCHEMATIC_CONTINUATION_2026-10-08.md)
now draws MCP4251 manual/app voltage selection, BQ I2C current control/telemetry,
and the higher-current stage. It has 142 components across eight sheets,
including eight bare probe pads. K1.9 is explicitly unconnected; the remaining
brownout gate is not closed by that zero-part correction.
Beetle-style TP4057/RT9080 powers logic from USB or an optional protected 1S
cell, with no generator AUX or TPS63031. No V2 fabrication release is implied.

Next V2 gates are receiver-safe relay/brownout behavior, generator OV/TVS
coordination, thermal/ripple/stability qualification, USB/cell qualification and
PCB layout. JP20/JP30/JP31 remain open. Approximately 400 W is an output ambition,
not a qualified rating or autonomous limit; 55 V does not guarantee full
13S/54.6 V charging. Read the
[review and bring-up guide](../electrical/v2/docs/REVIEW_AND_BRINGUP_2026-10-08.md).
Also review the
[startup/profile and gate-drive findings](../electrical/v2/docs/CONTINUATION_READINESS_REVIEW_2026-10-08.md):
charging defaults are not a universal appliance-supply profile, and bootstrap
losses must be included before assigning high-side FET conduction/thermal limits.
The numbered steps below remain the V1 release gate, not permission to modify
or manufacture the out-of-sync copied V2 PCB.

The remembered TI reference is PMP7282. See the new
[converter comparison](../electrical/v2/docs/POWER_CONVERTER_REFERENCE_STUDY.md)
and [buck-only / pedal-feel study](../electrical/v2/docs/BUCK_ONLY_AND_PEDAL_FEEL.md).
The latest expanded reuse request is analyzed in the
[compatibility decision pack](../electrical/v2/docs/compatibility/README.md).
Buck-only remains the current setup's proven topology, but charging higher
voltage receivers from lower-voltage donors motivated the later buck-boost
selection. The historical approximately 60 V research envelope is superseded
by the approved 55 V working ceiling, not a promise to fully charge every pack.

The V1 design is reviewed, but it is not yet released for manufacture.

## 1. Make the repository available on the other computer

At handoff creation, local `main` was eight commits ahead of `origin/main` before
this documentation commit. The user must explicitly push the branch, or transfer
the repository another way, before a fresh checkout can contain the work.

Recommended checks:

```text
git status -sb
git log --oneline origin/main..HEAD
git push origin main
```

Do not push automatically without the user's approval.

The local-only files in [`LOCAL_ONLY.md`](LOCAL_ONLY.md) are not part of Git and
will not follow a normal clone.

## 2. Align KiCad manufacturing metadata

Through Konnect/KiCad only:

1. set the two outer copper layers to 105 µm / 3 oz;
2. set the finish/stackup metadata to ENIG where KiCad supports it;
3. save the board;
4. refill zones;
5. run a fresh saved-file DRC;
6. run schematic-to-PCB dry-run and require no changes;
7. document any intentional parity waiver for H1–H4.

Do not direct-edit the `.kicad_pro` or `.kicad_pcb` files.

## 3. Run the pre-fabrication review

Use the `kicad-review` and `kicad-manufacture` workflows. The review must include:

- ERC on the full hierarchy;
- DRC after zone refill;
- 70 × 110 mm board outline confirmation;
- four M3 mounting holes and edge clearance;
- J1/J2 polarity markings;
- J8 phase mapping and D2 pinout;
- F1/F2, D1, C6 and J6 polarity/orientation;
- U4 exposed-pad paste windows and thermal vias;
- 3 oz manufacturability around U1's 0.5 mm pitch;
- silkscreen readability and no text over pads;
- BOM value/footprint/MPN completeness;
- 3D/mechanical collision review.

## 4. Generate a fresh manufacturing package

Only after the review passes, create a new dated output directory under
`electrical/v1/kicad/exports/` containing:

- Gerbers for all required copper, mask, silkscreen and edge layers;
- plated and non-plated drill files;
- top `F.Paste` for the stencil;
- fabrication and assembly drawings;
- a rendered Gerber review or screenshots;
- the exact grouped BOM used for purchasing;
- checksums or a manifest tying outputs to the Git commit.

Review the package in an independent Gerber viewer before upload.

## 5. PCB order contract

Current intended order, subject to a fresh quote and explicit user approval:

- PCBWay;
- 5 bare boards;
- 70 × 110 mm;
- 2 layers;
- 1.6 mm FR-4, Tg ≥150 °C;
- 3 oz finished copper both sides;
- ENIG;
- green solder mask, white silkscreen;
- 100% electrical test;
- one unframed, top-only 0.12 mm laser-cut stainless stencil;
- no assembly service for V1.

Inspect PCBWay's CAM preview and explicitly confirm 3 oz compatibility around
the VSSOP-10 before accepting the engineering review or paying.

## 6. Component orders

The current two-order strategy is Mouser plus Farnell. Before payment:

- recheck U1 and L1 stock;
- reject automatic substitutions for D2, F1, F2, R1, U4 and L1;
- verify the R17/R18 0.1% alternatives;
- confirm J6 quantity/minimum order;
- include Type 4 solder paste, thermal compound/interface and mechanical
  hardware outside the electronic BOM.

Use the five-board purchasing BOM and the sourcing plan linked from
[`README.md`](README.md).

## 7. Assembly and bring-up

Recommended first-board sequence:

1. inspect bare-board dimensions, drills, finish and continuity;
2. stencil/reflow the small SMD parts, paying special attention to U4's exposed
   pad and U1's 0.5 mm pitch;
3. inspect under magnification and test for shorts before fitting modules;
4. bring up the LM5164 from a current-limited 12 V bench supply;
5. verify 5 V, 3.3 V, PGOOD and quiescent current;
6. verify INA238 address 0x40 and calibration against a meter;
7. measure external-buck A/W/B levels before attaching J7/J9;
8. fit the D2 heatsink with thermal compound and 1.0 Nm M4 torque;
9. increase voltage/current in stages while logging D2, F1, R1, connector and
   copper temperatures;
10. test J1 and J8 variants separately, never together.

## 8. V2 direction, not a V1 change

V2 is expected to integrate the main buck and arrange heat-generating components
against one cooling face with a shared larger heatsink. Do not redesign V1 around
that concept unless the user explicitly reopens the architecture.
