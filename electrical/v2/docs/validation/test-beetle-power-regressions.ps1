param([Parameter(Mandatory = $true)][string]$Netlist, [string]$Before)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$check = Join-Path $PSScriptRoot 'test-beetle-power-netlist.ps1'
& $check -Netlist $Netlist -Before $Before
$settings = [Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
$reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $Netlist).Path, $settings)
try { $source = [Xml.XmlDocument]::new(); $source.Load($reader) } finally { $reader.Dispose() }
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
$scratch = Join-Path $repo ('.konnect-scratch/beetle-power-tests-' + [Guid]::NewGuid().ToString('N'))
$null = New-Item -ItemType Directory -Path $scratch
$script:count = 0
function Reject([string]$name, [scriptblock]$edit, [string]$expected) {
    $xml = $source.CloneNode($true)
    & $edit $xml
    $fixture = Join-Path $scratch "$name.xml"
    $xml.Save($fixture)
    $message = ''
    try { & $check -Netlist $fixture -Before $Before }
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
Reject 'charger-vcc-bypass' { param($x) Move-Pin $x 'U6' '4' 'J27' 'A4' } 'Disconnected'
Reject 'pmos-source-drain' { param($x) Move-Pin $x 'Q20' '2' 'Q20' '3' } 'Disconnected'
Reject 'diode-reversed' { param($x) Move-Pin $x 'D20' '1' 'D20' '2' } 'Disconnected'
Reject 'ldo-wrong-input' { param($x) Move-Pin $x 'U7' '1' 'U6' '3' } 'Disconnected'
Reject 'ldo-missing-ground' { param($x) Move-Pin $x 'U7' '2' 'U7' '1' } 'Disconnected'
Reject 'battery-reversed' { param($x) Move-Pin $x 'J26' '1' 'J26' '2' } 'Disconnected'
Reject 'usb-dminus-miswired' { param($x) Move-Pin $x 'U2' '26' 'U2' '27' } 'Disconnected'
Reject 'charger-enabled-by-default' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='JP20']/libsource").SetAttribute('part','Jumper_2_Closed')
} 'must default open'
Reject 'wrong-charger-package' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='U6']/footprint").InnerText = 'Package_TO_SOT_SMD:TSOT-23-6'
} 'Unreviewed package'
Reject 'wrong-rt-pin-map' { param($x)
    $x.SelectSingleNode("/export/libparts/libpart[@part='RT9080-3.3']/pins/pin[@num='4']").SetAttribute('name','SNS')
} 'Unreviewed library pin'
Reject 'wrong-charge-setting' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='R46']/value").InnerText = '1k'
} 'Unexpected Beetle resistor'
Reject 'resistor-rating-downgrade' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='R45']/fields/field[@name='Power_Rating_MIN']").InnerText = '0.125 W'
} 'R45 requires'
Reject 'unverified-diode-selection' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='D20']/fields/field[@name='MPN']").InnerText = 'SS14-E3/61'
} 'Unexpected MPN'
if ($Before) {
    Reject 'unrelated-main-component-change' { param($x)
        $x.SelectSingleNode("/export/components/comp[@ref='R66']/value").InnerText = '1M'
    } 'Non-LV inventory/connectivity changed'
}
Reject 'wrong-pmos-manufacturer' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='Q20']/fields/field[@name='MPN']").InnerText='AO3407'
} 'Unexpected MPN'
Reject 'wrong-charge-led-package' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='D21']/footprint").InnerText='LED_SMD:LED_0805_2012Metric'
} 'Unreviewed package'
Reject 'wrong-charge-resistor-mpn' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='R45']/fields/field[@name='MPN']").InnerText='CRM0805-FX-R820ELF'
} 'Unexpected MPN'
Reject 'leakage-pulldown-old-value' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='R51']/value").InnerText='10k' } 'Unexpected Beetle resistor'
Reject 'wrong-blocking-diode-footprint' { param($x) $x.SelectSingleNode("/export/components/comp[@ref='D20']/footprint").InnerText='Diode_SMD:D_SOD-123' } 'Unreviewed package'
Write-Output "PASS: positive design plus $script:count intentional regressions. XML-only fixtures: $scratch"
