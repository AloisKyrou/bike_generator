import assert from 'node:assert/strict';
const values=[1e6,105e3,19.6e3];
const bounds=[];
for(const deltaT of [0,100]){
 const tolerance=.001+25e-6*deltaT;
 const cases=[];
 for(const a of [-1,1])for(const b of [-1,1])for(const c of [-1,1]){
  const r=values.map((v,i)=>v*(1+[a,b,c][i]*tolerance));
  const sum=r.reduce((a,b)=>a+b,0);
  for(const ov of [1.184,1.206])for(const uv of [1.095,1.106])for(const dpm of [1.198,1.222]){
   cases.push({ov:ov*sum/r[2],uv:uv*sum/(r[1]+r[2]),dpm:dpm*sum/(r[1]+r[2])});
  }
 }
 const range=key=>[Math.min(...cases.map(x=>x[key])),Math.max(...cases.map(x=>x[key]))];
 bounds.push({deltaT,ov:range('ov'),uv:range('uv'),dpm:range('dpm'),caseCount:cases.length});
}
assert(bounds[1].ov[1]<70);
assert(bounds[1].ov[0]>67.2);
assert(bounds[1].uv[0]>4.2);
const sum=values.reduce((a,b)=>a+b,0);
console.log(JSON.stringify({resistors:values,nominal:{ov:1.2*sum/values[2],uv:1.1*sum/(values[1]+values[2]),dpm:1.210*sum/(values[1]+values[2]),ovHysteresisTypical:.05*sum/values[2]},bounds},null,2));
console.log('PASS: 128 resistor/reference corners. Static ACOV screen, not surge disconnection; excludes unspecified pin leakage, aging and dynamic overshoot.');
