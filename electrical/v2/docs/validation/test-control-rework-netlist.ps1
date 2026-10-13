param([Parameter(Mandatory=$true)][string]$Netlist, [string]$Before)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
function Read-Xml([string]$path) {
    $settings=[Xml.XmlReaderSettings]::new(); $settings.DtdProcessing=[Xml.DtdProcessing]::Prohibit
    $r=[Xml.XmlReader]::Create((Resolve-Path -LiteralPath $path).Path,$settings)
    try { $d=[Xml.XmlDocument]::new(); $d.Load($r); return $d } finally { $r.Dispose() }
}
$xml=Read-Xml $Netlist; $pins=@{}; $script:checks=0
foreach($net in $xml.SelectNodes('/export/nets/net')) {
    foreach($n in $net.SelectNodes('node')) {
        $key="$($n.ref).$($n.pin)"; if($pins.ContainsKey($key)){throw "Duplicate endpoint $key"}; $pins[$key]=[string]$net.name
    }
}
function Connected([string[]]$e) {
    foreach($p in $e){if(!$pins.ContainsKey($p)){throw "Missing endpoint $p"}}
    if(@($e|ForEach-Object{$pins[$_]}|Sort-Object -Unique).Count -ne 1){throw "Disconnected: $($e -join ', ')"}
    $script:checks++
}
function Separate([string[]]$e) {
    foreach($p in $e){if(!$pins.ContainsKey($p)){throw "Missing endpoint $p"}}
    if(@($e|ForEach-Object{$pins[$_]}|Sort-Object -Unique).Count -ne $e.Count){throw "Unexpected short: $($e -join ', ')"}
    $script:checks++
}
function Part([string]$ref){$p=$xml.SelectNodes("/export/components/comp[@ref='$ref']"); if($p.Count -ne 1){throw "Missing/duplicate component $ref"}; return $p[0]}
# Each configurable signal has its own series resistor, and every alternate header pin is ground.
foreach($row in @(@('5','R7','1'),@('6','R8','3'),@('18','R9','5'),@('22','R10','7'),@('16','R34','9'))) {
    Connected @("U2.$($row[0])","$($row[1]).1")
    Connected @("$($row[1]).2","J5.$($row[2])")
    Separate @("U2.$($row[0])","J5.$($row[2])",'U2.1','U2.3')
    if((Part $row[1]).value -ne '1k'){throw "Wrong GPIO series resistor $($row[1])"}; $script:checks++
}
Connected @('U2.1','J5.2','J5.4','J5.6','J5.8','J5.10')
Separate @('J5.1','J5.3','J5.5','J5.7','J5.9','J5.2','U2.3')
Connected @('R36.1','R37.1','U2.3')
Connected @('R36.2','U2.5'); Connected @('R37.2','U2.22')
foreach($ref in @('R36','R37')) {if((Part $ref).value -ne '10k'){throw "Wrong boot pull-up $ref"}; $script:checks++}
Connected @('U2.31','R35.1'); Connected @('R35.2','D22.2','J28.1'); Connected @('D22.1','J28.2','U2.1')
Separate @('U2.31','D22.2','D22.1')
if((Part 'R35').value -ne '1k'){throw 'Wrong LED resistor'}; $script:checks++
if((Part 'D22').SelectSingleNode("fields/field[@name='MPN']").InnerText -ne 'WP710A10LID'){throw 'Wrong status LED MPN'}; $script:checks++
if((Part 'D22').footprint -ne 'LED_THT:LED_D3.0mm'){throw 'Wrong status LED footprint'}; $script:checks++
if((Part 'J5').libsource.part -ne 'Conn_02x05_Odd_Even'){throw 'Wrong GPIO connector geometry'}; $script:checks++
if($xml.SelectSingleNode("/export/components/comp[@ref='J22']")){throw 'Dedicated accessory header still present'}; $script:checks++
Connected @('J3.1','U2.3'); Connected @('J3.2','U2.1'); Connected @('J3.3','U2.12'); Connected @('J3.4','U2.13')
# GPIO20 drives the active-low selector; /SHDN is permanently inactive.
Connected @('U2.30','R87.1')
Separate @('U2.30','U3.12')
Separate @('U9.3','U2.5','U2.18','U2.22','U2.31')

# Compare all untouched component records and endpoint partitions, allowing only declared changes.
if ($Before) {
$old=Read-Xml $Before
$changed=@('J3','J5','J22','R7','R8','R9','R10','R34','R35','R36','R37','R61','R66','R67')
$added=@('D22','J28','RV1','RV2')
$oldRefs=@($old.SelectNodes('/export/components/comp')|ForEach-Object{[string]$_.ref})
$newRefs=@($xml.SelectNodes('/export/components/comp')|ForEach-Object{[string]$_.ref})
$expected=@($oldRefs|Where-Object{$_ -ne 'J22'})+$added
if(@(Compare-Object ($expected|Sort-Object) ($newRefs|Sort-Object)).Count){throw 'Unexpected inventory change'}; $script:checks++
foreach($ref in $oldRefs|Where-Object{$_ -notin $changed}) {
    $a=$old.SelectSingleNode("/export/components/comp[@ref='$ref']")
    $b=$xml.SelectSingleNode("/export/components/comp[@ref='$ref']")
    $ac=@($a.ChildNodes|ForEach-Object{$_.OuterXml}|Sort-Object); $bc=@($b.ChildNodes|ForEach-Object{$_.OuterXml}|Sort-Object)
    if(@(Compare-Object $ac $bc).Count){throw "Untouched component changed: $ref"}
}; $script:checks++
function Stable-Nets($doc) {
    $records=@()
    foreach($net in $doc.SelectNodes('/export/nets/net')) {
        $e=@($net.SelectNodes('node')|Where-Object{([string]$_.ref -notin ($changed+$added)) -and !(($_.ref -eq 'U2') -and ([string]$_.pin -in @('5','6','18','22','16','31')))}|ForEach-Object{"$($_.ref).$($_.pin):$($_.GetAttribute('pinfunction')):$($_.GetAttribute('pintype'))"}|Sort-Object)
        if($e.Count){$records+=($e -join '|')}
    }; return @($records|Sort-Object)
}
if(@(Compare-Object (Stable-Nets $old) (Stable-Nets $xml)).Count){throw 'Untouched connectivity partition changed'}; $script:checks++
}
Write-Output "PASS: $script:checks control GPIO/LED/preservation assertions. Not field protection or power qualification."
