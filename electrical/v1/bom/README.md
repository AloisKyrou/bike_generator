# Electrical BOM workspace

This directory will hold reviewed BOM snapshots and sourcing notes.

The KiCad schematic will ultimately be the source of truth for component
references and quantities. Files placed here are derived working artifacts and
must state the project revision or Git commit from which they were produced.

Suggested future files:

```text
bom-v1-working.csv
sourcing-notes.md
alternatives.csv
```

Current working snapshot:

- [`controller-v1-working.md`](controller-v1-working.md) — logical controller
  sheets, known values and the decisions still blocking an order.
- [`component-sample-book-0805.md`](component-sample-book-0805.md) — inventory
  of the available 0805 resistor/capacitor sample book and its usable overlap
  with the controller V1.
- [`workshop-stock.md`](workshop-stock.md) — other parts already available in
  the workshop, with their validation status for the controller V1.
- [`controller-v1-current.csv`](controller-v1-current.csv) — raw grouped BOM
  exported from the current saved schematic.
- [`controller-v1-order-5pcs.csv`](controller-v1-order-5pcs.csv) — purchasing
  quantities for five boards, including explicit spares.
- [`assembly-supplies-v1.md`](assembly-supplies-v1.md) — solder paste,
  thermal interface and mechanical hardware kept outside the electronic BOM.
- [`pcb-order-v1.md`](pcb-order-v1.md) — selected bare-board and stencil order
  parameters, plus the remaining release gate.
- [`sourcing-plan-v1.md`](sourcing-plan-v1.md) — proposed two-order split and
  the stock-sensitive lines to recheck immediately before payment.
