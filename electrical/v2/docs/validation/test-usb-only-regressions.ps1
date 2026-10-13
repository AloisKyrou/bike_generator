param([Parameter(Mandatory = $true)][string]$Netlist)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$check = Join-Path $PSScriptRoot 'test-usb-only-netlist.ps1'
& $check -Netlist $Netlist
$settings = [Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
$reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $Netlist).Path, $settings)
try { $source = [Xml.XmlDocument]::new(); $source.Load($reader) } finally { $reader.Dispose() }
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
$scratch = Join-Path $repo ('.konnect-scratch/usb-only-tests-' + [Guid]::NewGuid().ToString('N'))
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
Reject 'vbus-short-to-system' { param($x) Move-Pin $x 'U6' '13' 'U6' '10' } 'Disconnected'
Reject 'en1-tied-low' { param($x) Move-Pin $x 'U6' '6' 'U7' '3' } 'Disconnected'
Reject 'en2-tied-high' { param($x) Move-Pin $x 'U6' '5' 'U6' '10' } 'Disconnected'
Reject 'usb-data-swapped' { param($x) Move-Pin $x 'J27' 'A6' 'J27' 'A7' } 'Disconnected'
Reject 'ntc-shorted' { param($x) Move-Pin $x 'J26' '2' 'J26' '3' } 'Disconnected'
Reject 'wrong-charger' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='U6']/fields/field[@name='MPN']").InnerText = 'BQ24075RGTR'
} 'Unexpected MPN'
Reject 'closed-lab-selector' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='JP22']/libsource").SetAttribute('part','Jumper_2_Closed')
} 'must default open'
Reject 'aux-reintroduced' { param($x)
    $x.SelectSingleNode("/export/components/comp[@ref='J25']/sheetpath").SetAttribute('names','/AUX_SUPPLY/')
} 'Abandoned AUX sheet'
Reject 'duplicate-pin' { param($x)
    $node = $x.SelectSingleNode("/export/nets/net/node[@ref='U6' and @pin='13']")
    $null = $node.ParentNode.AppendChild($node.CloneNode($true))
} 'Pin appears on multiple nets'
Write-Output "PASS: positive design plus $script:count intentional regressions. Evidence: $scratch"
