# V2 PCB preparation and proposed working method

12 October 2026. Initial read-only preparation, followed by user authorization.
User requires two layers, component-by-component placement, deliberate alignment
and orientation, and minimum unnecessary underside routing. User now approves
the two-layer2oz/1.6mm/ENIG direction and asks to update the existing V2 PCB,
retain useful items, remove obsolete items and use TI layout material where
helpful. This supersedes proposal-only wording in the original evidence below.
Approval is not a claim that stackup metadata or PCB synchronization is done.

Place in order of localization necessity: reserve the tightest constraints
first, including decoupling next to the relevant supply/ground terminals.
Select the anchor's orientation and its decoupling space together, then place
the actual parts one by one before less constrained passives consume that space.

## Fixed constraints

- Retain the current 70 V-class ambition and selected components. Actual
  operating limits come from staged qualification, not a new 55 V revision.
- Two copper layers maximum. Q10-Q13 and D2 underneath facing the common
  heatsink; other components above. No silent component-side exceptions.
- Exact heatsink model is deferred. Lead forming, contact stack, insulated live
  drain tabs, clamps, solder clearance and antenna/metal clearance still matter.
- Preserve manual assembly and repair access with the user's iron/hot air.
- Prefer a better position or rotation to a routing workaround. Alignment must
  not lengthen a critical loop or force a poor ground return merely for symmetry.

## Copper-weight check: result, not unconditional clearance

The documented V1 order baseline was 1.6 mm FR-4, 3 oz per face, ENIG. It is
not automatically suitable for V2. The old native metadata mismatch remains
documented; no fresh V1 board check or mutation was performed here.

Fresh Konnect library readback of the assigned standard U9 footprint:
`Package_DFN_QFN:QFN-36-1EP_5x6mm_P0.5mm_EP3.6x4.6mm`.

| Feature | Observed/calculated value |
|---|---:|
| Numbered copper pads | 37 |
| Peripheral pitch | 0.50 mm |
| Peripheral pad width | 0.25 mm |
| Adjacent peripheral pad gap | 0.25 mm |
| Straight-edge gap from inner peripheral lands to exposed pad | 0.20 mm |

Example: pad 2 center x=-2.4375 mm, length 0.875 mm; exposed-pad width 3.6 mm.
Gap = 2.4375 - 0.875/2 - 3.6/2 = 0.20 mm. This agrees with the earlier
[model review](../../components/ti-bq25756/kicad-model-validation-2026-10-07.md).
The library footprint references ADI's package and is not an exact TI land copy.
No footprint was resized, replaced or created to evade a fabrication rule.

PCBWay's copper-specific table lists 3 oz normal trace/space as 10/12 mil
(0.254/0.3048 mm), medium difficulty as 8/10 mil (0.2032/0.254 mm).
Our 0.20 mm local gap does not establish acceptance under either category.
Their general 0.1 mm capability must not be combined with 3 oz arbitrarily.
This does NOT prove that no fabricator can produce the footprint in 3 oz;
it means the previous straightforward-process assumption is unsupported.

JLCPCB publishes 0.16/0.16 mm trace/space for two-layer 2 oz boards and
0.20 mm pad spacing for a solder-mask bridge in 2 oz. The observed BQ geometry
fits these published numbers, at the stated mask limit for the central gap.
This is a focused geometry screen, not whole-board CAM acceptance.

**Recommendation to user:** 1.6 mm FR-4, two layers, 2 oz (~70 um) per face,
ENIG, green mask. This preserves the component selection and avoids relying
on special 3 oz fine geometry. Not yet an approved stackup or supplier choice.
No price quote or guaranteed saving. Current-carrying copper must be sized
again for this proposal, including neck-downs, PTH connections and temperature;
do not retain V1 widths as proof of current capability. At identical length,
width and temperature, ideal copper resistance rises by 105/70=1.5, which is
not a thermal ampacity calculation. The target may require more copper area.

If 3 oz is preferred, obtain explicit acceptance of this local geometry or
review another verified footprint/process, with required approvals. Do not
weaken DRC or claim the reserve closed merely because routing can be drawn.

## Placement protocol: one component at a time

1. Agree a functional sketch first: connector edges, heatsink/contact zone,
   switching-power zone, quiet control zone, USB and antenna keepout. Reserve
   space without committing all component coordinates or copying the V1 outline.
2. Establish the critical power-stage arrangement before filling empty space:
   paired MOSFETs, local ceramics, L3 and shunts, with a feasible U9 position and
   its gate-drive paths. Treat this as a coupled arrangement, not isolated
   greedy placement of one part followed by forcing every other part around it.
3. For each actual placement, inspect the exact pads and pin numbers, netlist,
   body/courtyard, component side and accessible solder/tool envelope.
4. Before moving it, state reference, role, proposed x/y, angle, side, alignment
   reference, closest electrical neighbours and expected path/return. For a
   critical or congested part, compare another useful rotation/position.
5. Apply only that component's agreed placement through Konnect; read it back
   and inspect top AND bottom views. Do not batch-place the remaining circuit.
6. Record the local result, remaining routing corridors, overlaps and any new
   underside requirement. A conflicting placement is revised now, not buried
   under later traces. Unmoved neighbouring parts remain untouched.
7. Review a functional group with user before progressing into another group.
   Do not infer approval of 145 individual coordinates from approval of this
   protocol. Match the interaction granularity agreed for the session.

Indicative order after the sketch: power-stage anchors and local capacitors;
U9 bypass/bootstrap/gate resistors; Kelvin/feedback and manual/app controls;
USB/logic/ESP; remaining low-criticality passives and connectors. Reserve
external-interface and mechanical positions from the start. Routing priority
can justify adjusting this order; record why before doing so.

## Top-first routing decision

For every proposed bottom-layer SIGNAL segment:

1. Try a compact direct top route consistent with clearance and return path.
2. Consider rotating/sliding the endpoints and nearby unfixed parts, or changing
   the order of a row of independent passives. Preserve net and polarity.
3. Compare the best sensible top route to the bottom alternative: length, loop
   area, switching exposure, return continuity, crossings and assembly access.
4. Use bottom only for a concrete benefit or unavoidable crossing. Prefer a
   short local crossing to repeated top/bottom transitions. Do not take a
   four-times-longer top detour just to minimize the via counter.
5. Record net, reason, alternatives considered and affected ground return.

This preference is NOT a ban on bottom ground copper, stitching/thermal vias,
necessary power copper, or direct connections to the bottom-mounted MOSFETs.
Those serve electrical/thermal functions and are assessed separately from
avoidable signal detours. Do not fragment the ground return to make a visually
single-sided route. Thermal vias require solder/paste-process planning and must
not be treated as electrically harmless unqualified holes under the QFN.

TI requests compact input/output commutation loops with ceramics close to FETs,
nearby driver/bootstrap decoupling, paired high-side drive/return paths, and
Kelvin sensing away from switching nodes. Its same-side power-loop preference
must be assessed against our opposite-face THT assembly: use actual lead/pad
geometry and the full three-dimensional current path. Do not declare the loops
short simply because a top-view ratsnest looks short. Any required component-
side exception must be proposed to user, not applied silently.

## Routing and verification after placement approval

- Agree rules and read them back first: copper weight, trace/space, drills/rings,
  voltage separation, current-path sizing and USB geometry. A fab minimum is
  not an electrical clearance requirement or a suitable power-track width.
- Plan ground-return areas and route corridors before signals; realize and
  refill copper zones at the appropriate routing checkpoint. Never rely on
  stale filled zones as evidence of return continuity.
- Reserve Kelvin/feedback and USB corridors, then route the critical switching
  and gate loops, sensing/control and finally ordinary logic. Recheck preserved
  corridors as each bounded route is added; no global autorouting pass.
- Before each mutation, snapshot/save the authoritative state. After each
  component move or bounded route, read back and inspect the affected region.
  Run DRC for each accepted increment; expected unrouted items remain explicit,
  and new clearance/short violations are not accepted as temporary clutter.
- Show user before/after views at group checkpoints, including bottom copper
  and a brief reason for each signal-layer transition. Do not move previously
  accepted parts silently to repair a later routing decision.
- Final checks include refilled saved-board DRC, schematic parity/netlist,
  physical footprint orientation, loop/return review, mechanical contact/lead
  clearance, solder/rework access and Gerber inspection. DRC alone is insufficient.

## Evidence and boundaries

Fresh read-only official Konnect MCP result:
`.konnect-scratch/pcb-method-footprint-read-result.json`, SHA256
`051C323B2358778562897B7CF0DD241A2E6818E57AC5AAD1DE1BE0464654C322`.
Library readback contains 49 pad objects: 37 numbered copper and 12 paste-only.
Assertions for copper count and the 0.20/0.25 mm gaps pass. No live KiCad IPC
socket was detected; this was a saved-library read, not a live PCB inspection.
No fresh whole-board ERC/DRC, footprint inventory audit or manufacturing release.

Primary sources consulted 12 October 2026:
- [PCBWay copper-specific geometry](https://www.pcbway.com/helpcenter/ordering_parameter_instruction/What_is_the_Min_Track_Spacing_for_1oz__2oz__3oz__Copper_weight_.html), including the table image. Local image: `.konnect-scratch/pcbway-copper-table-2026-10-12.png`.
- [PCBWay capability table](https://www.pcbway.com/capabilities.html), copper-specific rows, not general minimums alone.
- [JLCPCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/), two-layer 2 oz geometry and mask requirements.
- [TI BQ25756 datasheet](https://www.ti.com/lit/ds/symlink/bq25756.pdf), SLUSEN5A, section 9, pages 71-73.

No upload to a manufacturer, purchase, new model, PCB synchronization, placement
or routing has been performed or authorized by this proposal.
