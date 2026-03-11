# TODO

---

## Hardware

- [x] Wire voltage divider (R1=100kΩ, R2=7.5kΩ, bus → GPIO1)
- [x] Calibrate `VDIV_OFFSET_V` against multimeter reading
- [x] Verify stable power reading end-to-end (V × I = W on serial)

---

## Firmware

- [x] Run calibration procedure with voltage divider connected (update `POT_CAL_POWER`)
- [x] Test all 3 modes with Zwift: Manual, ERG, Simulation
- [x] Test EnOcean button disconnected / reconnected while app is live
- [x] Verify 200W ceiling holds (2× halogen pairs + BLUETTI)
- [x] Replace heuristic speed model with proper physics (Newton's method, CdA/Crr)

---

## V2 Hardware — Real Speed + Better Climb Feel

> Current limitation: speed is *computed* from power via physics model, not measured.
> This creates a circular dependency (grade → resistance → power → speed → grade)
> and means resistance softens naturally as cadence drops — the opposite of a real climb.

- [ ] **Add hall effect sensor for real wheel speed**
  - Parts: A3144 sensor + 2× neodymium disc magnets (6×2mm) + 10kΩ resistor (~€3)
  - Magnets zip-tied to spokes near rim; sensor zip-tied to chainstay, gap 2–3mm
  - Wire: VCC→3.3V, GND→GND, OUT→GPIO3 + 10kΩ pullup
  - Formula: `speed = (circumference / n_magnets) / pulse_interval × 3.6`
  - Use `WHEEL_CIRCUMFERENCE_M = 2.07` for 700c wheel, `SPEED_MAGNETS = 2`
  - Implement as interrupt on falling edge, same pattern as cadence sensor

- [ ] **Closed-loop grade control once speed is real**
  - With measured speed, compute required power physics: `P = (Crr·m·g + m·g·grade + ½·ρ·CdA·v²) × v`
  - Use that as dynamic ERG target, updated every control loop tick
  - When rider slows on a climb → target power increases → digipot compensates for generator RPM drop
  - **Effect:** resistance chases you as you slow — gravity-like behavior instead of softening load

- [ ] **V3: eddy current brake for low-RPM floor** *(longer term)*
  - Generator torque drops to near-zero at very low RPM — software can't compensate beyond its physical limit
  - Eddy brake (electromagnet + copper disk on axle, controlled via PWM) adds speed-independent braking force
  - Stack with generator: generator handles main load, eddy brake provides the "gravity floor" at slow cadence
  - This is what mid-range smart trainers (Tacx Flux, Wahoo Kickr Snap) do internally

- [ ] **Flywheel for inertia feel** *(optional, separate from grade accuracy)*
  - Weighted flywheel on the generator shaft gives coast-and-momentum feel
  - No electronics needed — pure mechanical improvement to perceived realism

---

## Documentation / Tutorial

- [ ] Add real photos to `build-tutorial.md` (14 photo placeholders marked)
- [ ] Add photo of CC trim pot location on buck module (most critical image)
- [ ] Add photo of electronics box interior
- [ ] Add wiring diagram image (`docs/images/power-path.png`)
- [ ] Review tutorial with a fresh reader before publishing

---

## Hackathon (deadline: March 25)

- [ ] Bike physically ready and stable for student use
- [ ] Print / share `docs/ble-api.md` with students on Day 1
- [ ] Brief intro session: what the bike sends, what they can control, live demo
- [ ] Confirm students can connect (test with one laptop / phone before event)

---

## Communication

- [ ] Write project page text (website)
- [ ] Draft short punchy pitch (1 paragraph for social / talks)
- [ ] Document the hackathon: photos/video during the event
- [ ] Post-event write-up: what the students built with it
