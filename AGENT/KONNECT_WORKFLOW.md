# Konnect and KiCad operating workflow

This is the methodology established during the V1 controller work. It is
mandatory for future KiCad changes in this repository.

## Non-negotiable rule

KiCad sources are serialized object graphs, not ordinary text files. Never write
or patch these files directly:

- `*.kicad_sch`
- `*.kicad_pcb`
- `*.kicad_pro`
- `*.kicad_sym`
- `*.kicad_mod`
- `sym-lib-table`
- `fp-lib-table`

Use Konnect/KiCad for every mutation. Generic shell and patch tools are only for
documentation, CSV files, reports, and other non-KiCad files.

## Portable project paths

Resolve the repository root dynamically rather than hard-coding the original
Windows checkout path.

Select the revision explicitly. The V1 paths below are the preserved prototype.
V2 is `electrical/v2/kicad/bike-generator-controller-v2/` with basename
`bike-generator-controller-v2`. Each revision owns its sibling `libraries/`.
Always bind checks and mutations to the intended revision.

```text
electrical/v1/kicad/bike-generator-controller/bike-generator-controller.kicad_pro
electrical/v1/kicad/bike-generator-controller/bike-generator-controller.kicad_sch
electrical/v1/kicad/bike-generator-controller/bike-generator-controller.kicad_pcb
```

The root schematic has six child sheets. Always run hierarchy-aware checks from
the root schematic.

## Start of every KiCad session

1. Read `electrical/AGENTS.md` and this file.
2. Call `list_toolboxes`; do not assume a toolset count from an older session.
3. Call `get_active_toolsets`.
4. Load only the toolsets needed for the task.
5. Confirm the exact project/document path and whether evidence comes from the
   live editor or the saved file.
6. Inspect `git status --short` before mutation.

Common toolsets:

```text
project          save/open/project state
sch_components   symbol fields and placement
sch_wiring       wires, labels, power symbols
sch_analysis     connectivity and shorts
sch_batch        batch schematic changes and annotations
sch_export       ERC, schematic export, schematic-to-PCB synchronization
pcb_components   placed footprint operations and readback
pcb_board        outline, stackup, zones, board text, mounting holes
pcb_routing      tracks, vias, pours and net classes
verification     DRC and design-rule checks
pcb_export       Gerbers, drills, paste, BOM, placement and rendered outputs
manufacturing    fabrication-package validation
design_review    aggregate engineering audits
```

## Mutation sequence

Use a strict plan–apply–readback sequence:

1. Snapshot or record the current state when the change is material.
2. Make one bounded change through Konnect.
3. Inspect the complete result, including diagnostics, coverage and source.
4. Read back the changed object independently.
5. Save the live board with `save_project` before saved-file checks.
6. Run dependent checks sequentially after the save completes.
7. Inspect Git diff/status before committing.

Do not run save, synchronization, ERC and DRC concurrently. KiCad CLI processes
can interfere and return no evidence even when the transport itself succeeds.

## Schematic-to-PCB synchronization

For `update_pcb_from_schematic`:

1. call with `dry_run: true`;
2. review every planned footprint change and the preserved position, rotation,
   layer and pad nets;
3. apply with `dry_run: false` and the exact returned `plan_revision`;
4. save the board;
5. run the dry-run again and require `status: noop` with `changes: []`.

H1–H4 are intentional board-only mounting holes. Synchronization must preserve
all four. They appear as expected “Extra footprint” schematic-parity messages.

## Known field-synchronization trap

External-controller update, 15 October 2026: native Update PCB from Schematic
can synchronize custom fields in one reviewed operation. Disable footprint
replacement/deletion, inspect and save the action list, then verify DRC parity.
It can open a background schematic editor; close that unmodified editor before
the Konnect dry-run, rather than bypassing its open-schematic guard.

Native footprint libraries can also be cached: a changed library ID and GUI
Compare result did not prove J27's new pad sizes had loaded. Save/close/reopen,
native Update Footprints from Library, actual pad-dimension readback and
saved-file DRC resolved the discrepancy. Do not use a typed refresh when it
explicitly rejects unsupported library pad properties.

During the INA228-to-INA238 substitution, schematic-to-PCB synchronization
updated U1's value but did not update every custom footprint field. KiCad DRC
then exposed stale fields one by one:

- `MPN`
- `Datasheet`
- `Description`

If a component MPN changes, explicitly compare those fields in the schematic and
PCB footprint. If Konnect cannot edit a placed custom field, use KiCad's
Footprint Properties UI, save, and verify with saved-file DRC. A clean ERC does
not prove footprint metadata parity.

## Formal verification sequence

1. Save the live board.
2. Run ERC on the root schematic at warning severity.
3. Run DRC against the saved board.
4. Confirm design-rule violations and unconnected items separately.
5. Review every schematic-parity item; never hide unexpected ones.
6. Re-run schematic-to-PCB dry-run and require no planned changes.
7. For a fabrication release, refill zones first and record that the check used
   the refilled saved board.

The last V1 evidence was:

- ERC: 0 errors, 0 warnings.
- DRC: 0 design-rule violations, 0 unconnected items.
- Parity: only intentional board-only H1–H4.
- Schematic-to-PCB dry-run: no changes.

The final recorded CLI DRC used the saved file with `refill_zones: false` because
no copper geometry changed during the INA238 metadata correction. The fabrication
gate must refill zones and run a fresh DRC.

## Interpreting failures

- `AS_BUSY`: KiCad is reachable but a modal dialog or editor operation is
  blocking IPC. Save/dismiss the dialog or close the relevant editor; never fall
  back to direct file editing.
- Timeout or empty output after a possible mutation: inspect the live and saved
  object before retrying. Do not assume rollback.
- Tool unavailable: stop the KiCad mutation, restore the official Konnect MCP
  connection, and continue only when the supported tool is available.
- GUI looks updated but saved-file DRC disagrees: trust neither blindly; save,
  reload and inspect the explicit field or object.

## BOM regeneration

The current grouped BOM was exported from the root schematic with these columns:

```text
Reference,Value,Footprint,Manufacturer,MPN,Datasheet,Description,${QUANTITY}
```

Labels:

```text
References,Value,Footprint,Manufacturer,MPN,Datasheet,Description,Quantity
```

Group by:

```text
Value,Footprint,Manufacturer,MPN,Datasheet,Description
```

Write it to `electrical/v1/bom/controller-v1-current.csv`, then independently inspect
the U1 row and the total grouped-row count.

## Git discipline

- Never delete or stage unknown user files.
- Use explicit `git add -- <paths>` rather than `git add .`.
- Keep generated exports and Konnect snapshots out of normal commits.
- Run `git diff --check` and inspect the staged file list/stat before committing.
- State which local-only files were intentionally left untouched.
