param([Parameter(Mandatory=$true)][string]$Netlist)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$settings = [Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
$reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $Netlist).Path, $settings)
try { $xml = [Xml.XmlDocument]::new(); $xml.Load($reader) } finally { $reader.Dispose() }
$script:checks = 0
function Require($condition, $message) {
    if (!$condition) { throw $message }
    $script:checks++
}
function Net($endpoint) {
    $ref, $pin = $endpoint.Split('.')
    $nodes = @($xml.SelectNodes("/export/nets/net/node[@ref='$ref' and @pin='$pin']"))
    Require ($nodes.Count -eq 1) "Missing or duplicated endpoint $endpoint"
    return $nodes[0].ParentNode
}
function Together($endpoints) {
    $first = (Net $endpoints[0]).GetAttribute('code')
    foreach ($endpoint in $endpoints) {
        Require ((Net $endpoint).GetAttribute('code') -eq $first) "Disconnected $endpoint"
    }
}
function Value($ref, $expected) {
    $node = $xml.SelectSingleNode("/export/components/comp[@ref='$ref']/value")
    Require ($null -ne $node -and $node.InnerText -eq $expected) "Wrong value $ref"
}

# USBLC6-2SC6 internally joins 1/6 and 3/4; this test checks its external wiring.
Together @('J27.A6', 'J27.B6', 'U8.3')
Together @('U8.4', 'R32.2', 'J21.1')
Together @('R32.1', 'U2.27')
Together @('J27.A7', 'J27.B7', 'U8.1')
Together @('U8.6', 'R33.2', 'J21.2')
Together @('R33.1', 'U2.26')
Value R32 '22R'
Value R33 '22R'
$esd = $xml.SelectSingleNode("/export/components/comp[@ref='U8']/fields/field[@name='MPN']")
Require ($null -ne $esd -and $esd.InnerText -eq 'USBLC6-2SC6') 'Wrong USB ESD pin map'
Together @('J27.A4', 'J27.A9', 'J27.B4', 'J27.B9', 'U8.5', 'D20.2')
Together @('J27.A1', 'J27.A12', 'J27.B1', 'J27.B12', 'U8.2', 'J21.3', 'J23.3', 'U2.1')
Together @('J27.A5', 'R49.1')
Together @('J27.B5', 'R50.1')
Together @('R49.2', 'R50.2', 'U2.1')
Value R49 '5.1k 1%'
Value R50 '5.1k 1%'
Together @('J23.1', 'U2.8', 'R30.2', 'C32.1')
Together @('J23.2', 'U2.23', 'R31.2')

$separate = @('J27.A6', 'U8.4', 'U2.27', 'J27.A7', 'U8.6', 'U2.26',
    'J27.A4', 'U2.1', 'U2.3', 'J27.A5', 'J27.B5')
$codes = @($separate | ForEach-Object { (Net $_).GetAttribute('code') })
Require (@($codes | Sort-Object -Unique).Count -eq $separate.Count) 'USB data/rail/CC nets merged or series resistor bypassed'
Write-Output "PASS: $script:checks USB service assertions. Connectivity only; not USB compliance, host protection or a physical flash/debug test."
