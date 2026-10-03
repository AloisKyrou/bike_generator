# Future-agent handoff

Handoff prepared on **3 October 2026** for continuing the bike-generator
controller work in a fresh Codex conversation or on another computer.

This folder is a compact navigation and operating layer. It does not replace the
KiCad design, manufacturer datasheets, BOM, or review records. Follow the links
to the canonical files whenever a value matters.

## Start here in a fresh session

1. Read the repository-level [`AGENTS.md`](../AGENTS.md).
2. Read [`electrical/AGENTS.md`](../electrical/AGENTS.md) completely.
3. Read [`KONNECT_WORKFLOW.md`](KONNECT_WORKFLOW.md) before any KiCad action.
4. Read [`V1_STATE.md`](V1_STATE.md) for the current electrical baseline.
5. Read [`NEXT_STEPS.md`](NEXT_STEPS.md) before preparing fabrication files.
6. Run `git status -sb` and `git log -3 --oneline` before changing anything.
7. Report any local changes or missing tools before proceeding.

A ready-to-copy conversation starter is available in
[`FRESH_SESSION_PROMPT.md`](FRESH_SESSION_PROMPT.md).

## Repository and design baseline

- Repository: `AloisKyrou/bike_generator`.
- Primary branch at handoff: `main`.
- Reviewed controller-design baseline: commit `aefcb01`
  (`feat(controller): finalize V1 design and sourcing`).
- At handoff creation, local `main` was **8 commits ahead of `origin/main`**.
  A fresh computer will not see those commits until they are pushed.
- KiCad project root:
  `electrical/kicad/bike-generator-controller/`.
- KiCad project file:
  `electrical/kicad/bike-generator-controller/bike-generator-controller.kicad_pro`.
- Toolchain used: KiCad 10.0.6 plus Konnect 0.12.1.

Do not assume the commit count or tool versions are still current. Recheck them
on the new machine.

## Current outcome in one paragraph

Controller V1 is fully routed and electrically coherent for a **12–70 VDC
rectified bus**, with a 400 W peak architecture target but a much more typical
100–150 W operating region and approximately 250 W rider peaks. The schematic
uses the pin-compatible `INA238AIDGSR`, not the unavailable INA228, and the PCB
metadata/BOM match. The last recorded ERC had 0 errors and 0 warnings. The last
saved-file DRC had 0 design-rule violations and 0 unconnected items; its only
four parity messages were intentional board-only mounting holes H1–H4. Thermal
capability at high current is not yet qualified, and fabrication release remains
blocked until the KiCad stackup metadata is aligned to the intended 3 oz copper
and the formal manufacturing package is regenerated and reviewed.

## Canonical documents

| Topic | Source of truth |
|---|---|
| Complete sheet-by-sheet electrical review | [`electrical/docs/V1_SCHEMATIC_REVIEW.md`](../electrical/docs/V1_SCHEMATIC_REVIEW.md) |
| Pre-fabrication decisions | [`electrical/docs/PREFAB_DECISIONS_2026-09-28.md`](../electrical/docs/PREFAB_DECISIONS_2026-09-28.md) |
| PCB order contract and release gate | [`electrical/bom/pcb-order-v1.md`](../electrical/bom/pcb-order-v1.md) |
| Current grouped schematic BOM | [`electrical/bom/controller-v1-current.csv`](../electrical/bom/controller-v1-current.csv) |
| Five-board purchasing BOM | [`electrical/bom/controller-v1-order-5pcs.csv`](../electrical/bom/controller-v1-order-5pcs.csv) |
| Two-supplier sourcing plan | [`electrical/bom/sourcing-plan-v1.md`](../electrical/bom/sourcing-plan-v1.md) |
| Assembly supplies outside the BOM | [`electrical/bom/assembly-supplies-v1.md`](../electrical/bom/assembly-supplies-v1.md) |
| Existing workshop stock | [`electrical/bom/workshop-stock.md`](../electrical/bom/workshop-stock.md) |
| KiCad workflow and troubleshooting | [`electrical/kicad/WORKFLOW.md`](../electrical/kicad/WORKFLOW.md) |
| Connection audit | [`electrical/kicad/CONNECTION_AUDIT.md`](../electrical/kicad/CONNECTION_AUDIT.md) |
| Project net classes and limits | [`electrical/kicad/NETCLASSES.md`](../electrical/kicad/NETCLASSES.md) |
| V2 integrated-controller direction | [`electrical/docs/CONTROLLER_V2_INTEGRATED_SPEC.md`](../electrical/docs/CONTROLLER_V2_INTEGRATED_SPEC.md) |

## Source-of-truth hierarchy

When documents disagree, resolve them in this order:

1. exact manufacturer datasheet and the selected orderable MPN;
2. saved KiCad schematic/PCB plus direct ERC/DRC/connectivity evidence;
3. current exported BOM;
4. the dated V1 review and pre-fabrication decision documents;
5. older audits, roadmaps, prototype notes, screenshots, and conversation memory.

Some older files still use `INA228` because they document the original part or
because the hierarchical sheet deliberately retains the legacy name
`INA228_SENSE`. Do not mass-rename it: that would churn hierarchy paths and net
names without improving the V1 hardware.

## Communication style that worked well

- Lead with the concrete result and evidence.
- Explain electrical trade-offs plainly; the user is learning PCB design but is
  comfortable with detailed engineering reasoning.
- Make safe, reversible progress autonomously.
- Ask only when a decision changes architecture, cost, manufacturer submission,
  or physical assumptions.
- For visual/manual KiCad steps, give exact menu or key instructions and then
  verify the saved file independently.
- Never claim “clean” merely because a GUI looks right; confirm with saved-file
  ERC/DRC and parity evidence.
