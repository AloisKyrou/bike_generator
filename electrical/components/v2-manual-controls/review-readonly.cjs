// Read-only Konnect checks; no KiCad parsing or mutation.
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = 'C:/travail/bike_generator/electrical/v2/kicad/bike-generator-controller-v2/';
const names = ['bike-generator-controller-v2','power_path','connectors','mcu_module','cc_control','ina228_sense','lv_power_usb_tbd','main_converter_tbd','usb_interface'];
const operations = [{name:'get_active_toolsets',arguments:{}},
  {name:'load_toolset',arguments:{name:['design_review']}}];
for (const name of names) {
  for (const tool of ['find_shorted_nets','find_orphan_items','find_single_pin_nets']) {
    operations.push({name:tool,arguments:{schematic:root+name+'.kicad_sch'}});
  }
}
for (const name of ['audit_connections','audit_decoupling','audit_power_rails']) {
  operations.push({name,arguments:{schematic:root+'bike-generator-controller-v2.kicad_sch',schematic_scope:'hierarchy'}});
}
const prefix = process.argv[2] || 'review-readonly';
if (!/^[a-z0-9-]+$/.test(prefix)) throw new Error('Invalid evidence prefix');
const request = path.join(__dirname,prefix+'-requests.json');
fs.writeFileSync(request,JSON.stringify(operations,null,2));
const result = spawnSync(process.execPath,['.konnect-scratch/v2-2026-10-06/mcp.cjs','sequence',request],{encoding:'utf8',maxBuffer:30e6});
fs.writeFileSync(path.join(__dirname,prefix+'-results.json'),result.stdout);
process.stderr.write(result.stderr || '');
if (result.status) process.exit(result.status);
for (const item of JSON.parse(result.stdout)) {
  const r=item.response.result;
  const s=r?.structuredContent || r?.content?.filter(x=>x.type==='text').map(x=>x.text).join('\n');
  console.log(item.name,typeof s === 'string' ? s.slice(0,500) : JSON.stringify(s)?.slice(0,500));
}
