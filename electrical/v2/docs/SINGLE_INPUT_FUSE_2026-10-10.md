# Single input fuse and bridge fault coverage

10 October 2026, superseding the earlier same-day F_SRC accessory baseline.
User requests one fuse at RECTIFIED_RAW to protect the downstream circuit.

## Adopted arrangement

```text
J8 three-phase AC -> D2 bridge --+
                               +-> RECTIFIED_RAW -> F1 -> BUS_PROTECTED
J1 direct DC ------------------+                           | TVS / converter
```

J1 and J8 must not be used together. One onboard F1 is the base input fuse;
no additional F_SRC accessory is included in the base BOM. Retain existing
F1 0456020.ER 20 A and D1 SMCJ70A for now. This is already the native circuit,
not a new wiring change. No holder, active reverse controller or input diode
is added. F_BAT remains a separate conditional receiver-battery requirement.

The earlier 0324020.MX280P quote is an external-fuse comparison, not an approved
drop-in F1 replacement. Its nominal melting I2t is 631 A2s (10x-current test);
the bridge quotes 680 A2s only for t <10 ms under stated conditions. These
different tests and the absence of total-clearing/hot-corner analysis do not
prove the bridge survives until that fuse opens. Keep the existing faster F1
until a replacement is coordinated. No EUR2.29 onboard saving is claimed.

## What the bridge does

The DBI25-16A contains six diodes. Their topology always selects the most
positive and most negative AC phases to produce DC of the same polarity.
The conclusions below follow from that topology and the exported connections;
they are not hardware fault-test results.

| Input/fault | Bridge behavior | Does F1 cover it? |
|---|---|---|
| Swap AC phases / reverse motor rotation | DC polarity remains the same; phase order changes. | No fault solely from phase order. |
| Excess generator voltage | Rectifies it; does not clamp or regulate it. | Not a voltage cutoff; downstream damage can precede any opening. |
| Short after F1 | Fault current passes through bridge and F1. | Can interrupt if current/time/voltage are within coordinated limits; bridge survival not guaranteed. |
| Excess current / inadequate cooling | Bridge heats; semiconductor damage is possible. | A thermally overloaded bridge can remain below the fuse opening current. |
| Short inside bridge or phase cable | A source-side current loop can bypass F1. | No general protection from a downstream fuse. |
| Reverse DC at J1 with bridge populated | Current can flow from GND through two forward-biased bridge diodes to RECTIFIED_RAW, even with J8 unplugged. | This branch bypasses F1; it need not open. |
| Bridge diode failure | No guaranteed safe failure mode; short and open faults must be considered. | Depends on fault path; do not treat bridge as a sacrificial fuse. |

The bridge has 1600 V repetitive reverse rating per diode, NOT a safe voltage
rating for this controller. Do not connect mains. Manufacturer continuous
rating is 25 A at a maintained 115 C case temperature, but only 4 A free-standing
at 50 C ambient under the specified lead conditions. Cooling is mandatory for
our intended higher currents. Do not infer safe 20 A operation from its name.

Source: [Diotec DBI25 family datasheet](https://diotec.com/files/diotec/productfiles/datasheet/dbi25005a.pdf),
web version 2026-08-18, pages 1-2. The older locally archived 2026-03-24 PDF is
preserved, not overwritten. The web revision confirms the above ratings.

## Limits of the cost reduction

This is a downstream-overcurrent arrangement, NOT whole-input fault protection.
Accepting a broken board does not bound the energy in a bridge/input-cable short.
An unfused energy-rich source at J1 is therefore not a supported connection
under this one-fuse baseline. Such a source must already provide qualified
protection, or require a separately specified protected adapter/source variant.
That is outside the one-fuse base BOM, not a claim the source needs no protection.
Pedal generators still need short-circuit current and winding/cable heating
qualification; limited human power alone does not prove absence of overheating.

DC through two AC terminals could rectify either polarity, but adds diode loss
and different heating/current distribution. It is NOT implemented here, does
not protect against internal bridge faults and is not a reason to rewire J1.

## Saved-design evidence

Fresh hierarchy export via KiCad CLI on 2026-10-10:
`kicad/exports/review-single-input-fuse-2026-10-10/controller-v2.xml`.
SHA-256: `4849098E08171AF5F63DC6112D1CD5EEA92933EB95C4A0E72E0EF68461A2937C`.

- 146 components, 125 nets; exactly one F-numbered component, F1.
- RECTIFIED_RAW: D2.5, J1.1, F1.1.
- BUS_PROTECTED: F1.2, D1.1, JP30.1.
- D2.1 and J1.2 share GND.

Endpoint assertions passed. No native KiCad, PCB or firmware mutations; no new
ERC, hardware-fault test or safety certification is claimed. Konnect toolset
loading responded, but loaded schematic functions were not exposed to this
client, so no native annotations were attempted. JP20/JP30/JP31 stay open.
