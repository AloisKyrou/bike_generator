param([Parameter(Mandatory = $true)][string]$Netlist)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$check = Join-Path $PSScriptRoot 'test-main-study-netlist.ps1'
& $check -Netlist $Netlist
$settings = [Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
$reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $Netlist).Path, $settings)
try { $source = [Xml.XmlDocument]::new(); $source.Load($reader) } finally { $reader.Dispose() }
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
$scratch = Join-Path $repo ('.konnect-scratch/main-study-tests-' + [Guid]::NewGuid().ToString('N'))
$null = New-Item -ItemType Directory -Path $scratch
$script:count = 0
function Reject([string]$name, [scriptblock]$edit, [string]$expected) {
    $xml = $source.CloneNode($true)
    & $edit $xml
    $fixture = Join-Path $scratch "$name.xml"
    $xml.Save($fixture)
    $message = ''
    try { & $check -Netlist $fixture }
    catch { $message = $_.Exception.Message }
    if (!$message -or $message -notmatch $expected) { throw "Fixture $name did not fail as expected: $message" }
    $script:count++
    Write-Output "Rejected $name : $message"
}
function Move-Pin($xml, [string]$ref, [string]$pin, [string]$toRef, [string]$toPin) {
    $node = $xml.SelectSingleNode("/export/nets/net/node[@ref='$ref' and @pin='$pin']")
    $destination = $xml.SelectSingleNode("/export/nets/net/node[@ref='$toRef' and @pin='$toPin']/..")
    $null = $destination.AppendChild($node)
}
Reject 'bootstrap-polarity' { param($x) Move-Pin $x 'D10' '1' 'D10' '2' } 'Disconnected'
Reject 'bulk-cap-reversed' { param($x) Move-Pin $x 'C74' '1' 'C74' '2' } 'Disconnected'
Reject 'output-sense-polarity' { param($x) Move-Pin $x 'R82' '1' 'R83' '1' } 'Disconnected'
Reject 'stacked-source-detached' { param($x) Move-Pin $x 'Q10' '2' 'Q11' '2' } 'Disconnected'
Reject 'pin17-legacy-mode' { param($x) Move-Pin $x 'U9' '17' 'U9' '23' } 'Disconnected'
Reject 'wrong-qfn-pinout' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='U9']/fields/field[@name='MPN']").InnerText = 'BQ25758RRVR'
} 'Unexpected MPN'
Reject 'closed-input-boundary' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='JP30']/libsource").SetAttribute('part','Jumper_2_Closed')
} 'must default open'
Reject 'main-logic-bridged-to-usb5v' { param($x)
    $from = $x.SelectSingleNode("/export/nets/net[node[@ref='J32' and @pin='1']]")
    $to = $x.SelectSingleNode("/export/nets/net[node[@ref='J27' and @pin='A4']]")
    foreach ($node in @($from.SelectNodes('node'))) { $null = $to.AppendChild($node) }
} 'Unexpected short'
Reject 'i2c-scl-detached' { param($x) Move-Pin $x 'R68' '1' 'R69' '1' } 'Disconnected'
Reject 'i2c-sda-detached' { param($x) Move-Pin $x 'R69' '1' 'R68' '1' } 'Disconnected'
Reject 'ce-pulled-up' { param($x) Move-Pin $x 'R71' '2' 'J32' '1' } 'Disconnected'
Reject 'duplicate-pullup-instead-link' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='R68']/value").InnerText='10k' } 'Wrong I2C/CE value'
Reject 'wrong-fixed-cv' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='R66']/value").InnerText = '1M'
} 'Unexpected study setpoint'
Reject 'wrong-cap-suffix' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='C73']/fields/field[@name='MPN']").InnerText = '80SXV56MX'
} 'Unexpected bank MPN'
Reject 'current-wiper-detached' { param($x) Move-Pin $x 'RV1' '2' 'RV1' '3' } 'Disconnected'
Reject 'voltage-wiper-wrong-end' { param($x) Move-Pin $x 'RV2' '2' 'RV2' '3' } 'Disconnected'
Reject 'current-guard-bypassed' { param($x)
    $from=$x.SelectSingleNode("/export/nets/net[node[@ref='R61' and @pin='1']]")
    $to=$x.SelectSingleNode("/export/nets/net[node[@ref='R61' and @pin='2']]")
    foreach($node in @($from.SelectNodes('node'))) { $null=$to.AppendChild($node) }
} 'Unexpected short'
Reject 'unsafe-cv-guard' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='R67']/value").InnerText='5k' } 'Unexpected study setpoint'
Reject 'wrong-trimmer-footprint' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='RV1']/footprint").InnerText='Potentiometer_THT:Wrong' } 'Wrong trimmer footprint'
Reject 'wrong-guard-tolerance-mpn' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='R67']/fields/field[@name='MPN']").InnerText='RT0805FRD077K5L' } 'Unexpected MPN'
Reject 'undersized-guard-footprint' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='R66']/footprint").InnerText='Resistor_SMD:R_0402_1005Metric' } 'Wrong guard footprint'
Reject 'input-kelvin-swapped' { param($x) Move-Pin $x 'R1' '3' 'R1' '2' } 'Disconnected'
Reject 'input-kelvin-forced-to-power' { param($x) Move-Pin $x 'R1' '3' 'R1' '4' } 'Disconnected'
Reject 'output-local-bank-moved-far' { param($x) Move-Pin $x 'C85' '1' 'C86' '1' } 'Disconnected'
Reject 'input-local-bank-moved-upstream' { param($x) Move-Pin $x 'C82' '1' 'C81' '1' } 'Disconnected'
Reject 'unsafe-input-limit' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='R62']/value").InnerText='1k 1%' } 'Unexpected study setpoint'
Reject 'undersized-bank-footprint' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='C86']/footprint").InnerText='Capacitor_SMD:CP_Elec_5x5.8' } 'Wrong bulk footprint'
Write-Output "PASS: positive design plus $script:count intentional regressions. Evidence: $scratch"
