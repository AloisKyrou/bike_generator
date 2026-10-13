param([Parameter(Mandatory=$true)][string]$Netlist, [switch]$OpenIdleContact, [switch]$Voltage70)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$check = Join-Path $PSScriptRoot '../calculations/cv-netlist-audit.ps1'
$null = & $check -Netlist $Netlist -OpenIdleContact:$OpenIdleContact -Voltage70:$Voltage70
$settings = [Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
$reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $Netlist).Path, $settings)
try { $source = [Xml.XmlDocument]::new(); $source.Load($reader) } finally { $reader.Dispose() }
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
$scratch = Join-Path $repo ('.konnect-scratch/adaptive-cv-tests-' + [Guid]::NewGuid().ToString('N'))
$null = New-Item -ItemType Directory -Path $scratch
$script:count = 0
function Reject([string]$name, [scriptblock]$edit, [string]$expected) {
    $xml = $source.CloneNode($true)
    & $edit $xml
    $fixture = Join-Path $scratch "$name.xml"
    $xml.Save($fixture)
    $message = ''
    try { $null = & $check -Netlist $fixture -OpenIdleContact:$OpenIdleContact -Voltage70:$Voltage70 } catch { $message = $_.Exception.Message }
    if (!$message -or $message -notmatch $expected) { throw "Fixture $name did not fail as expected: $message" }
    $script:count++
    Write-Output "Rejected $name : $message"
}
function Move-Pin($xml, [string]$ref, [string]$pin, [string]$toRef, [string]$toPin) {
    $node = $xml.SelectSingleNode("/export/nets/net/node[@ref='$ref' and @pin='$pin']")
    $origin = $node.ParentNode
    $destination = $xml.SelectSingleNode("/export/nets/net/node[@ref='$toRef' and @pin='$toPin']/..")
    $null = $destination.AppendChild($node)
    if ($origin.SelectNodes('node').Count -eq 0) { $null = $origin.ParentNode.RemoveChild($origin) }
}
Reject 'manual-no-instead-nc' { param($x) Move-Pin $x 'K1' '2' 'K1' '4' } 'Manual NC'
Reject 'relay-ground-contact-wrong' { param($x) Move-Pin $x 'K1' '9' 'K1' '7' } 'NX source|Grounded'
Reject 'nx-drain-source-swapped' { param($x) Move-Pin $x 'Q21' '3' 'Q21' '2' } 'NX drain'
Reject 'nx-gate-after-coil-resistor' { param($x) Move-Pin $x 'Q21' '1' 'K1' '1' } 'Coil supply|NX gate'
Reject 'clamp-upper-rail-wrong' { param($x) Move-Pin $x 'D24' '2' 'D24' '1' } 'Logic rail'
Reject 'clamp-junction-wrong' { param($x) Move-Pin $x 'D24' '3' 'D24' '1' } 'MCP tied'
Reject 'flyback-reversed' { param($x) Move-Pin $x 'D23' '3' 'D23' '1' } 'Coil supply'
Reject 'gpio-still-shutdown' { param($x) Move-Pin $x 'U3' '12' 'U2' '30' } 'GPIO20|Logic rail'
Reject 'mcp-wiper-detached' { param($x) Move-Pin $x 'U3' '6' 'U3' '5' } 'MCP tied'
Reject 'coil-series-bypassed' { param($x) Move-Pin $x 'R88' '2' 'R88' '1' } 'Coil supply'
Reject 'wrong-digipot-track' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='U3']/value").InnerText='MCP4251-104E/SL' } 'Wrong/missing component U3'
Reject 'unsafe-digital-guard' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='R84']/value").InnerText='1k' } 'Wrong/missing component R84'
Reject 'wrong-dual-clamp-package' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='D24']/footprint").InnerText='Package_TO_SOT_SMD:SOT-323' } 'D24 wrong footprint'
if($OpenIdleContact -or $Voltage70){
    Reject 'idle-contact-regrounded' { param($x) Move-Pin $x 'K1' '9' 'U3' '4' } 'K1.9|Idle|idle|NC'
    Reject 'idle-contact-on-3v3' { param($x) Move-Pin $x 'K1' '9' 'U3' '14' } 'K1.9|Idle|idle|NC'
    Reject 'idle-contact-on-aw' { param($x) Move-Pin $x 'K1' '9' 'U3' '6' } 'unexpected endpoints|K1.9'
    Reject 'idle-bleeder-missing' { param($x) Move-Pin $x 'R85' '1' 'R85' '2' } 'MCP tied'
    Reject 'fb-probe-wrong-net' { param($x) Move-Pin $x 'TP40' '1' 'U3' '14' } 'Relay common|TP40'
}
if($Voltage70){
    Reject 'manual-guard-bypassed' {param($x) Move-Pin $x R89 1 RV2 1} 'Manual|guard|R89'
    Reject 'digital-guard-bypassed' {param($x) Move-Pin $x R90 1 R84 2} 'Digital|guard|R90'
    Reject 'drain-clamp-grounded' {param($x) Move-Pin $x D25 3 U3 4} 'drain|Ground'
    Reject 'drain-clamp-reversed' {param($x) Move-Pin $x D25 1 Q21 3} 'drain|Ground'
    Reject 'drain-clamp-nc-used' {param($x) Move-Pin $x D25 2 U3 4} 'D25|Ground|NC'
    Reject 'old-bleeder-range' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='R85']/value").InnerText='110k 1%'} 'R85'
    Reject 'wrong-clamp-footprint' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='D25']/footprint").InnerText='Package_TO_SOT_SMD:SOT-323'} 'D25'
}
Write-Output "PASS: positive design plus $script:count XML-only adaptive CV regressions. Evidence: $scratch"
