# V2 BOM status

## Through-hole capacitor cost study, 12 October 2026

Follow-up implementation: twelve EEU-FR2A101100uF/100V THT capacitors are now
drawn and exported in the BOM, replacing twelve100SXV27M. Standard footprint
pin map and disposable instance checked; wiring unchanged. This is a
**provisional prototype selection**, not full-current qualification: mismatch
and ineffective-remote-bank screens exceed the1.5Arms individual rating.
See [complete study](../../components/panasonic-eeu-fr2a101/README.md).
Fresh price EUR0.795 at10 gives9.54 per bank; DigiKey stock now zero,
Mouser same-day search4356 (direct fetch failed). Recheck before purchase.
The preliminary observations below are historical and superseded where different.

User accepts and favors through-hole bulk capacitors for early builds if cheaper
and electrically suitable. Do not preserve SMD solely for compactness. This is
permission to study alternatives, not acceptance of an exact replacement.
At that preliminary checkpoint, native design contained twelve100SXV27M.

Preliminary candidates (not a qualified bank or purchasing recommendation):

- Panasonic EEU-FR2A101: 100 uF/100 V radial, nominal body 10x20 mm, pitch5 mm;
  1.5 A RMS at100 kHz/105 C, maximum impedance84 mOhm at100 kHz/20 C,
  endurance10000 h at105 C. See [manufacturer FR-A sheet](https://industrial.panasonic.com/cdbs/www-data/pdf/RDF0000/ABA0000C1259.pdf),
  pages1 and6. Indexed [DigiKey EUR listing](https://www.digikey.pt/pt/products/detail/panasonic-industry/EEU-FR2A101/9921030)
  shows EUR1.21 single /0.775 at10, ex VAT, and1617 stock; French page failed
  to open, so recheck actual basket/stock before selection. This wet-electrolytic
  candidate is cheaper per part but has lower ripple capability than the current
  polymer. Impedance is not an interchangeable ESR specification.
- Cornell Dubilier 476AVG100MGBJ: 47 uF/100 V radial polymer. Manufacturer
  [AVG sheet](https://www.cde.com/resources/catalogs/AVG.pdf) indexed row gives
  38 mOhm/2.1 A; full primary document open failed, so confirm conditions and
  mechanics before using these data. Fresh [DigiKey FR](https://www.digikey.fr/en/products/detail/cornell-dubilier-knowles/476AVG100MGBJ/5412750)
  shows7470 stock, EUR3.54 single /2.396 at10 ex VAT. Not automatically cheaper
  as a complete bank once ripple sharing and count are included.

Before a substitution: recalculate input/output banks separately, including
local versus remote current sharing, ESR/impedance over temperature/frequency,
ceramic contribution, minimum capacitance, compensation, startup/inrush,
endurance and total fitted cost/size. Retain local high-frequency ceramic
decoupling. Existing ripple screens5.426 A input/7.680 A output are only
starting assumptions, not proven ratings or permission to sum nameplate
ripple currents and declare a bank qualified. Footprints remain unselected.

## Protection baseline, 10 October 2026

Current refresh, 12 October: CSV inventory regenerated from the 145-component
prelayout export. User approved AONS66923 direction for Q10-Q13; native BOM
still contains SIR870ADP pending electrical and footprint acceptance. Dashboard
top section separates current cost, pending savings and real capacitor basket
pricing. Preserve its manual decisions/projections when regenerating: write
to a review directory first and reconcile. No purchasing release.

Latest: [one input fuse at RECTIFIED_RAW](../docs/SINGLE_INPUT_FUSE_2026-10-10.md).
F_SRC is removed from the base accessory BOM. F1 remains 0456020.ER; the cheap
axial candidate is not a qualified replacement. Only conditional F_BAT remains
in protection-accessories.csv (EUR2.40 single / EUR1.836 at ten). The pair prices
below are historical comparisons, not current base-build extras. Unfused
energy-rich DC sources are unsupported by this one-fuse arrangement.

[protection-accessories.csv](protection-accessories.csv) records conditional
harness fuses, not drawn PCB components: F_SRC 0324020.MX280P (EUR2.29 single)
and F_BAT 0324015.MXP (EUR2.40). Both EUR4.69 single / EUR3.592 at ten, excluding
VAT/shipping/support/assembly. No holders; existing F1/TVS remain unchanged.
See the [decision and limits](../docs/MINIMUM_PROTECTION_DECISION_2026-10-10.md).

Parts/support are within BOX allowance, not added twice. Existing input/output
protection reserves remain until fault qualification is complete; they are NOT
approval to fit the historical active reverse/disconnect circuits. No reduction
to a safety allowance or change to drawn-component cost is claimed here.

## Overall tracker (active, 8 October 2026)

Start with [COST_DASHBOARD.md](COST_DASHBOARD.md) for the overall estimate and
[controller-v2-overall-bom.csv](controller-v2-overall-bom.csv) for every component
in the last exported schematic. [controller-v2-cost-blocks.csv](controller-v2-cost-blocks.csv)
shows the drawn subtotal, complete-block budget and remaining allowance per block.
These are living design records, **not a released ordering BOM**.

Current refreshed checkpoint: 145 components, zero unpriced fitted entries.
Eight new rows are bare PCB probe pads, not fitted purchases. Zero unpriced
does not mean every row is an exact supplier quote: engineering allowances and
unimplemented protection budgets remain explicit. BQ-only
telemetry removes the separate SENSE budget; R1 now belongs to MAIN. The
selected MCP4251/relay selector replaces the legacy digipot interface. Twelve
Panasonic EEU-FR2A101100V THT capacitors now provisionally replace the polymer bank. The pricebook
includes exact current observations for the selector, diode and terminals;
the new input shunt uses an explicit EUR allowance, not a fabricated currency
conversion from its separately recorded USD quote.

The eight selected MLCCs and R75 FEB packaging suffix now have price evidence.
FEB ten-board costing conservatively retains its observed EUR1.87 single price,
not an invented quantity tier. External Semitec 103AT-2 is an offboard accessory:
EUR0.60 single / EUR0.498 at ten observed, included within the existing BOX
enclosure/harness allowance, not added a second time or counted as an extra PCB
component. See [readiness evidence](../docs/CONTINUATION_READINESS_REVIEW_2026-10-08.md)
and [current checkpoint](../docs/SCHEMATIC_VOLTAGE70_2026-10-08.md).

The user selected **BQ25756 and a 70 V-class input/output target**. Actual guarded
input thresholds are below70 V; 67.2 V output is conditional on per-unit achievable
range and calibration, not guaranteed. The current budget
includes one receiver output and USB-powered logic with an optional backup cell.
The AUX 5 V branch and USB/AUX mux are removed; the old estimate is preserved
in the abandoned-AUX archive. Automatic wake is not an assumed requirement.
It excludes all internal dump circuitry. Reference MOSFETs and magnetics are
cost comparators, not automatically approved selections or continuous ratings.

Cost method:

- [pricebook.csv](pricebook.csv) distinguishes dated distributor observations,
  historical estimates and engineering allowances. An exact MPN price takes
  precedence over a generic passive/header allowance. Manufacturer constraints
  are matched too: an ST part is not priced as a same-named unrelated vendor's
  part. Stock is not reserved.
  A generic low-voltage capacitor allowance requires an explicit value rating
  of at most 25 V; high-voltage or unrated capacitors remain unpriced without
  an exact observation instead of inheriting a misleading cheap allowance.
- [project-budget.csv](project-budget.csv) is the **complete cost of each block**,
  including functions not yet drawn. Never add it to the drawn-component total.
  The dashboard takes the larger of this allowance and the priced drawn subtotal.
  A reserve is arithmetic headroom, not a fully specified missing-parts BOM.
- Unknown prices remain blank and are counted explicitly. A zero is used only
  for PCB copper features such as testpads/solder jumpers, not unknown parts.
- Ten-board costs are per board, not the batch total. Exact known quantity breaks
  are used conservatively; no guessed discount on inherited price observations.
- These estimates exclude VAT, delivery and engineering. PCB, cooling, cell,
  enclosure/harness and assembly appear separately, so DIY labor is not hidden
  inside the component cost. The dashboard is not a proposed retail price.

Regenerate only from a fresh hierarchy-aware KiCad XML export:

```powershell
./electrical/v2/bom/update-cost-tracker.ps1 -Netlist <path-to-exported-controller-v2.xml>
```

The script reads structured XML/CSV and writes only BOM/report files. It never
edits KiCad files. A new sheet name or component without a price is deliberately
visible rather than silently omitted. Add exact prices and review block budgets
as the schematic develops. Do not remove mandatory safety budget to meet a target.

Variant cost interpretation: RECTIFIER is AC-specific. MAIN is always part of
the current integrated-converter design; external-converter support is removed.
Other functions/protections remain common.
Exact reference-level variant/DNP lists remain pending design qualification.
CELL is now optional. Full totals include it; a no-cell build subtracts only
that off-board allowance. The common Beetle-style TP4057/RT9080 power circuitry
is still fitted in the present schematic. A cheaper separately designed USB-only assembly is
not implied by subtracting the cell.

## Cost priorities

1. Main converter: the current priced subtotal is EUR89.79-97.22 one-off.
   The dashboard raises the complete-block lower bound to that subtotal rather
   than hiding it behind an older allowance. Twelve Panasonic bulk capacitors
   contribute EUR45.60 under the conservative individual-unit convention. An
   actual one-board basket qualifies for the ten-piece tier: EUR31.02 versus
   EUR12.69 for the old ten-piece TDK bank, a like-for-like EUR18.33 increase.
   This basket delta must not be mixed with the dashboard's per-part single-unit
   convention. The four high-voltage ceramics still
   have sourcing concerns. Compare ripple, bias, lifetime, switching losses
   and cooling together, not only nominal capacitance or FET unit price.
2. Assembly and PCB: separate from component BOM. Fablab self-assembly can avoid
   paid assembly charges, but not the required inspection/testing or package
   difficulty. No two-layer/cheap-copper assumption is approved for the new stage.
3. Qualified DC variant: omitting the AC bridge and its entry connector removes
   roughly EUR10-14 of the current one-off block estimate. Required polarity,
   fault and current protection remain; any shared cooling remains too.
4. Fuses: the inherited main fuse is EUR5.92; the auxiliary fuse has been
   removed with its branch. The main fuse deserves a serviceability/cost comparison, not automatic
   replacement by a 32 V automotive blade fuse in a 70 V-class design. DC interrupting
   rating, fault source and protection coordination must be proven.
5. Logic supply: the latest user direction replaces BQ24074/TPS63031 with
   Beetle's TP4057, discrete diode/PMOS selection and RT9080 LDO. The logic
   inductor is removed. Read the [new cost evidence](BEETLE_POWER_COST_2026-10-08.md)
   and [qualification limits](../docs/BEETLE_POWER_DECISION_2026-10-08.md).
   The saved dual MCP4251 uses one protected CV channel and one spare. Its
   relay/MOSFET/clamp interface is now drawn and priced, with no duplicate DAC.
   Physical qualification and receiver protection remain budgeted separately.

These are optimization priorities, not approved substitutions or a complete
order. Source/date details live in the pricebook. The overall estimate includes
unimplemented functions explicitly, so a cheap partial circuit is not mistaken
for the final controller cost.

No V2 components are approved for purchasing. The dashboard records the exact
exported component count and still-unpriced parts; generic connectors and
jumpers need physical selections before ordering. Drawing an EVM-derived
main-converter part does not qualify its current or thermal rating. The
[V1 BOM](../../v1/bom/controller-v1-current.csv) records
the earlier inventory, not the current V2 schematic or a V2 order list. See the
[active V2 status](../README.md).

The [candidate and cost study](CANDIDATES_AND_COST.md), updated 2026-10-06, compares
main converter and support components, with EUR price observations and separate
planning allowances for 1, 10 and 50 units. It is not an orderable BOM.

Scope update 2026-10-08: no internal dump stage, including optional footprints;
external-load GPIO control only. External-converter assemblies are no longer
part of the active design. `budget-blocks-2026-10-05.csv` remains historical
and includes dump allowances no longer in the base product; the study records the
excluded rows without presenting a new complete quote.

For fablab accessibility, plan AC rectifier fitted / protected DC entry with
rectifier omitted assembly BOMs, with the integrated converter retained. These are design
intent, not validated build recipes. Each published BOM must list exact fitted
and DNP references, mandatory links/adapters, shared protections, cooling,
software profile and acceptance tests. Do not remove an entire protection block
just because its rectifier or converter is omitted. DIY recipes can cover more
combinations than the small number of prebuilt products offered initially.

Select power components after the [output study](../docs/OUTPUT_RECEIVER_STUDY.md)
and generator measurements establish electrical limits and cooling requirements.
