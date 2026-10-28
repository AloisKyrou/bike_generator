# Future board variants

User direction, 13 October 2026: plan for
a later controller without the integrated buck-boost, using INA voltage/current
sensing and both digital-potentiometer channels for an external converter.

Keep one repository with separate KiCad projects/PCBs per hardware variant.
Share verified libraries and documented reusable blocks. Do not treat netclass
selection as a circuit-variant mechanism or silently reintroduce INA/external
conversion into the current integrated V2.

Latest clarification: historical classes can be removed from the V2 project;
the separate V1 project and the pre-routing commit preserve their history.
The present V2 routing uses explicitly named V2 classes and checked assignments.
Old names/current ratings are not specifications for the future board.

Future variant work must check the external converter's analog control voltages,
digipot power-off behavior, current-sense/shunt requirements and source/USB
interfaces. The old V1 can inform it, but is not an automatically compatible
drop-in design. No future PCB, BOM or firmware implementation is authorized by
this note alone; finish the present V2 routing experiment first.
