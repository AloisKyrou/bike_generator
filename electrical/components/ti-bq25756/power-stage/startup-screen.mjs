import assert from 'node:assert/strict';

// Nominal diagnostic only. TI support's ~150 mA trickle value has no guaranteed
// min/max in the cited datasheet; this is not a startup or battery qualification.
function screen({ targetV, mechanicalA, resistanceOhm }) {
  for (const value of [targetV, mechanicalA, resistanceOhm]) {
    if (!Number.isFinite(value) || value <= 0) throw new RangeError('Positive finite values required');
  }
  const prechargeA = Math.min(4, .2 * mechanicalA);
  return {
    targetV, mechanicalA, resistanceOhm,
    trickleEquilibriumV: .150 * resistanceOhm,
    prechargeEquilibriumV: prechargeA * resistanceOhm,
    nominalPrechargeExitV: .714 * targetV,
    resistorDerivedPrechargeA: prechargeA,
    resistorDerivedTerminationA: .1 * mechanicalA,
    belowSpecifiedPrechargeRegisterRange: prechargeA < .250,
    nominalTrickleStall: .150 * resistanceOhm < 3,
    nominalPrechargeStall: prechargeA * resistanceOhm < .714 * targetV
  };
}

const coldLoad = screen({ targetV: 12, mechanicalA: 1, resistanceOhm: 12 });
assert(Math.abs(coldLoad.trickleEquilibriumV - 1.8) < 1e-12);
assert(Math.abs(coldLoad.prechargeEquilibriumV - 2.4) < 1e-12);
assert(coldLoad.nominalTrickleStall);
assert(coldLoad.nominalPrechargeStall);
assert(coldLoad.belowSpecifiedPrechargeRegisterRange);
const lightLoad = screen({ targetV: 12, mechanicalA: 1, resistanceOhm: 100 });
assert.equal(lightLoad.nominalTrickleStall, false);
assert.equal(lightLoad.nominalPrechargeStall, false);
const highCeiling = screen({ targetV: 24, mechanicalA: 50 / 5.49, resistanceOhm: 12 });
assert(highCeiling.resistorDerivedPrechargeA > 1.8);
assert.equal(highCeiling.nominalTrickleStall, true);
for (const bad of [0, -1, NaN, Infinity]) {
  assert.throws(() => screen({ targetV: bad, mechanicalA: 1, resistanceOhm: 12 }), RangeError);
}
console.log(JSON.stringify([coldLoad, lightLoad, highCeiling], null, 2));
console.log('PASS: nominal startup screens only; no guaranteed current floor, hardware test or battery approval.');
