import assert from 'node:assert/strict';

// Legacy IPC-2221 external-layer screen documented in TI SNVA766. Not a
// thermal qualification; local necks, ripple, enclosures and adjacent heat differ.
export function screen({amps,widthMm,lengthMm,copperUm=70}) {
  assert(amps>0&&widthMm>0&&lengthMm>0&&copperUm>0);
  const areaMil2=widthMm*(copperUm/1000)/(.0254**2);
  const riseC=(amps/(.048*areaMil2**.725))**(1/.44);
  const ohmsAt60C=1.724e-8*(1+.00393*40)*(lengthMm/1000)/(widthMm/1000*copperUm/1e6);
  return {amps,widthMm,lengthMm,copperUm,riseC,dropV:amps*ohmsAt60C,lossW:amps**2*ohmsAt60C};
}
const cases=[
  {name:'input-screen',amps:15,widthMm:8,lengthMm:60},
  {name:'output-screen',amps:10,widthMm:5,lengthMm:50},
  {name:'switch-screen-not-rating',amps:18,widthMm:10,lengthMm:25},
  {name:'logic-rail',amps:1,widthMm:.75,lengthMm:60},
];
const results=cases.flatMap(c=>[70,56].map(copperUm=>({name:c.name,...screen({...c,copperUm})})));
assert(results.every(r=>r.riseC<20&&r.dropV<.1));
assert(Math.abs(screen({amps:1,widthMm:1,lengthMm:100}).lossW-.028500182857142856)<1e-12);
console.log(JSON.stringify({assumptions:{ambientC:40,riseBudgetC:20,copperTemperatureForDropC:60,dropBudgetV:.1,continuousScreenOnly:true},results},null,2));
