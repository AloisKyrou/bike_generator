param([Parameter(Mandatory=$true)][string]$Netlist,[Parameter(Mandatory=$true)][string]$Before)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
function Read-Xml([string]$path) {
    $s=[Xml.XmlReaderSettings]::new(); $s.DtdProcessing=[Xml.DtdProcessing]::Prohibit
    $r=[Xml.XmlReader]::Create((Resolve-Path -LiteralPath $path).Path,$s)
    try {$x=[Xml.XmlDocument]::new();$x.Load($r);return $x} finally {$r.Dispose()}
}
$old=Read-Xml $Before;$new=Read-Xml $Netlist;$checks=0
$changed=@('R61','R66','R67','R68','R69','R71','J32','J33','J20','J21','J23','J25','Q20','D21','R45')
$removed=@('JP32')
$oldRefs=@($old.export.components.comp|ForEach-Object {[string]$_.ref})
$newRefs=@($new.export.components.comp|ForEach-Object {[string]$_.ref})
if(@(Compare-Object @($oldRefs|Where-Object {$_ -notin $removed}|Sort-Object) @($newRefs|Sort-Object)).Count){throw 'Unexpected completion inventory change'};$checks++
foreach($ref in $oldRefs|Where-Object {$_ -notin ($changed+$removed)}) {
    $a=$old.SelectSingleNode("/export/components/comp[@ref='$ref']");$b=$new.SelectSingleNode("/export/components/comp[@ref='$ref']")
    if(@(Compare-Object @($a.ChildNodes|ForEach-Object {$_.OuterXml}|Sort-Object) @($b.ChildNodes|ForEach-Object {$_.OuterXml}|Sort-Object)).Count){throw "Unapproved component change: $ref"}
};$checks++
# Only host-interface endpoints change topology; all other net names and endpoint records are frozen.
$rewired=@('R68','R69','R70','R71','J32','JP32')
function Stable-Nets($doc) {
    foreach($net in $doc.export.nets.net){
        $e=@($net.SelectNodes('node')|Where-Object {$_.ref -notin $rewired}|ForEach-Object {$_.OuterXml}|Sort-Object)
        if($e.Count){"$($net.name):$($e -join '|')"}
    }
}
if(@(Compare-Object @(Stable-Nets $old|Sort-Object) @(Stable-Nets $new|Sort-Object)).Count){throw 'Unapproved connectivity change outside host interface'};$checks++
foreach($row in @(@('J20',2),@('J21',3),@('J23',3),@('J25',2),@('J32',6),@('J33',2))) {
    $p=$new.SelectSingleNode("/export/components/comp[@ref='$($row[0])']");$n=$row[1]
    if($p.footprint -ne "Connector_PinHeader_2.54mm:PinHeader_1x0${n}_P2.54mm_Vertical" -or $p.SelectSingleNode("fields/field[@name='MPN']").InnerText -ne "M20-9990${n}46"){throw "Wrong service header $($row[0])"};$checks++
}
foreach($ref in @('J30','J31','JP30','JP31')) {
    $p=$new.SelectSingleNode("/export/components/comp[@ref='$ref']");$fp=$p.SelectSingleNode('footprint')
    if($fp -and $fp.InnerText){throw "Unqualified high-current footprint: $ref"};$checks++
}
foreach($row in @(@('Q20','Alpha & Omega Semiconductor'),@('D21','Kingbright'),@('R45','Bourns'))) {
    if($new.SelectSingleNode("/export/components/comp[@ref='$($row[0])']/fields/field[@name='Manufacturer']").InnerText -ne $row[1]){throw "Wrong manufacturer $($row[0])"};$checks++
}
Write-Output "PASS: $checks completion inventory, model and unchanged-net assertions."
& (Join-Path $PSScriptRoot 'test-control-rework-netlist.ps1') -Netlist $Netlist
