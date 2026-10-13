param(
    [Parameter(Mandatory=$true)][string]$Before,
    [Parameter(Mandatory=$true)][string]$After,
    [switch]$TestNegative
)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
function Read-Export($path) {
    if ([IO.Path]::GetExtension($path) -ne '.xml') { throw 'Exported XML only' }
    $s=[Xml.XmlReaderSettings]::new(); $s.DtdProcessing=[Xml.DtdProcessing]::Prohibit
    $r=[Xml.XmlReader]::Create((Resolve-Path -LiteralPath $path).Path,$s)
    try {$x=[Xml.XmlDocument]::new(); $x.Load($r)} finally {$r.Dispose()}
    return ,$x
}
function Check($a,$b) {
    $refs=@('Q10','Q11','Q12','Q13')
    $expected=@{
        value='AOY66923'; footprint='Package_TO_SOT_THT:TO-251-3_Vertical'
        datasheet='https://www.aosmd.com/sites/default/files/res/datasheets/AOY66923.pdf'
        description='100V N-MOSFET; TO251B short-lead THT; G1 D2 S3; drain tab requires heatsink insulation'
        "fields/field[@name='MPN']"='AOY66923'
        "fields/field[@name='Manufacturer']"='Alpha & Omega Semiconductor'
        "fields/field[@name='Design_Status']"='Provisional THT; shared insulated heatsink and clamp required; REGN/VGS, thermal envelope and short-lead fit pending'
    }
    $left=$a.CloneNode($true); $right=$b.CloneNode($true)
    foreach ($ref in $refs) {
        $old=$left.SelectSingleNode("/export/components/comp[@ref='$ref']")
        $new=$right.SelectSingleNode("/export/components/comp[@ref='$ref']")
        if (!$old -or !$new -or $old.SelectSingleNode("fields/field[@name='MPN']").InnerText -ne 'SIR870ADP-T1-RE3') { throw "Wrong source $ref" }
        foreach ($path in $expected.Keys) {
            $n=$new.SelectSingleNode($path)
            if (!$n -or $n.InnerText -cne $expected[$path]) { throw "Unexpected $ref $path" }
        }
        if ($new.libsource.lib -ne 'Transistor_FET' -or $new.libsource.part -ne 'Q_NMOS_GDS') {throw "Wrong symbol $ref"}
        foreach($field in @('Footprint','Datasheet','Description')) {
            if($new.SelectSingleNode("fields/field[@name='$field']").InnerText -cne $expected[$field.ToLowerInvariant()]) {throw "Wrong duplicate $ref $field"}
        }
        foreach($field in @('MPN','Manufacturer','Design_Status')) {
            if($new.SelectSingleNode("property[@name='$field']").GetAttribute('value') -cne $expected["fields/field[@name='$field']"]) {throw "Wrong property $ref $field"}
        }
        if (($new.SelectNodes('units/unit/pins/pin') | ForEach-Object {$_.num} | Sort-Object) -join ',' -cne '1,2,3') {throw "Wrong pins $ref"}
        if ($new.sheetpath.OuterXml -cne $old.sheetpath.OuterXml) {throw "Wrong sheet $ref"}
        # Compare connectivity by terminal function, not the changed package numbering.
        foreach($x in @($left,$right)) {
            $seen=@{}
            foreach($n in @($x.SelectNodes("/export/nets/net/node[@ref='$ref']"))) {
                $pin=$n.GetAttribute('pin')
                $function=if($x -eq $left){@{'1'='S';'2'='S';'3'='S';'4'='G';'5'='D'}[$pin]}else{@{'1'='G';'2'='D';'3'='S'}[$pin]}
                if(!$function -or $n.GetAttribute('pinfunction') -cne "${function}_${pin}") {throw "Invalid terminal $ref.$pin"}
                $net=$n.ParentNode.GetAttribute('name')
                if($seen.ContainsKey($function)) {
                    if($x -ne $left -or $seen[$function] -cne $net) {throw "Duplicate or split terminal $ref.$function"}
                    [void]$n.ParentNode.RemoveChild($n)
                } else {
                    $seen[$function]=$net
                    $n.SetAttribute('pin',$function); $n.SetAttribute('pinfunction',$function)
                }
            }
            if($seen.Count -ne 3 -or @($seen.Values | Sort-Object -Unique).Count -ne 3) {throw "Missing/shorted terminal $ref"}
        }
        [void]$new.ParentNode.ReplaceChild($right.ImportNode($old,$true),$new)
    }
    foreach($pair in @(@($left,'Q_NMOS_SSSGD_AvalancheRated'),@($right,'Q_NMOS_GDS'))) {
        $n=$pair[0].SelectSingleNode("/export/libparts/libpart[@lib='Transistor_FET' and @part='$($pair[1])']")
        if(!$n){throw 'Missing replacement library record'}
        [void]$n.ParentNode.RemoveChild($n)
    }
    $ta=Join-Path ([IO.Path]::GetTempPath()) (([guid]::NewGuid()).ToString()+'.xml')
    $tb=Join-Path ([IO.Path]::GetTempPath()) (([guid]::NewGuid()).ToString()+'.xml')
    try {
        $left.Save($ta); $right.Save($tb)
        & (Join-Path $PSScriptRoot 'test-presentation-equivalence.ps1') -Before $ta -After $tb
    } finally {Remove-Item -LiteralPath $ta,$tb -ErrorAction SilentlyContinue}
}
$a=Read-Export $Before; $b=Read-Export $After
Check $a $b
if($TestNegative) {
    $fixtures=@(
        {param($x) $x.SelectSingleNode('/export/components/comp[@ref="Q10"]/fields/field[@name="MPN"]').InnerText='WRONG'},
        {param($x) $x.SelectSingleNode('/export/components/comp[@ref="Q10"]/footprint').InnerText='WRONG'},
        {param($x) $x.SelectSingleNode('/export/nets/net/node[@ref="Q10" and @pin="1"]').SetAttribute('pin','2')},
        {param($x) $n=$x.SelectSingleNode('/export/nets/net/node[@ref="Q10" and @pin="3"]'); [void]$n.ParentNode.RemoveChild($n)},
        {param($x) $x.SelectSingleNode('/export/components/comp[@ref="R66"]/value').InnerText='1k'},
        {param($x) $n=$x.SelectSingleNode('/export/nets/net/node[@ref="Q11" and @pin="2"]'); [void]$x.SelectSingleNode('/export/nets/net[@name="GND"]').AppendChild($n)}
    )
    foreach($fixture in $fixtures) {
        $bad=$b.CloneNode($true); & $fixture $bad; $rejected=$false
        try {Check $a $bad | Out-Null} catch {$rejected=$true}
        if(!$rejected){throw 'Corrupted fixture accepted'}
    }
    Write-Output 'PASS: six corrupted XML fixtures rejected.'
}
Write-Output 'PASS: AOY metadata and G/D/S equivalence; unrelated circuit unchanged.'
