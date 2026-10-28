# External controller: five 10 uF capacitors

15 October 2026. Prototype BOM selection only, not fabrication or charging
approval. Applies to the external-converter project, not integrated V2.

## Selection

C30/C42/C45/C46/C47 now specify **Murata GRM21BR61C106KE15L**, LCSC C77075:
10 uF nominal, 16 V, +/-10%, X5R, 0805. The drawn value is `10uF/16V`.
Nominal capacitance, footprint, placement and connections are unchanged.
All five carry a PROVISIONAL qualification note in schematic/PCB metadata.

Manufacturer dimensions are 2.0 +/-0.1 by 1.25 +/-0.1 mm, height
1.25 +/-0.1 mm. Existing standard `C_0805_2012Metric` retained: two nonpolar
terminals, no pin-map change. No custom footprint or denser package. Keep
normal MLCC soldering precautions: avoid thermal shock, pressure on the ceramic
body and board bending. It remains an accessible 0805 part, not THT.

The archived Murata product-search sheet is dated 19 March 2023. Pages 1-2
identify the exact part/package and ratings; page 3 gives typical bias/ESR
curves; page 4 gives temperature/ripple curves. These are typical data, NOT
guaranteed combined worst-case capacitance. The newer exact reference-spec
URL did not download successfully; do not claim a current approval sheet.
[Murata-authored sheet, hosted by Farnell](https://www.farnell.com/datasheets/3929902.pdf).

## Actual Rails And Margin

Rounded readings from the 25 C bias curve, not measurements:

| Ref | Net / use | Approximate effective capacitance |
|---|---|---:|
| C30 | +3V3, local MCU storage | 6.5-6.8 uF at 3.3 V |
| C47 | +3V3, RT9080 output | 6.5-6.8 uF at 3.3 V |
| C45 | BAT_1S, charger BAT / protected cell | 5.7-6 uF at 4.2 V |
| C42 | USB VBUS, upstream of R45 | 4.8-5 uF at 5-5.25 V |
| C46 | SYS_BAT, RT9080 input | about 4.8 uF typical at 5.25 V |

Higher voltage rating alone does not guarantee higher effective capacitance.
The examined 25 V alternative did not justify its higher cost here. The earlier
Yageo candidate had no usable bias curve in its archived exact-part document.

A sensitivity calculation multiplies typical bias capacitance by 0.90 for
initial tolerance, 0.85 for the X5R temperature envelope, and an assumed 0.90
aging allowance. At 5.25 V this gives about 3.3 uF; at 3.3 V about 4.5 uF.
The aging factor is an engineering assumption, NOT a Murata specified aging
rate or lifetime guarantee. Independent multiplication also does not bound
combined bias/temperature/aging behaviour. At an illustrative 5.5 V, using
4.5 uF from the graph gives about 3.1 uF by the same screen.

RT9080 DS9080-09, pages 3 and 13, calls for a 1 uF input capacitor and a
ceramic output capacitor; pin guidance gives 0.7 uF effective minimum, while
application guidance recommends >1 uF and ESR >=1 mOhm. The prototype has
useful capacitance margin against the conservative 1 uF criterion. The typical
Murata ESR curve stays above roughly 3 mOhm around its minimum. Neither curve
proves board-level stability. Check startup, USB/cell transfer and MCU radio
load steps at U7 pins and at U2 before qualifying operation.
[Richtek RT9080](https://www.richtek.com/assets/product_file/RT9080/DS9080-09.pdf).

## Charger Reservation, Not Hidden By An MPN

TP4057 Rev2.2 specifies at least one 10 uF bypass capacitor at VCC and its
application uses 10 uF at VCC/BAT. It does not provide a clear lower effective
capacitance allowance. This selection supplies 10 uF NOMINAL, not 10 uF under
DC bias, so a strict effective-10-uF interpretation is not met.
[Top Power TP4057](https://www.toppwr.com/uploadfile/file/20240913/66e3cef054ad8.pdf).

The exported circuit places C42 on VBUS_USB, **before R45 (0.82 Ohm)**.
U6.VCC is on TP_VCC after R45; no local capacitor is drawn on that net. This
is the inherited Beetle-style circuit, not an exact copy of the TP4057 direct
VCC-bypass application. Selecting an MPN does not resolve that distinction.
C45 is on BAT_1S, not SYS_BAT. Do not describe C42 as directly across U6.VCC.

Keep JP20 OPEN. Before enabling recharge, settle the VCC bypass requirement
(manufacturer clarification or a deliberate local bypass correction), then
test VCC/BAT ripple, charge current/termination, cell-absent behaviour and
USB hotplug under a suitable current-limited source. Qualify the protected
cell for the actual programmed current (R46=2k, nominal 400 mA). USB current
budget/backfeed/inrush and host safety remain separate requirements.

Do not silently increase C42 to 22/47 uF to obtain 10 uF effective: extra
VBUS capacitance changes USB inrush. Do not promise recharge compatibility
from a clean ERC/DRC. The two charger capacitor entries explicitly retain
this reservation in their exported DesignStatus.

## Availability And Cost

Observed 15 October 2026: LCSC lists 295590 pieces, minimum/multiple 10,
USD0.0414 each at 10. Five fitted parts represent USD0.207; buying ten is
USD0.414 before tax/freight. Stock is not reserved. No currency conversion or
order was made. This uses an existing intended supplier, not another basket.
[LCSC C77075](https://www.lcsc.com/product-detail/C77075.html).

Existing EUR planning allowances remain unchanged, separate from that USD
observation. All purchasable schematic rows now have an MPN; this is NOT
equivalent to all parts being qualified or a complete supplier cart.

## Evidence

Archived under `../components/external-controller-passives/`:
`GRM21BR61C106KE15L-characteristics-20230319.pdf`.
SHA-256: `10CC75D69025BA450626BFAEE4937D849C40D0E9C3D2EBD9CAA2BFFA7DC965F0`.
Source URL: the Farnell-hosted Murata sheet linked above; downloaded 15 October.
Other IC sheets are already archived in `../components/beetle-power-v2/`.

CAD/check evidence is under `kicad/exports/capacitors-2026-10-15/`.
Saved-file ERC: zero violations. DRC: zero errors, four existing silk-edge
warnings, zero unconnected items. Parity: only board-only H1/H2/H4. Konnect
sync: noop. Direct verifier and all 12 negative fixtures pass (81 parts/84 nets).
Regression confirms all 585 trace records, 84 placements and 39 pad-stack
definitions unchanged; both edited schematic pages were visually inspected.
No power test or fabrication release is implied by these review artifacts.
