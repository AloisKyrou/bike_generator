import assert from 'node:assert/strict';

// Conditional static circuit model, not converter or relay transient simulation.
const parallel = (a, b) => a === 0 || b === 0 ? 0 : a * b / (a + b);
const topNominal = 249000;
const guardNominal = 5620 + 200;
const bleedNominal = 150000;
const resistorError = .001 + 25e-6 * 100;
const references = Array.from({ length: 32 }, (_, n) => 1.504 + .002 * n);
function output({code, track = 50000, wiper = 75, top = topNominal,
  guard = guardNominal, bleed = bleedNominal, fet = 4.8,
  reference = 1.536, drainLeakage = 0}) {
  const pot = track * code / 256 + parallel(wiper, track * (256 - code) / 256);
  const lower = parallel(pot, bleed);
  const branchCurrent = (reference - drainLeakage * guard) / (guard + fet + lower);
  return reference + top * (branchCurrent + drainLeakage);
}
const guardMaximum = 1.566 * 1.007 *
  (1 + topNominal * (1 + resistorError) / (guardNominal * (1 - resistorError)));
assert(guardMaximum < 70);
let highestFloor = 0;
let lowestCeiling = Infinity;
let cases = 0;
for (const track of [40000, 60000]) for (const wiper of [0, 300]) {
  for (const top of [topNominal * (1 - resistorError), topNominal * (1 + resistorError)]) {
    for (const guard of [guardNominal * (1 - resistorError), guardNominal * (1 + resistorError)]) {
      for (const bleed of [bleedNominal * (1 - resistorError), bleedNominal * (1 + resistorError)]) {
        for (const fet of [0, 4.8]) for (const accuracy of [.993, 1.007]) {
          const parameters = {track, wiper, top, guard, bleed, fet};
          const floor = output({...parameters, code: 256, reference: 1.504 * accuracy});
          const ceiling = output({...parameters, code: 0, reference: 1.566 * accuracy});
          assert(floor < 12);
          assert(ceiling < 70);
          highestFloor = Math.max(highestFloor, floor);
          lowestCeiling = Math.min(lowestCeiling, ceiling);
          cases++;
        }
      }
    }
  }
}
function nearestBelow(target, parameters = {}) {
  let best = null;
  for (let code = 0; code <= 256; code++) for (let trim = 0; trim < 32; trim++) {
    const voltage = output({...parameters, code, reference: references[trim]});
    if (voltage <= target && (!best || voltage > best.voltage)) best = {code, trim, voltage};
  }
  return {...best, error: target - best.voltage};
}
const profiles = [12, 14.4, 24, 29.4, 42, 50.4, 54.6, 58.8, 63, 67.2].map(target => ({
  target,
  nominal: nearestBelow(target),
  track40kWiper300: nearestBelow(target, {track: 40000, wiper: 300}),
  track60kWiper300: nearestBelow(target, {track: 60000, wiper: 300}),
}));
const ratioMax = (1 + resistorError) / (1 - resistorError);
const ratioMin = 1 / ratioMax;
const maxZeroResistanceRatio = (70 / (1.566 * 1.007) - 1) / ratioMax;
const minimumGuardFor70 = topNominal / maxZeroResistanceRatio;
const maxPossibleWorstCornerReach = 1.566 * .993 *
  (1 + topNominal * (1 - resistorError) /
    (minimumGuardFor70 * (1 + resistorError) + parallel(parallel(300, 60000),
      bleedNominal * (1 + resistorError)) + 4.8));
assert(maxPossibleWorstCornerReach < 67.2);
const clamp = {
  maximumFeedWithShortedClamp: 70 / ((topNominal + guardNominal) * (1 - resistorError)),
  currentAtLowKnee: (70 - 25) / ((topNominal + guardNominal) * (1 - resistorError)),
  currentAtHighKnee: (70 - 28.9) / ((topNominal + guardNominal) * (1 + resistorError)),
  highTemperatureExtrapolation: 28.9 + .0253 * 100,
  maximumDcPowerAnyClampVoltage: 70 ** 2 / (4 * (topNominal + guardNominal) * (1 - resistorError)),
  upperResistorMaximumDcPower: 70 ** 2 / (topNominal * (1 - resistorError)),
  normalColdLeakageMaxOutputOffset: topNominal * (1 + resistorError) * 50e-9,
  capacitance: 70e-12,
};
assert(clamp.currentAtHighKnee > .1e-3);
assert(clamp.currentAtLowKnee < 2e-3);
assert(clamp.maximumDcPowerAnyClampVoltage < .005);
assert(clamp.upperResistorMaximumDcPower < .125 / 4);
const codeSteps = [0, 1, 4, 16, 64, 128, 255].map(code => ({code,
  volts: output({code}), stepToNext: output({code}) - output({code: code + 1}),
  i2c2mVStep: output({code, reference: 1.538}) - output({code}),
}));
console.log(JSON.stringify({
  status: 'STUDY: static resistor/reference corners, not receiver or transient qualification',
  values: {topNominal, guardNominal, bleedNominal, resistorError}, cases,
  guardMaximum, highestFloor, lowestCeiling,
  manual: {
    coldBootMaximumIdeal: 1.536 * (1 + topNominal / guardNominal),
    fullTrimMaximumIdeal: 1.566 * (1 + topNominal / guardNominal),
    coldBootMaximumWithTypical33OhmFbg: 1.536 * (1 + topNominal / (guardNominal + 33)),
    minimumAt40kTrackDefaultRef: 1.536 * (1 + topNominal / (guardNominal + 40000 + 33)),
    trimmerFor12WithTypical33OhmFbg: topNominal * 1.536 / (12 - 1.536) - guardNominal - 33,
  },
  digital: {
    coldBootCode0Nominal: output({code: 0}),
    fullTrimCode0Nominal: output({code: 0, reference: 1.566}),
    fullTrimCode0Wiper300: output({code: 0, wiper: 300, reference: 1.566}),
    resetCode128: output({code: 128}),
    nominalCode256: output({code: 256}),
  },
  impossibilityBound: {minimumGuardFor70, maxPossibleWorstCornerReach},
  profiles, codeSteps, clamp, ratioMin,
  exclusions: [
    'FET 4.8 ohm is the earlier specified-drive room-temperature bound, not an all-temperature guarantee',
    'MCP wiper and track endpoint tolerances are included; interior code INL and normal/hot leakage are not',
    'The 27 V zener low-current knee is specified at 25 C; temperature extrapolation is not a guaranteed 0.1 mA hot curve',
    'No global claim of exact intermediate CV, 67.2 V charging, overshoot immunity, or brownout safety',
  ],
}, null, 2));
