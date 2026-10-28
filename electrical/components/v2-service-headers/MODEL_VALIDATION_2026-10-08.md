# Service Header Model Validation

Provisional selected family: Harwin M20-9990246 (2 contacts), M20-9990346
(3 contacts), M20-9990646 (6 contacts), tin finish, 2.54 mm pitch.
Official source: https://content.harwin.com/asset/640f59f4-1860-40fe-82ef-f2a104ffa7d8/DRG-00479-Technical-Drawing-Datasheet-M20-999-pdf.pdf
Archived as `harwin-m20-999.pdf`, drawing issue 23, 17 December 2018.

The drawing specifies 0.64 +/-0.02 mm square leads and 1.02 +/-0.05 mm
recommended PCB holes. The maximum lead diagonal is 0.934 mm. The stock
KiCad `Connector_PinHeader_2.54mm:PinHeader_1x0N_P2.54mm_Vertical` models
have 1.00 mm drills and 1.70 mm copper pads at 2.54 mm pitch. These holes
are within the drawing range; finished-hole tolerance remains a fabrication
requirement. Body width is 2.54 mm and length is 2.54*N mm; stock courtyard
encloses the manufacturer's body tolerance. These are unkeyed headers:
project pin 1 is the square-pad end, then consecutive contacts 2 through N.
No manufacturer polarity is invented. Mating cable orientation must be marked.

All 2, 3 and 6 physical pads were read from scratch KiCad placements via
Konnect, then the actual placements were exported through native KiCad SVG
and visually inspected: `.konnect-scratch/v2-completion-2026-10-08/models/headers.png`.
No real PCB was changed. Only low-voltage service interfaces use these parts;
J30/J31 and JP30/JP31 high-current boundaries are explicitly excluded.

Wurth 61300x11121 drawings were also archived for comparison, but not selected:
their stated 0.64 +/-0.15 mm square lead tolerance does not establish fit in
the stock 1.00 mm drill. Header ratings do not establish field protection or
authorize externally driving the board's 3.3 V rail.
