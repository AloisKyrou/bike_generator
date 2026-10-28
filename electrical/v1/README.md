# Controller V1

Reviewed design baseline: `aefcb01`. Relocated on 2026-10-05 without changing
KiCad source or library bytes. V1 remains the reference prototype while V2 is
developed independently.

Open [bike-generator-controller.kicad_pro](kicad/bike-generator-controller/bike-generator-controller.kicad_pro).

- [Review](docs/V1_SCHEMATIC_REVIEW.md).
- [PCB order contract and release gate](bom/pcb-order-v1.md).
- [Current schematic BOM](bom/controller-v1-current.csv).
- [Five-board purchasing BOM](bom/controller-v1-order-5pcs.csv).
- [KiCad workflow](kicad/WORKFLOW.md).
- [V2 workspace](../v2/README.md).

Specified rectified input remains 12-70 VDC. Thermal qualification and
manufacturing release are outstanding. Stackup metadata still needs alignment
with the intended 3 oz / ENIG order.

Library tables use project-relative paths. Five placed 3D models and their
library footprints still reference the original computer's absolute path.
See the [migration record](../v2/docs/BASELINE_AND_MIGRATION.md). Repair through
KiCad/Konnect before mechanical review; do not patch serialized files.
