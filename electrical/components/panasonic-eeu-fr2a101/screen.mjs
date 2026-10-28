// Analytical prototype screen, not thermal, loop or fault qualification.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const prior = JSON.parse(execFileSync(process.execPath,
  [fileURLToPath(new URL('../ti-bq25756/power-stage-70v/screen.mjs', import.meta.url))], { encoding: 'utf8' }));
function sharing(total, local, remote, r = .084, mismatch = 0) {
  // Impedance represented as resistance ONLY for sensitivity; not guaranteed ESR.
  const one = r * (1 - mismatch), other = r * (1 + mismatch);
  const remoteBranch = other / remote + .005;
  const g = 1 / one + (local - 1) / other + 1 / remoteBranch;
  const v = total / g;
  return { worstLocal_A: v / one, otherLocal_A: v / other,
    eachRemote_A: v / remoteBranch / remote };
}
const result = { status: 'PROTOTYPE_CANDIDATE_NOT_FULL_CURRENT_QUALIFIED',
  assumptions: ['Same 5 input/7 output count; 3/5 local and 2/2 remote',
    'Prior conservative switching RMS envelope; no generator-frequency ripple',
    '84mOhm impedance used as a resistive proxy, not a guaranteed ESR',
    '20% mismatch is a sensitivity assumption, not a manufacturer tolerance',
    'No credit for ceramic RMS sharing; no ESL, temperature or aging model'],
  input: { rms_A: prior.inputRms, nominal_uF: 500, initialMin_uF: 400,
    enduranceMin_uF: 300, stored70V_J: .5 * 500e-6 * 70 ** 2,
    matched: sharing(prior.inputRms, 3, 2), mismatch20: sharing(prior.inputRms, 3, 2, .084, .2),
    remoteAbsentEachLocal_A: prior.inputRms / 3 },
  output: { rms_A: prior.outputRms, nominal_uF: 700, initialMin_uF: 560,
    enduranceMin_uF: 420, stored70V_J: .5 * 700e-6 * 70 ** 2,
    matched: sharing(prior.outputRms, 5, 2), mismatch20: sharing(prior.outputRms, 5, 2, .084, .2),
    remoteAbsentEachLocal_A: prior.outputRms / 5 },
  defaultBoostMinimum_uF: Math.max(80, prior.worstBoostDefault.uF),
  rippleRating100k105C_A: 1.5,
  idealEmptyOutputCharge70V_at150mA_s: 700e-6 * 70 / .15,
  oldTotalStored70V_J: .5 * 12 * 27e-6 * 70 ** 2,
  totalStored70V_J: .5 * 12 * 100e-6 * 70 ** 2,
  observedNewBasket_EUR: 12 * .795,
  previousPolymerBasket_EUR: 12 * 2.585 };
assert(result.output.enduranceMin_uF > result.defaultBoostMinimum_uF);
assert(result.input.matched.worstLocal_A < 1.5);
assert(result.output.matched.worstLocal_A < 1.5);
// These failures are intentional evidence: do not turn a nominal pass into a rating.
assert(result.input.mismatch20.worstLocal_A > 1.5);
assert(result.output.mismatch20.worstLocal_A > 1.5);
assert(result.input.remoteAbsentEachLocal_A > 1.5);
assert(result.output.remoteAbsentEachLocal_A > 1.5);
console.log(JSON.stringify(result, null, 2));
