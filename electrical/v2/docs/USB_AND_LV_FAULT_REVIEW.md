# USB and logic-power fault review

Updated 8 October 2026 for the [Beetle power direction](BEETLE_POWER_DECISION_2026-10-08.md).
**Open design work, not permission to connect a PC to the generator-powered board.**

## What is already drawn

USB supplies the system through a diode and charges the optional protected
1S cell through TP4057. A PMOS supplies the system from the cell without USB;
RT9080 produces 3.3 V. USBLC6-2SC6 suppresses data-line ESD. BQ24074,
TPS63031, generator AUX and the TPS2116 mux are absent from the active hierarchy.
There is no intentional generator-powered logic branch, but shared ground and
sense/control interfaces remain. This is not galvanic isolation.

## Cases to close before a usable prototype

| Case | Current circuit / risk | Required evidence or change |
|---|---|---|
| USB only, no backup cell | Diode/LDO path powers logic; there is no combined input-current limiter | Supported source-current policy; cold boot/programming/radio and regulator thermal measurements |
| USB + cell, both valid | System and charger independently draw from USB; 2 kohm PROG is about 400 mA nominal | Sum current against source permission; JP20 stays open until qualification; reverse-current and hot-plug tests |
| Weak USB | Discrete PMOS/diode switching is not BQ24074-style managed prioritization | Check gate/source conditions, source collapse, battery assistance and brownout; do not promise seamless handover |
| Cell on, USB host off | ESP USB pull-up or driven data can reach the connector-side ESD steering network | Prove no unwanted data-to-VBUS/host injection; VBUS detection and/or powered-off-protected data disconnect may be needed |
| USB on, MCU rail off | Host data may reach an unpowered MCU | Check pin injection limits, PHY state and disconnect behavior |
| Main bus present, logic off | BQ and receiver may remain energized with no ESP supervision | Independent default-off and protection; never rely on a pull-up to an absent 3V3 rail |
| Main bus fault into sense/control/ground interfaces | Removing AUX removes one fault path, not all paths to USB | Review actual interfaces and fault energy before claiming PC protection |
| Incorrect USB source / CC short to VBUS | Rd resistors and data ESD do not prove CC/VBUS fault protection | Define supported 5 V sources and connector fault envelope; choose/test protection accordingly |
| Cell reversed / unknown chemistry / temperature | J26 is a two-pin JST PH; TP4057 has no cell NTC input and charging is disabled by default | Protected 4.2 V 1S cell with verified connector polarity and charge/temperature limits; keyed housing alone does not enforce safe polarity |
| Empty cell and radio current pulse | RT9080 cannot boost and the 600 mA headline is not a full-system guarantee | Cell cutoff, LDO dropout/heat, effective capacitance, startup and RF load-step tests |
| Battery-only off | LDO is enabled from SYS_BAT; no storage switch or JP21 remains | Disconnect the cell for storage; quantify sleep leakage and cell cutoff before promising runtime |
| Cell on, USB absent, diode leakage | D20 reverse leakage can bias VBUS and the PMOS gate through the 10 kohm pull-down | Select and qualify D20/Q20 across temperature; an SS14 high-voltage leakage limit is not proof of acceptable behavior at cell voltage |

The data-to-VBUS risk above is a **circuit inference**, not a measured failure:
ST's functional diagram contains steering diodes from I/O to VBUS, while the
MCU can remain powered from its cell. Blocking a power path does not establish
isolation of the separate USB data paths. The new diode is not an ideal blocker.

## Economical candidates, not selected additions

- The former TPS2660/TPS2662 AUX-input protection proposal is abandoned with
  that supply branch, not migrated to USB by default. Define the actual
  remaining fault paths before adding another protection IC.
- A USB analog switch with genuine powered-off protection can address data
  back-powering, but only with correct VBUS/logic-valid enable behavior. TI
  TS3USB221A is a candidate to evaluate, not an isolation barrier. A GPIO-only
  disconnect is insufficient if the problematic state includes reset/ROM boot.
- Full galvanic USB isolation is a separate cost/architecture decision. The
  power connection must cross the isolation barrier correctly too; isolating
  D+/D- while retaining a direct USB-ground/power path defeats that purpose.
- A TVS alone is not a sustained 55-to-5 V fault solution. A crowbar/fuse
  alternative would need explicit available-fault-current, fuse I-squared-t,
  clamp-energy and failure analysis; do not substitute it just because its
  individual parts look inexpensive.

The current LV and input-protection budget includes provisional headroom, but
does not prove these unresolved functions will fit. Report any increase in the
[overall cost dashboard](../bom/COST_DASHBOARD.md), not only in a separate note.

## Sources

- [Archived TI/ST/GCT manufacturer evidence](../../components/ti-lv-power-v2/README.md).
- [Beetle-derived power evidence](BEETLE_POWER_DECISION_2026-10-08.md), including
  the official C3 drawing, TP4057 and RT9080 manufacturer references.
- [ST USBLC6-2 datasheet](https://www.st.com/resource/en/datasheet/usblc6-2.pdf),
  DS4260 Rev 7, functional diagram and layout recommendations.
- [TI TPS2660](https://www.ti.com/product/TPS2660) and
  [TPS2662 datasheet](https://www.ti.com/lit/gpn/tps2662), operating ranges and
  protection functions. Exact orderable variants are not selected.
- [TI TS3USB221A](https://www.ti.com/product/TS3USB221A), USB switch candidate.
- [Espressif ESP32-C3 technical reference manual](https://documentation.espressif.com/esp32-c3_technical_reference_manual_en.pdf),
  USB Serial/JTAG controller and PHY configuration; software is outside this session.
