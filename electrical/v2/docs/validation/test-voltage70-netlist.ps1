param([Parameter(Mandatory=$true)][string]$Before,[Parameter(Mandatory=$true)][string]$After)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
function Load-Xml($path) {
    $settings=[Xml.XmlReaderSettings]::new();$settings.DtdProcessing=[Xml.DtdProcessing]::Prohibit
    $reader=[Xml.XmlReader]::Create((Resolve-Path -LiteralPath $path).Path,$settings)
    try {$doc=[Xml.XmlDocument]::new();$doc.Load($reader);return ,$doc} finally {$reader.Dispose()}
}
$old=Load-Xml $Before;$new=Load-Xml $After;$script:checks=0
function Assert($condition,$message){if(!$condition){throw $message};$script:checks++}
$added=@('C87','C88','D25','R89','R90');$removed=@('J2')
$changed=@('Q10','Q11','Q12','Q13','C73','C74','C75','C76','C81','C82','C83','C84','C85','C86','R63','R64','R65','R67','R84','R85','F1','U9')
$oldRefs=@($old.export.components.comp | ForEach-Object {$_.GetAttribute('ref')})
$newRefs=@($new.export.components.comp | ForEach-Object {$_.GetAttribute('ref')})
Assert ((@($newRefs|Where-Object {$_ -notin $oldRefs}|Sort-Object)-join ',') -eq ($added-join ',')) 'Unexpected added inventory'
Assert ((@($oldRefs|Where-Object {$_ -notin $newRefs}|Sort-Object)-join ',') -eq ($removed-join ',')) 'Unexpected removed inventory'
function Part($ref,$value,$mpn,$footprint) {
    $p=$new.SelectSingleNode("/export/components/comp[@ref='$ref']")
    Assert ($p -and $p.value -eq $value) "Wrong value $ref"
    Assert ($p.SelectSingleNode("fields/field[@name='MPN']").InnerText -eq $mpn) "Wrong MPN $ref"
    Assert ($p.footprint -eq $footprint) "Wrong footprint $ref"
}
foreach($ref in @('Q10','Q11','Q12','Q13')){Part $ref 'SIR870ADP' 'SIR870ADP-T1-RE3' 'Package_SO:PowerPAK_SO-8_Single'}
foreach($ref in @('C73','C74','C75','C76','C81','C82','C83','C84','C85','C86','C87','C88')){Part $ref '27uF 100V' '100SXV27M' 'Capacitor_SMD:CP_Elec_10x12.5'}
foreach($row in @(@('R63','1M 0.1%','RT0805BRD071ML'),@('R64','105k 0.1%','RT0805BRD07105KL'),@('R65','19.6k 0.1%','RT0805BRD0719K6L'),@('R67','5.62k 0.1%','RT0805BRD075K62L'),@('R84','5.62k 0.1%','RT0805BRD075K62L'),@('R85','150k 0.1%','RT0805BRD07150KL'),@('R89','200R 0.1%','RT0805BRD07200RL'),@('R90','200R 0.1%','RT0805BRD07200RL'))){Part $row[0] $row[1] $row[2] 'Resistor_SMD:R_0805_2012Metric'}
Part 'D25' 'BZX84C27LT1G' 'BZX84C27LT1G' 'Package_TO_SOT_SMD:SOT-23'
Assert ($new.SelectSingleNode("/export/components/comp[@ref='F1']/value").InnerText -eq '20A / 100VDC') 'F1 voltage clarification missing'
# Every untouched component remains byte-equivalent after sorting child records.
function Component-Key($p){(@($p.ChildNodes|ForEach-Object {$_.OuterXml}|Sort-Object)-join "`n")}
foreach($ref in $oldRefs|Where-Object {$_ -notin ($changed+$removed)}) {
    Assert ((Component-Key $old.SelectSingleNode("/export/components/comp[@ref='$ref']")) -eq (Component-Key $new.SelectSingleNode("/export/components/comp[@ref='$ref']"))) "Unexpected component change $ref"
}
$common=@($oldRefs|Where-Object {$_ -in $newRefs})
function Pairs($doc) {
    $set=[Collections.Generic.HashSet[string]]::new()
    foreach($net in $doc.export.nets.net) {
        $nodes=@($net.SelectNodes('node')|Where-Object {$_.ref -in $common}|ForEach-Object {"$($_.ref).$($_.pin)"}|Sort-Object)
        for($i=0;$i -lt $nodes.Count;$i++){for($j=$i+1;$j -lt $nodes.Count;$j++){$null=$set.Add($nodes[$i]+'='+$nodes[$j])}}
    }
    return ,$set
}
$a=Pairs $old;$b=Pairs $new
$expectedRemoved=@('K1.4=R84.2','R67.2=RV2.1','R67.2=RV2.2')
Assert ((@($a|Where-Object {!$b.Contains($_)}|Sort-Object)-join ',') -eq ($expectedRemoved-join ',')) 'Unexpected disconnected common endpoints'
Assert (@($b|Where-Object {!$a.Contains($_)}).Count -eq 0) 'Unexpected joined common endpoints'
function Same($p1,$p2) {
    $r,$p=$p1.Split('.');$s,$q=$p2.Split('.')
    $net=$new.SelectSingleNode("/export/nets/net[node[@ref='$r' and @pin='$p']]")
    Assert ($null -ne $net.SelectSingleNode("node[@ref='$s' and @pin='$q']")) "Wrong endpoint $p1 -> $p2"
}
foreach($row in @(@('R89.1','R67.2'),@('R89.2','RV2.1'),@('R90.1','K1.4'),@('R90.2','R84.2'),@('D25.3','Q21.3'),@('D25.1','U3.4'),@('C87.1','R1.1'),@('C88.1','R75.1'),@('C87.2','U9.17'),@('C88.2','U9.17'))){Same $row[0] $row[1]}
$nc=$new.SelectSingleNode("/export/nets/net[node[@ref='D25' and @pin='2']]")
Assert ($nc.GetAttribute('name') -like 'unconnected-*' -and $nc.SelectNodes('node').Count -eq 1) 'D25.2 must be explicitly NC'
Write-Output "PASS: $script:checks voltage70 inventory, unchanged-component, common-endpoint and new-path checks."
