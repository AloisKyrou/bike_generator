import assert from 'node:assert/strict';

// Screening only: triangular CCM ripple, ideal duty, assumed 95% efficiency
// for boost input current. No switching-loss or coupled-heatsink simulation.
function screen(vin, vout, pout, rds = .015, hotFactor = 2) {
  if (![vin,vout,pout,rds,hotFactor].every(x => Number.isFinite(x) && x > 0) || vin === vout)
    throw new Error('Positive values and a pure buck/boost point required');
  const mode = vin > vout ? 'buck' : 'boost';
  const duty = mode === 'buck' ? vout/vin : 1-vin/vout;
  const il = mode === 'buck' ? pout/vout : pout/(.95*vin);
  const ripple = (mode === 'buck' ? vin-vout : vin)*duty/(8e-6*212e3);
  const rms2 = il*il + ripple*ripple/12;
  const held = rms2*rds;
  return {vin,vout,pout,mode,duty,il,ripple,
    heldFet:mode === 'buck' ? 'Q12' : 'Q10',
    conductionColdW:2*held,conductionHotAssumedW:2*held*hotFactor,
    heldFetColdW:held,heldFetHotAssumedW:held*hotFactor,
    heldFetPathBudgetKperW:(125-40)/(held*hotFactor),
    withinNominalCurrentCeilings:pout/vout<=9.11 && pout/(.95*vin)<=13.6};
}
const cases=[[36,24,150],[12,24,120],[36,48,400],[60,48,400]].map(x=>screen(...x));
assert(cases.every(x=>x.withinNominalCurrentCeilings));
assert(!screen(12,48,400).withinNominalCurrentCeilings);
assert(Math.abs(screen(36,24,150).ripple-4.716981132075472)<1e-9);
assert(Math.abs(2*15**2*.015-6.75)<1e-9);
assert.throws(()=>screen(0,24,100));
assert.throws(()=>screen(24,24,100));
assert.throws(()=>screen(36,24,NaN));
console.log(JSON.stringify({status:'PASS screening arithmetic; NOT a rating',cases,
  regn70V288k18nC_W:65*2*18e-9*288e3,
  illustrativeSharedSink:{ambientC:40,plateC:75,heatW:[20,30,40].map(w=>({w,maximumSinkToAmbientKperW:35/w}))},
  exclusions:['Hot resistance factor2 is a sensitivity, not a guaranteed AOY hot/low-VGS value.',
    'Gate waveform below4.5V, switching/body-diode/core/PCB/bridge loss and thermal coupling omitted.',
    'Path budget includes junction/case/interface/sink and is optimistic before other losses.',
    '20/30/40W are heat-budget examples, not a calculated complete board loss.',
    'No PCB dimensions, sink dimensions, contact pressure or airflow selected.']},null,2));
