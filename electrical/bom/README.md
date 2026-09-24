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

- [`controller-v1-working.md`](./controller-v1-working.md) — logical controller
  sheets, known values and the decisions still blocking an order.
