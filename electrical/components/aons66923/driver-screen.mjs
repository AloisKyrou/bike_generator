// Margin screens only. No claim of guaranteed waveform or safe hardware rating.
import assert from 'node:assert/strict';
const loss = (qNC, fKHz, vin = 70, drive = 5) => (vin - drive) * 2 * qNC * fKHz * 1e-6;
const chargeDrop = (qNC, cNF) => qNC / cNF;
const table = [100, 220, 470].map(nominalNF => ({
  nominalNF, assumedEffectiveNF: nominalNF * .8,
  aons18nC_dropV: chargeDrop(18, nominalNF * .8),
  aons35nC_dropV: chargeDrop(35, nominalNF * .8),
  sir38nC_dropV: chargeDrop(38, nominalNF * .8),
  optimisticAfterChargeV: 4.8 - .3 - chargeDrop(18, nominalNF * .8),
}));
assert(Math.abs(loss(18, 288) - .67392) < 1e-9);
assert(Math.abs(chargeDrop(18, 80) - .225) < 1e-9);
assert(table.every(row => row.optimisticAfterChargeV < 4.5));
console.log(JSON.stringify({ status: 'ENGINEERING_GATE_OPEN',
  assumptions: ['Two switching-gate-equivalents; interleaved transition described by TI',
    '4.8V REGN lower table value at stated test condition, not a transient guarantee',
    '0.3V diode drop is an optimistic illustrative assumption, not a maximum',
    '80% effective capacitance is a sensitivity assumption including derating',
    'Ig driver/leakage and negative/positive SW bounce omitted; actual margin can be worse'],
  bootstrap: table,
  ldoLoss70V288k_W: { sir38nC: loss(38, 288), aons18nC: loss(18, 288), aons35nC: loss(35, 288) },
  aons10VQg35nC_conservativeChargeScreen_1W_inputV: 5 + 1 / (2 * 35e-9 * 288e3),
  conduction2FETs15A25C_W: { sir: 2 * 15 ** 2 * .0105, aons: 2 * 15 ** 2 * .0148 },
  notProved: ['Qg maxima at actual VDS70V and VGS waveform',
    'Rds maximum below4.5V, refresh timing and minimum continuous VGS',
    '1W screen is TI design guidance, not a package thermal qualification',
    'No automatic input-voltage limit or capacitor-value change implemented']
}, null, 2));
