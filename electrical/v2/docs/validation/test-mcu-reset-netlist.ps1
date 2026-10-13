param([Parameter(Mandatory=$true)][string]$Netlist)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$settings = [Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
$reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $Netlist).Path, $settings)
try { $xml = [Xml.XmlDocument]::new(); $xml.Load($reader) } finally { $reader.Dispose() }

function Pin-Net([string]$endpoint) {
    $ref, $pin = $endpoint.Split('.')
    $nodes = $xml.SelectNodes("/export/nets/net/node[@ref='$ref' and @pin='$pin']")
    if ($nodes.Count -ne 1) { throw "Missing or duplicate endpoint: $endpoint" }
    return $nodes[0].ParentNode.GetAttribute('code')
}

function Same-Net([string]$name, [string[]]$endpoints) {
    $nets = @($endpoints | ForEach-Object { Pin-Net $_ } | Sort-Object -Unique)
    if ($nets.Count -ne 1) { throw "$name disconnected: $($endpoints -join ', ')" }
    return $nets[0]
}

# ERC cannot detect an RC network whose midpoint misses the intended EN pin.
$en = Same-Net 'MCU reset RC' @('U2.8', 'J23.1', 'R30.2', 'C32.1')
$rail = Same-Net '3V3 supply' @('U7.5', 'U2.3', 'R30.1', 'R86.1')
$ground = Same-Net 'Logic ground' @('U2.1', 'J23.3', 'C32.2', 'R86.2', 'TP47.1')
if (@($en, $rail, $ground | Sort-Object -Unique).Count -ne 3) {
    throw 'Reset, 3V3 and GND must be distinct nets'
}
Write-Output 'PASS: reset RC, supply, rail bleeder and ground probe connectivity'
