import assert from 'node:assert/strict';

function state(a, b, fet, groundedIdle) {
  if (a === 'manual') return 'manual';
  if (a === 'open' || !fet) return 'lower-open';
  if (b === 'digital') return 'digital';
  return b === 'manual' && groundedIdle ? 'guard-maximum' : 'lower-open';
}
const states = [];
for (const a of ['manual', 'open', 'digital']) {
  for (const b of ['manual', 'open', 'digital']) {
    for (const fet of [false, true]) {
      const before = state(a, b, fet, true);
      const after = state(a, b, fet, false);
      assert.notEqual(after, 'guard-maximum');
      if (before !== 'guard-maximum') assert.equal(after, before);
      states.push({ a, b, fet, before, after });
    }
  }
}
const fbMax = 1.566 * 1.007 * 1.055;
const riseTime = capacitance => 249000 * capacitance * Math.log((12 - 1.536) / (12 - fbMax));
const heldCurrent = .0011;
const heldMargin = .25;
const heldTime = .0001;
const isolationCapMin = heldCurrent * heldTime / heldMargin;
const coilR = 64.3;
const coilI0 = 3.3 / (coilR + 6.8 + .085);
const decay = clamp => Math.log((coilI0 * coilR + clamp) / (.1 * coilI0 * coilR + clamp));
console.log(JSON.stringify({
  status: 'Proposal calculations, not measured timing or hardware qualification',
  staticContactCases: states.length,
  changedCases: states.filter(x => x.before !== x.after),
  fbMax, illustrativeFbRiseAt12V: { pF10: riseTime(10e-12), pF100: riseTime(100e-12), nF1: riseTime(1e-9) },
  heldRailExample: { heldCurrent, heldMargin, heldTime, isolationCapMin,
    note: 'Requires real reverse isolation; excludes uncontrolled short-circuit reverse charge and SPI backfeed' },
  relayDecayExample: { plainDiodeTauMultiples: decay(.4), zener33PlusDiodeTauMultiples: decay(3.7),
    note: 'Unknown inductance and mechanical timing; assumes release at10%initialcurrent, not manufacturer guarantee' },
}, null, 2));
