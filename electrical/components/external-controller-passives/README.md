# External-controller passive selection, 15 October 2026

36 missing schematic purchasing references have been completed without changing
nominal values, footprints or nets. These are prototype BOM selections, not
a complete purchasing/assembly release. Archived Yageo exact-part PDFs and
SHA-256/source URLs are listed in `sources.csv`.

| References | MPN | Basis |
|---|---|---|
| R101,R102 | RC0805FR-0710RL | 10 Ohm, same family as input INA filter |
| R11,R30,R31,R36,R37 | RC0805FR-0710KL | 10 kOhm |
| R32,R33 | RC0805FR-0722RL | 22 Ohm |
| R4,R6 | RC0805FR-074K7L | 4.7 kOhm |
| R7,R8,R9,R10,R34,R35,R51 | RC0805FR-071KL | 1 kOhm |
| R46,R47 | RC0805FR-072KL | 2 kOhm |
| R48 | RC0805FR-07200KL | 200 kOhm |
| R49,R50 | RC0805FR-075K1L | 5.1 kOhm |
| C102,C31,C4,C50 | CC0805KRX7R9BB104 | 100 nF, 50 V, X7R |
| C103,C32 | CC0805KKX7R7BB105 | 1 uF, 16 V, X7R |
| C101 | C2012X7R2A104K125AA | 100 nF, 100 V, X7R |
| J28,JP20 | M20-9990246 | 1 x 2 header |
| J7,J9 | M20-9990346 | 1 x 3 header |
| J3 | M20-9990446 | 1 x 4 header |
| J5 | M20-9980546 | 2 x 5 header |

Yageo RC0805FR parts are 0805, 1%, 0.125 W. These resistors are in logic and
sense circuits, not the 10 A load path. Capacitor voltage ratings exceed the
drawn low-voltage labels; the schematic values remain unchanged. C101 is the
differential INA input filter, not a bus-to-ground energy-storage capacitor.
[TDK exact-part record](https://product.tdk.com/en/search/capacitor/ceramic/mlcc/info?part_no=C2012X7R2A104K125AA).

Harwin M20 headers use 2.54 mm pitch, 0.64 mm square pins and 3 mm PCB tails.
The two-row spacing is 2.54 mm. The M20-998 drawing, issue 24 / 17 December
2018, is archived here; the M20-999 drawing is already archived under
`../v2-service-headers/harwin-m20-999.pdf`. Drawings show side/end elevations,
not a mirrored numbered PCB pin map. Unkeyed continuous pin headers follow
the PCB's pin-1 marker; J5 preserves its odd/even two-row convention.
Recommended hole is 1.02 +/- 0.05 mm; existing 1.00 mm nominal drill is inside
that interval, but final hole tolerances and sample fit must still be checked.
These headers are NOT 10 A terminals. JP20 additionally needs a removable
2.54 mm jumper cap if battery charging is enabled; it defaults open.
[M20-9990446](https://www.harwin.com/products/M20-9990446),
[M20-9980546](https://www.harwin.com/products/M20-9980546).

## Five Capacitors: Prototype Selection

C30/C42/C45/C46/C47 now use **GRM21BR61C106KE15L**, Murata 10 uF/16 V,
X5R, 0805, LCSC C77075, marked PROVISIONAL in CAD. The older Yageo
CC0805KRX5R6BB106 candidate was not assigned: its archived sheet lacks
DC-bias data. Murata's typical curves were inspected, including temperature
and ESR. Same nominal capacitance/package, no wiring or placement change.

C30/C47 see 3.3 V, C45 the protected 1S rail, C42 TP_VCC and C46 SYS_BAT.
See [rail calculations, sources and charger reservation](../../external-converter/CAPACITOR_SELECTION_2026-10-15.md).
This closes missing MPNs, not all effective-capacitance qualification: C42 is
now after R45, directly on TP4057.VCC. The local bypass topology is corrected;
charger operation still requires qualification; JP20 stays OPEN. LDO margin is supported by typical data,
not a guaranteed combined bias/temperature/aging bound.
LCSC observed USD0.0414 each at MOQ10, 295590 in stock on 15 October 2026.
No new supplier, order, currency conversion or capacitor footprint was added.

## Sourcing

Retain one broad-line supplier plus LCSC where the charger/USB/INA require it.
The Yageo and Harwin families are already used elsewhere on this project.
Representative LCSC candidates: 1 uF C94122, R22 C107702, R4.7k C60816,
R1k C95781, R2k C114572, R200k C114562 and R5.1k C84375. Confirm exact
MPN, packaging, quantity break and stock in the final basket. Do not silently
substitute generic headers or a different resistor/capacitor series.
