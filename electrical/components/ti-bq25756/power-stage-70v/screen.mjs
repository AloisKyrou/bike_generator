// TI BQ25756 SLUSEN5A equations 35/36, default fast-transient setting.
// Analytical screen only: no ESR/layout/auto-tuning or hardware validation.
import assert from 'node:assert/strict';
function requiredCap(vi, vo, io, L, fast = false) {
  const ii = io * vo / vi;
  const w = vi / ii / L / 3;
  const [a, gm, r] = vo <= 8 ? [.2, fast ? 2e-6 : .4e-6, fast ? 1.3e6 : .6e6]
    : vo <= 16 ? [.1, fast ? 2e-6 : .47e-6, fast ? 1.8e6 : 1e6]
      : vo <= 32 ? [.05, fast ? 2e-6 : .67e-6, 2.8e6] : [.025, 2e-6, 2.8e6];
  const gain = a * gm * Math.hypot(1, w * r * 75e-12) / (w * 75e-12) * vi / (io * .05);
  return 2 / (w * vo / io) * Math.sqrt(Math.max(0, gain * gain - 1));
}
assert(Math.abs(requiredCap(5, 7, 5, 10e-6) * 1e6 - 51) < 1);
assert(Math.abs(requiredCap(5, 7, 5, 10e-6, true) * 1e6 - 674) < 3);
let worst = { uF: 0 };
for (let vo = 9.9; vo <= 70; vo += .05) {
  for (let vi = 9.8; vi < vo; vi += .05) {
    const io = Math.min(9.91, 14.771 * vi / vo);
    const uF = requiredCap(vi, vo, io, 12e-6) * 1e6;
    if (uF > worst.uF) worst = { vi, vo, io, uF };
  }
}
const dI = 70 / (4 * 8e-6 * 212e3);
const inputRms = Math.sqrt(10 ** 2 / 4 + dI ** 2 / 24);
const outputRms = Math.sqrt(14.771 ** 2 / 4 + dI ** 2 / 24);
const localPerCap = (total, local, far, esr) => total * (esr / far + .005) / (esr / local + esr / far + .005) / local;
console.log(JSON.stringify({
  tiWorkedExamplesPass: true, worstBoostDefault: worst,
  inductorRipplePP: dI, inputRms, outputRms,
  panasonic100SXV27M: { inputMin_uF: 4 * 27 * .8, outputMin_uF: 6 * 27 * .8,
    localInputRms: localPerCap(inputRms, 2, 2, .03), localOutputRms: localPerCap(outputRms, 4, 2, .03),
    bankCostEUR_oneBoard_qty10: 10 * 2.585, deltaOldBankEUR: 10 * (2.585 - 1.269) },
  panasonicDriftMargin5in7out: { inputInitialMin_uF: 5 * 27 * .8,
    outputInitialMin_uF: 7 * 27 * .8, inputAfterDrift_uF: 5 * 27 * .8 * .8,
    outputAfterDrift_uF: 7 * 27 * .8 * .8,
    localInputRms: localPerCap(inputRms, 3, 2, .03),
    localOutputRms: localPerCap(outputRms, 5, 2, .03),
    costEUR: 12 * 2.585, deltaOldBankEUR: 12 * 2.585 - 10 * 1.269 },
  sir870: { gateLoss70V250k_4p5VQgScreen: 65 * 2 * 38e-9 * 250e3,
    gateLoss70V288k_4p5VQgScreen: 65 * 2 * 38e-9 * 288e3,
    twoFetConduction15A25C: 2 * 15 ** 2 * .0105,
    switchNodeCapBudget70V_nF: 160 / 70, pairedCossTypical50V_nF: 2 * .719 }
}, null, 2));
