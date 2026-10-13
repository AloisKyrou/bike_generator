param(
    [Parameter(Mandatory=$true)][string]$Before,
    [Parameter(Mandatory=$true)][string]$After,
    [switch]$TestNegative
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$refs = @('C73','C74','C75','C76','C81','C82','C83','C84','C85','C86','C87','C88')
function Read-Export([string]$path) {
    if ([IO.Path]::GetExtension($path) -ne '.xml') { throw 'Exported XML only.' }
    $settings = [Xml.XmlReaderSettings]::new()
    $settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
    $reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $path).Path, $settings)
    try { $x = [Xml.XmlDocument]::new(); $x.Load($reader) } finally { $reader.Dispose() }
    return ,$x
}
function Check($a, $b) {
    if ($a.SelectNodes('/export/components/comp').Count -ne 145 -or
        $b.SelectNodes('/export/components/comp').Count -ne 145) { throw 'Wrong inventory.' }
    $expected = @{
        value = '100uF/100V'
        footprint = 'Capacitor_THT:CP_Radial_D10.0mm_P5.00mm'
        datasheet = 'https://industrial.panasonic.com/cdbs/www-data/pdf/RDF0000/ABA0000C1259.pdf'
        description = '100uF/100V radial wet electrolytic; 10x20mm; 5mm pitch; 1.5Arms at 100kHz/105C'
        "fields/field[@name='MPN']" = 'EEU-FR2A101'
        "fields/field[@name='Manufacturer']" = 'Panasonic Industry'
        "fields/field[@name='Design_Status']" = 'Prototype THT bank; full-current ripple sharing, loop stability and inrush NOT qualified; see panasonic-eeu-fr2a101 study'
    }
    foreach ($ref in $refs) {
        $old = $a.SelectSingleNode("/export/components/comp[@ref='$ref']")
        $c = $b.SelectSingleNode("/export/components/comp[@ref='$ref']")
        if (!$old -or !$c -or $old.SelectSingleNode("fields/field[@name='MPN']").InnerText -ne '100SXV27M') { throw "Wrong source $ref" }
        foreach ($path in $expected.Keys) {
            $node = $c.SelectSingleNode($path)
            if (!$node -or $node.InnerText -cne $expected[$path]) { throw "$ref mismatch: $path" }
        }
        foreach ($field in @('Footprint','Datasheet','Description')) {
            if ($c.SelectSingleNode("fields/field[@name='$field']").InnerText -cne $expected[$field.ToLowerInvariant()]) { throw "$ref duplicate field $field" }
        }
        foreach ($field in @('MPN','Design_Status')) {
            if ($c.SelectSingleNode("property[@name='$field']").GetAttribute('value') -cne $expected["fields/field[@name='$field']"]) { throw "$ref property $field" }
        }
        $negative = $b.SelectSingleNode("/export/nets/net[node[@ref='$ref' and @pin='2']]")
        if (!$negative -or $negative.GetAttribute('name') -ne 'GND') { throw "$ref negative not GND" }
        $positive = $b.SelectSingleNode("/export/nets/net[node[@ref='$ref' and @pin='1']]")
        if (!$positive -or $positive.GetAttribute('name') -eq 'GND') { throw "$ref positive invalid" }
    }
    # Normalize only the verified fields in exported XML, never native CAD.
    $left = $a.CloneNode($true); $right = $b.CloneNode($true)
    foreach ($x in @($left,$right)) {
        foreach ($ref in $refs) {
            $c = $x.SelectSingleNode("/export/components/comp[@ref='$ref']")
            foreach ($path in @('value','footprint','datasheet','description',
                "fields/field[@name='Footprint' or @name='Datasheet' or @name='Description' or @name='MPN' or @name='Design_Status']",
                "property[@name='MPN' or @name='Design_Status']")) {
                foreach ($node in @($c.SelectNodes($path))) { [void]$node.ParentNode.RemoveChild($node) }
            }
        }
    }
    $tmpA = Join-Path ([IO.Path]::GetTempPath()) (([guid]::NewGuid().ToString()) + '.xml')
    $tmpB = Join-Path ([IO.Path]::GetTempPath()) (([guid]::NewGuid().ToString()) + '.xml')
    try {
        $left.Save($tmpA); $right.Save($tmpB)
        & (Join-Path $PSScriptRoot 'test-presentation-equivalence.ps1') -Before $tmpA -After $tmpB
    } finally { Remove-Item -LiteralPath $tmpA,$tmpB -ErrorAction SilentlyContinue }
}
$a = Read-Export $Before; $b = Read-Export $After
Check $a $b
if ($TestNegative) {
    $fixtures = @(
        { param($x) $x.SelectSingleNode('/export/components/comp[@ref="C73"]/value').InnerText = '100uF/63V' },
        { param($x) $x.SelectSingleNode('/export/components/comp[@ref="C73"]/footprint').InnerText = 'Capacitor_SMD:CP_Elec_10x12.5' },
        { param($x) $x.SelectSingleNode('/export/components/comp[@ref="C73"]/fields/field[@name="MPN"]').InnerText = 'WRONG' },
        { param($x) $x.SelectSingleNode('/export/nets/net/node[@ref="C73" and @pin="2"]').SetAttribute('pin','1') },
        { param($x) $x.SelectSingleNode('/export/components/comp[@ref="R66"]/value').InnerText = '1k' }
    )
    foreach ($fixture in $fixtures) {
        $bad = $b.CloneNode($true); & $fixture $bad
        $rejected = $false
        try { Check $a $bad | Out-Null } catch { $rejected = $true }
        if (!$rejected) { throw 'Negative fixture was not rejected.' }
    }
    Write-Output 'PASS: five corrupted XML fixtures rejected.'
}
Write-Output 'PASS: twelve THT substitutions only; original wiring and other metadata retained.'
