import assert from 'node:assert/strict';

// Initial tolerance/TCR screens, not transient, aging, or thermal qualification.
const inputNom = 20 / 1.47;
const inputInitialMax = 20.8 / (1.47 * 0.99 * 0.99);
const inputTempMax = inputInitialMax / ((1 - 100e-6 * 130) * (1 - 75e-6 * 130));
assert(inputTempMax < 15);
const corners = [];
for (const f of [212e3, 250e3]) {
  const delta = 55 / (4 * 8e-6 * f);
  const rms = Math.hypot(inputTempMax, delta / Math.sqrt(12));
  // Half-ratio boost: diode current occupies half cycle, triangular ripple.
  const capRms = Math.sqrt(inputTempMax ** 2 / 4 + delta ** 2 / 24);
  const inputCapRms = Math.sqrt(10 ** 2 / 4 + delta ** 2 / 24);
  corners.push({ f, delta, peak: inputTempMax + delta / 2, rms,
    copperLoss25C: rms ** 2 * 0.012, boostCapRms: capRms, buckInputCapRms: inputCapRms });
}
assert(corners[0].boostCapRms > 2 * 3.1);
const localBranchPerCap = (total, localCount, farCount) => {
  const localResistance = .033 / localCount;
  const farResistance = .033 / farCount + .005;
  return total * farResistance / (localResistance + farResistance) / localCount;
};
const outputLocal4of6 = localBranchPerCap(corners[0].boostCapRms, 4, 2);
const outputLocal3of5 = localBranchPerCap(corners[0].boostCapRms, 3, 2);
const inputLocal2of4 = localBranchPerCap(corners[0].buckInputCapRms, 2, 2);
assert(outputLocal4of6 < 1.7);
assert(inputLocal2of4 < 1.7);
assert(outputLocal4of6 < outputLocal3of5);
const screening = {
  inputNom, inputInitialMax, inputTempMax,
  shuntNominalLoss15A: 15 ** 2 * .005,
  // Qg maximum applies at 4.5 V, not a guaranteed bound at actual REGN 5.2 V.
  interleavedTwoEquivalentGateCurrent250k: 2 * 62e-9 * 250e3,
  interleavedRegnLoss55V250k: (55 - 5) * 2 * 62e-9 * 250e3,
  interleavedRegnLoss55V288k: (55 - 5) * 2 * 62e-9 * 288e3,
  pessimisticFourFullRateRegnLoss55V: (55 - 5) * 4 * 62e-9 * 250e3,
  equalEsrShuntSharing: { outputLocal4of6, outputLocal3of5, inputLocal2of4 },
  powerExamples90Percent: [12, 24, 36, 48].map(v => ({v, watts: .9 * v * inputNom})),
  corners
};
console.log(JSON.stringify(screening, null, 2));
console.log('PASS: arithmetic screens only; no hardware safety or ripple-sharing qualification.');
