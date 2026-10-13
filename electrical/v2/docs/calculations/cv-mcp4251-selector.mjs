import assert from 'node:assert/strict';

// Static divider study only. Does not model MOSFET saturation or relay transients.
const parallel = (a, b) => a === 0 || b === 0 ? 0 : a * b / (a + b);
export function output({ code, track = 50000, wiper = 75, bleed = 110000,
  top = 249000, guard = 7500, fet = 4.8, reference = 1.536, injection = 0 }) {
  const rheostat = track * code / 256 + parallel(wiper, track * (256 - code) / 256);
  const lower = parallel(rheostat, bleed);
  return reference + top * (reference - injection * lower) / (guard + fet + lower);
}

const references = Array.from({ length: 32 }, (_, n) => 1.504 + 0.002 * n);
function nearestBelow(target, parameters = {}) {
  let best = null;
  for (let code = 0; code <= 256; code++) {
    for (let trim = 0; trim < references.length; trim++) {
      const volts = output({ ...parameters, code, reference: references[trim] });
      if (volts <= target && (!best || volts > best.volts)) best = { code, trim, volts };
    }
  }
  return best;
}

let cases = 0;
let highestFloor = 0;
let lowestCeiling = Infinity;
for (const track of [40000, 60000]) for (const wiper of [0, 300]) {
  for (const top of [249000 * .999, 249000 * 1.001]) {
    for (const guard of [7500 * .999, 7500 * 1.001]) {
      for (const bleed of [110000 * .99, 110000 * 1.01]) {
        for (const fet of [0, 4.8]) for (const gainError of [.993, 1.007]) {
          const parameters = { track, wiper, top, guard, bleed, fet };
          const floor = output({ ...parameters, code: 256, reference: 1.504 * gainError });
          const ceiling = output({ ...parameters, code: 0, reference: 1.566 * gainError });
          highestFloor = Math.max(highestFloor, floor);
          lowestCeiling = Math.min(lowestCeiling, ceiling);
          assert(floor < 12, 'Minimum reference must permit a setting below 12 V');
          assert(ceiling < 55, 'Static guard must remain below 55 V');
          cases++;
        }
      }
    }
  }
}
assert(output({ code: 150, injection: 2e-6 }) < output({ code: 150 }),
  'Upper clamp reverse leakage injects current and lowers target');
assert(output({ code: 150, injection: -2e-6 }) > output({ code: 150 }),
  'Lower clamp reverse leakage removes current and raises target');
const coilSeries = 6.8;
const coilNominalCurrent = 3.3 / (64.3 + coilSeries + .085);
const coilCorners = [];
for (const rail of [3.3 * .98, 3.3 * 1.02]) {
  for (const coil of [64.3 * .9, 64.3 * 1.1]) {
    for (const series of [coilSeries * .99, coilSeries * 1.01]) {
      const current = rail / (coil + series + .085);
      const volts = current * coil;
      assert(volts > 2.85 && volts < 3.15, 'Coil must stay within nominal +/-5%');
      coilCorners.push({ current, volts, power: current * current * coil });
    }
  }
}
const pickupAt3V = 3 * (64.3 * .9) / (64.3 * .9 + coilSeries * 1.01 + .085);
assert(pickupAt3V > 2.25, 'Exceeds maximum initial pickup at20C, not a hot guarantee');
const minPmosVgs = 3 * .9 * (10000 * .99) / (10000 * .99 + 100 * 1.01);
assert(minPmosVgs >= 2.5, 'VOL and gate divider must preserve2.5V drive at3V');
const guardMaximum = 1.566 * 1.007 * (1 + 249000 * 1.001 / (7500 * .999));
assert(guardMaximum < 55);
const profiles = [12, 14.4, 18, 24, 29.4, 36, 42, 50.4, 52, 54.6].map(target => ({
  target, nominal: nearestBelow(target),
  track40k: nearestBelow(target, { track: 40000, wiper: 300 }),
  track60k: nearestBelow(target, { track: 60000, wiper: 300 }),
}));
const report = {
  status: 'STATIC STUDY ONLY; not receiver/transient qualification', cases,
  nominalAtDefaultReference: { code0: output({ code: 0 }), code128: output({ code: 128 }),
    code256: output({ code: 256 }) },
  highestFloorWithMinimumTrim: highestFloor, lowestCeilingWithMaximumTrim: lowestCeiling,
  guardMaximum, offLeakNodeAt25C: 1e-6 * 110000 * 1.01,
  coil: { nominalCurrent: coilNominalCurrent, nominalVolts: coilNominalCurrent * 64.3,
    minimumVolts: Math.min(...coilCorners.map(x => x.volts)),
    maximumVolts: Math.max(...coilCorners.map(x => x.volts)),
    maximumCurrent: Math.max(...coilCorners.map(x => x.current)), pickupAt3V,
    minPmosVgs, cornerCases: coilCorners.length },
  profiles,
  exclusions: [
    'MCP R-INL +/-2 LSB and temperature drift are NOT included in profile numbers',
    'BQ trim accuracy, diode/FET hot leakage, relay timing and loop overshoot need bench validation',
    'Numerical floor/ceiling span does not guarantee every intermediate target is achievable',
    'Fallback uses retained BQ reference until software restores it or BQ resets',
  ],
};
console.log(JSON.stringify(report, null, 2));
