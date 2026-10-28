# Electrical readiness recheck - 24 October 2026

External-converter controller, independent read-only review. No native CAD,
editor state, routing, footprints, rules or component selection changed here.
The parent design owner handles PCB corrections and the fabrication package.

## Verdict

**No new confirmed schematic defect requiring a redesign before a limited-energy
prototype was found. Overall order readiness still NEEDS ATTENTION.** The known
USB return-path routing issue, connector finished-hole decision and fresh final
fabrication package are pre-order tasks. They are not replaced by passing ERC.

This is a fresh saved-connectivity and ERC recheck against the detailed
[15 October electrical review](FULL_ELECTRICAL_REVIEW_2026-10-15.md), not a claim
that every datasheet, supplier listing or prototype behavior was freshly tested.
That review's electrical interpretation remains applicable because all 287
pin/net assignments and all 81 exported component records are unchanged.

## Fresh evidence

Native KiCad 10.0.6 exports/checks completed sequentially on 24 October:

- `.konnect-scratch/electrical-review-20261024/netlist.xml`: true KiCad XML,
  81 components / 84 nets. SHA256
  `B73841EEE0716105B6963A0D1109FFF5F1F4352DEC11E352FFB9B6F6E0C63F0C`.
- `.konnect-scratch/electrical-review-20261024/erc.json`: nine sheets covered,
  zero errors and zero warnings; timestamp 2026-10-24T17:26:30.
- `verify-netlist.ps1 -InterfaceMode Direct -SelfTest`: PASS, including all
  17 deliberately broken fixtures. The upstream-C42 regression is rejected.
- Comparison against 15 October's independently exported XML: zero differences
  among 287 pin/net assignments; zero component-record differences.
- Saved PCB hash at this review checkpoint:
  `CC446D8AED03ABE445527A3FD0EE7F5F9E3DA734A938B1D602E7A4B2C1468F8D`.
  It is byte-identical to the reviewed 15 October board, before any new owner
  routing changes. Subsequent CAD edits require a new saved-board review.

ERC retains four inherited ignored check categories: single global label,
four-way junction, simulation model and footprint-filter matching. None was
added here. The zero result is bounded by those settings. The 15 October DRC
and aggregate audit are historical evidence, not presented as newly run here.

## Electrical contracts rechecked

| Block | Fresh connectivity observation | Disposition |
|---|---|---|
| Charger bypass | C42.1 = U6.4 = R45.2 = TP_VCC; C42.2 = GND; R45.1 = USB VBUS | Correct local-bypass topology remains; do not move C42 upstream again |
| USB data | U8.4/6 reach D+/D- respectively; series resistors lead to U2 GPIO19/18 | No data polarity/pin-map regression; physical USB return routing is separate |
| Power sharing | Q20 gate1 = VBUS, source2 = SYS_BAT, drain3 = BAT_1S; U7 VIN1 = SYS_BAT, OUT5 = 3V3 | Intentional PMOS body-diode direction preserved, not a polarity error |
| Charge enable | U6 PROG path remains R46/JP20 to ground | JP20 OPEN for first bring-up; opening it does not eliminate all USB current |
| ESP | EN/BOOT, USB and 3V3 remain connected; GPIO20/U0RXD explicitly NC | Native USB flashing/debug, not a physical UART RX/TX pair; keep strap-loading accessories disconnected initially |
| MCP42100 | VDD14, RS11, SHDN12 = 3V3; six A/W/B outputs remain independent | Direct prototype interface as approved; no automatic mechanical fallback |
| Input INA | VS6 = 3V3, GND7 = GND, VBUS8 = sensed bus, IN+10 / IN-9 filtered from distinct Kelvin taps | No supply/common-mode confusion or polarity regression |
| Output INA | VS6/A0 = 3V3, A1/GND7 = GND, VBUS8 = receiver terminal | Address 0x41 distinct from default input 0x40; independent Kelvin path preserved |
| Shared I2C and decoupling | R4/R6 and shared rail capacitors unchanged in the full exported hierarchy | No need for extra pull-ups or bulk capacitors merely to silence sheet-local heuristics |

The prior six heuristic electrical errors were cross-sheet decoupling misses
and INA VBUS-as-supply misclassification. Fresh unchanged connectivity does
not make those six findings real defects. Conversely, it does not establish
USB compliance, thermal limits, correct physical pin soldering or battery safety.

## Prioritized closure

### Before ordering the PCB

1. **Close USB routing finding R1.** The unchanged board still has the documented
   interruptions in the bottom reference under the front USB pair and insufficient
   local return arrangement at layer changes. Owner should perform the bounded
   repair and verify saved geometry, reference copper and DRC. Do not infer a
   guaranteed USB failure or demand a four-layer redesign solely from this.
2. **Close connector hole/process decision M1.** Existing pin maps are not shown
   wrong, but nominal drill sizes do not ensure worst-case finished-hole fit.
   Use the [mechanical review](FULL_MECHANICAL_REVIEW_2026-10-15.md); obtain an
   explicit acceptable process/fit decision or reviewed local changes. A paper
   print cannot validate plated-hole diameter. No post-fab enlargement of PTHs.
3. **Regenerate and inspect one coherent package after changes.** Save/refill,
   fresh ERC/DRC/parity, Gerber/drill inspection and actual manufacturer preview.
   The old `prefab-2026-10-15-final` ZIP remains obsolete. Confirm latest exact
   BOM availability/carts independently of this electrical review.

These are bounded closure tasks. The prototype-only tests below are not reasons
to indefinitely redesign the approved architecture before fabricating samples.

### Before energizing an assembled board

- Begin without cell or converter, JP20 OPEN, using a current-limited 5V source.
  Inspect orientation, solder bridges and rail resistance before power.
- Check the 3V3 rail and USB behavior before using a valuable host computer.
  D20 blocks the direct supply path, not every possible data-line/fault backfeed.
  There is no galvanic isolation or complete USB current-budget manager.
- Verify MCP command response and qualify the actual converter's A/W/B terminals
  within powered logic rails and the project +/-1mA bound before connecting them.
  Initialize logic first, stop the converter before removing logic power.
- Use low-energy, current-limited sources and resistive loads for first main-path
  tests. Do not begin with a battery capable of feeding an uncontrolled fault.

### Tests that require the prototype, not another paper approval

- USB enumeration, flashing, debug, cable/host variations and optional-cell
  handover; charge current/inrush/backfeed; LDO dropout and burst-load thermal
  behavior. JP20 remains OPEN until a suitable protected cell and source are
  qualified. No guaranteed full-cell-range operation is claimed.
- INA addresses, offsets, shunt calibration and I2C rise times; converter-control
  startup, reset and logic-loss behavior on a limited test setup.
- Progressive current and thermal tests for copper, terminals, fuse and bridge.
  The 10A target is not validated continuous operation; the bridge needs cooling.
- Source-specific battery fusing before energy-rich operation. F1 is a 20A fault
  fuse, not a 10A operating limiter; receiver-fed faults and reversed J1 paths
  can bypass it. D1 SMCJ70A is not a guaranteed clamp below the INA's 85V limit.

These restrictions are unchanged accepted prototype boundaries, not newly found
schematic faults. They prohibit a universal-safe-device or no-fire guarantee;
they do not require abandoning the useful limited-energy engineering prototype.

## Handoff

All fresh native CLI processes completed; no live editor or CAD file was mutated.
The owner must update this checkpoint with final routing/mechanical disposition
and a new artifact/source binding before describing files as ready to order.
No upload, purchase or substitution is authorized or performed by this review.
