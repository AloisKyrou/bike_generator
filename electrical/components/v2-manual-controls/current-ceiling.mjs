import assert from 'node:assert/strict';

// Arithmetic study only: K accuracy is not characterized at every trimmer value.
const fixedK = 5.49;
const potK = 50;
const current = (k, fixed, pot, fraction, shuntFactor = 1) =>
  k / ((fixed + pot * fraction) * shuntFactor);

const nominalMaxA = current(50, fixedK, potK, 0);
const nominalMinA = current(50, fixedK, potK, 1);
const endstopMaxA = current(52, fixedK * 0.99, 0, 0, 0.99);
const maxResistanceK = fixedK * 1.01 + potK * 1.1;
const minResistanceK = fixedK * 0.99;
const fullPotWorstCurrentA = current(52, fixedK * 0.99, potK * 0.9, 1, 0.99);
// Separate part temperatures: worst drift magnitude over -55..155 C from 25 C.
const deltaC = 130;
const driftBoundMaxA = current(52,
  fixedK * 0.99 * (1 - 100e-6 * deltaC), 0, 0,
  0.99 * (1 - 110e-6 * deltaC));
assert(endstopMaxA < 10);
assert(driftBoundMaxA < 10);
assert(maxResistanceK < 100);
assert(minResistanceK > 0);
assert(fullPotWorstCurrentA < 1.05);
for (const k of [48, 50, 52]) {
  for (const potFactor of [0.9, 1, 1.1]) {
    let previous = Infinity;
    for (let n = 0; n <= 1000; n++) {
      const value = current(k, fixedK, potK * potFactor, n / 1000);
      assert(value <= previous);
      previous = value;
    }
  }
}
console.log(JSON.stringify({
  nominalMaxA, nominalMinA, endstopMaxA, driftBoundMaxA, maxResistanceK,
  minResistanceK, fullPotWorstCurrentA,
  nominalPotKFor1A: 50 - fixedK,
  assumptions: '5mOhm +/-1% shunt 110ppm/C; fixed +/-1% 100ppm/C; pot +/-10%; K=48..52. Drift bound uses separate resistor temperatures within -55..155C. Aging, layout and power-stage/transient qualification excluded.'
}, null, 2));
