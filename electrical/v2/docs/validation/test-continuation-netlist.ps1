param(
    [Parameter(Mandatory=$true)][string]$Before,
    [Parameter(Mandatory=$true)][string]$After,
    [switch]$RelayNcChange
)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
function Read-Xml([string]$path) {
    $settings=[Xml.XmlReaderSettings]::new(); $settings.DtdProcessing=[Xml.DtdProcessing]::Prohibit
    $reader=[Xml.XmlReader]::Create((Resolve-Path -LiteralPath $path).Path,$settings)
    try {$x=[Xml.XmlDocument]::new();$x.Load($reader);return ,$x} finally {$reader.Dispose()}
}
$old=Read-Xml $Before; $new=Read-Xml $After
$expected=@{'TP40'='U9.12';'TP41'='U9.9';'TP42'='U9.10';'TP43'='U9.24';'TP44'='U9.17';'TP45'='U3.6';'TP46'='Q21.1';'TP47'='U3.4'}
$script:checks=0
$sensor=$new.SelectSingleNode("/export/components/comp[@ref='J33']")
if($sensor.value -ne '103AT-2 NTC REQUIRED' -or $sensor.SelectSingleNode("fields/field[@name='External_Sensor']").InnerText -ne 'Semitec 103AT-2; external sensor, location and thermal coverage unqualified'){throw 'Wrong external NTC clarification'}
if($old.SelectSingleNode("/export/components/comp[@ref='J33']/value").InnerText -ne '10k NTC - REQUIRED'){throw 'Unexpected baseline NTC description'}
$script:checks+=2
foreach($ref in $expected.Keys) {
    if($old.SelectSingleNode("/export/components/comp[@ref='$ref']")){throw "Baseline already contains $ref"}
    $part=$new.SelectSingleNode("/export/components/comp[@ref='$ref']")
    if(!$part -or $part.footprint -ne 'TestPoint:TestPoint_Pad_D1.5mm' -or $part.libsource.part -ne 'TestPoint'){throw "Wrong/missing bare pad $ref"}
    if($part.SelectSingleNode("fields/field[@name='Assembly']").InnerText -ne 'PCB copper only; no fitted component'){throw "Wrong assembly type $ref"}
    $pin=$expected[$ref].Split('.')
    $net=$new.SelectSingleNode("/export/nets/net[node[@ref='$($pin[0])' and @pin='$($pin[1])']]")
    if(!$net -or !$net.SelectSingleNode("node[@ref='$ref' and @pin='1']")){throw "Wrong pad endpoint $ref"}
    if($new.SelectNodes("/export/nets/net/node[@ref='$ref']").Count -ne 1){throw "Duplicate/wrong pad pins $ref"}
    $script:checks+=4
}
if($RelayNcChange) {
    $prior=$old.SelectSingleNode("/export/nets/net[node[@ref='K1' and @pin='9']]")
    if(!$prior.SelectSingleNode("node[@ref='U3' and @pin='4']")){throw 'Unexpected old relay NC topology'}
    $changed=$new.SelectSingleNode("/export/nets/net[node[@ref='K1' and @pin='9']]")
    if(!$changed -or $changed.GetAttribute('name') -notlike 'unconnected-*' -or $changed.SelectNodes('node').Count -ne 1){throw 'Relay NC9 must be isolated and explicitly NC'}
    $script:checks+=2
}
# Remove only explicitly verified additions from XML copies, then require full
# prior component, library, sheet and net endpoint equivalence.
$a=$old.CloneNode($true);$b=$new.CloneNode($true)
$part=$b.SelectSingleNode("/export/components/comp[@ref='R75']")
foreach($xpath in @("fields/field[@name='MPN']","property[@name='MPN']")){
    $node=$part.SelectSingleNode($xpath);$prior=$a.SelectSingleNode("/export/components/comp[@ref='R75']/$xpath")
    $actual=$(if($node.LocalName -eq 'property'){$node.GetAttribute('value')}else{$node.InnerText})
    $previous=$(if($prior.LocalName -eq 'property'){$prior.GetAttribute('value')}else{$prior.InnerText})
    if($actual -ne 'WSL25125L000FEB' -or $previous -ne 'WSL25125L000FEA'){throw 'Wrong R75 packaging-only substitution'}
    $null=$node.ParentNode.ReplaceChild($b.ImportNode($prior,$true),$node)
    $script:checks++
}
foreach($ref in @('C4','C62','C63','C64','C68','C69','C71','C72')) {
    $kemet=$ref -eq 'C62'
    $values=@{
        value=$(if($kemet){'1uF 100V'}else{'100nF 100V'})
        footprint=('Capacitor_SMD:'+$(if($kemet){'C_1206_3216Metric_Pad1.33x1.80mm_HandSolder'}else{'C_0805_2012Metric_Pad1.18x1.45mm_HandSolder'}))
        datasheet=$(if($kemet){'https://search.kemet.com/component-documentation/download/specsheet/C1206C105K1RACTU'}else{'https://product.tdk.com/en/search/capacitor/ceramic/mlcc/info?part_no=C2012X7R2A104K125AA'})
    }
    $part=$b.SelectSingleNode("/export/components/comp[@ref='$ref']")
    $prior=$a.SelectSingleNode("/export/components/comp[@ref='$ref']")
    foreach($name in $values.Keys){
        if($part.SelectSingleNode($name).InnerText -ne $values[$name]){throw "Wrong MLCC $ref $name"}
        $script:checks++
        $priorNode=$prior.SelectSingleNode($name)
        if($priorNode){$part.SelectSingleNode($name).InnerText=$priorNode.InnerText}else{$null=$part.RemoveChild($part.SelectSingleNode($name))}
        if($name -in @('footprint','datasheet')){
            $fieldName=$(if($name -eq 'footprint'){'Footprint'}else{'Datasheet'})
            $field=$part.SelectSingleNode("fields/field[@name='$fieldName']")
            if($field.InnerText -ne $values[$name]){throw "Wrong MLCC $ref field $fieldName"}
            $null=$field.ParentNode.ReplaceChild($b.ImportNode($prior.SelectSingleNode("fields/field[@name='$fieldName']"),$true),$field)
        }
    }
    $fields=@{MPN=$(if($kemet){'C1206C105K1RACTU'}else{'C2012X7R2A104K125AA'});Manufacturer=$(if($kemet){'KEMET'}else{'TDK Corporation'})}
    foreach($name in $fields.Keys){
        $field=$part.SelectSingleNode("fields/field[@name='$name']")
        $property=$part.SelectSingleNode("property[@name='$name']")
        if(!$field -or $field.InnerText -ne $fields[$name] -or !$property -or $property.GetAttribute('value') -ne $fields[$name]){throw "Wrong MLCC $ref $name"}
        if($prior.SelectSingleNode("fields/field[@name='$name'] | property[@name='$name']")){throw "Unexpected preselected MLCC $ref"}
        $null=$field.ParentNode.RemoveChild($field);$null=$property.ParentNode.RemoveChild($property)
        $script:checks++
    }
    if(!$prior.SelectSingleNode('fields') -and $part.SelectSingleNode('fields').ChildNodes.Count -eq 0){$null=$part.RemoveChild($part.SelectSingleNode('fields'))}
}
$part=$b.SelectSingleNode("/export/components/comp[@ref='J33']")
$part.SelectSingleNode('value').InnerText=$a.SelectSingleNode("/export/components/comp[@ref='J33']/value").InnerText
foreach($node in @($part.SelectNodes("fields/field[@name='External_Sensor'] | property[@name='External_Sensor']"))){$null=$node.ParentNode.RemoveChild($node)}
foreach($ref in $expected.Keys){
    $node=$b.SelectSingleNode("/export/components/comp[@ref='$ref']");$null=$node.ParentNode.RemoveChild($node)
    $node=$b.SelectSingleNode("/export/nets/net/node[@ref='$ref']");$null=$node.ParentNode.RemoveChild($node)
}
if($RelayNcChange){
    foreach($x in @($a,$b)){$node=$x.SelectSingleNode("/export/nets/net/node[@ref='K1' and @pin='9']");$null=$node.ParentNode.RemoveChild($node)}
}
foreach($node in @($b.SelectNodes('/export/nets/net[not(node)]'))){$null=$node.ParentNode.RemoveChild($node)}
if(!$a.SelectSingleNode("/export/libparts/libpart[@lib='Connector' and @part='TestPoint']")){
    $node=$b.SelectSingleNode("/export/libparts/libpart[@lib='Connector' and @part='TestPoint']");$null=$node.ParentNode.RemoveChild($node)
}
$repo=(Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
$scratch=Join-Path $repo ('.konnect-scratch/continuation-equivalence-'+[Guid]::NewGuid().ToString('N'))
$null=New-Item -ItemType Directory -Path $scratch
$a.Save((Join-Path $scratch 'before.xml'));$b.Save((Join-Path $scratch 'after.xml'))
& (Join-Path $PSScriptRoot 'test-presentation-equivalence.ps1') -Before (Join-Path $scratch 'before.xml') -After (Join-Path $scratch 'after.xml')
Write-Output "PASS: $script:checks explicit continuation checks plus complete unchanged-remainder equivalence. XML-only evidence: $scratch"
