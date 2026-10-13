param([Parameter(Mandatory = $true)][string]$Netlist)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if ([IO.Path]::GetExtension($Netlist) -ne '.xml') { throw 'Use a KiCad XML netlist export.' }
$settings = [Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
$reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $Netlist).Path, $settings)
try { $xml = [Xml.XmlDocument]::new(); $xml.Load($reader) } finally { $reader.Dispose() }
$pins = @{}
foreach ($net in $xml.SelectNodes('/export/nets/net')) {
    foreach ($node in $net.SelectNodes('node')) {
        $key = "$($node.ref).$($node.pin)"
        if ($pins.ContainsKey($key)) { throw "Pin appears on multiple nets: $key" }
        $pins[$key] = [string]$net.name
    }
}
$script:checks = 0
function Connected([string[]]$endpoints) {
    $expected = $null
    foreach ($endpoint in $endpoints) {
        if (!$pins.ContainsKey($endpoint)) { throw "Missing pin $endpoint" }
        if ($null -eq $expected) { $expected = $pins[$endpoint] }
        if ($pins[$endpoint] -ne $expected) { throw "Disconnected: $($endpoints -join ', ')" }
    }
    $script:checks++
}
function Separate([string[]]$endpoints) {
    foreach ($endpoint in $endpoints) {
        if (!$pins.ContainsKey($endpoint)) { throw "Missing pin $endpoint" }
    }
    if (@($endpoints | ForEach-Object {$pins[$_]} | Sort-Object -Unique).Count -ne $endpoints.Count) {
        throw "Unexpected net short: $($endpoints -join ', ')"
    }
    $script:checks++
}
function Component([string]$reference) {
    $result = $xml.SelectSingleNode("/export/components/comp[@ref='$reference']")
    if (!$result) { throw "Missing component $reference" }
    $result
}
foreach ($entry in @(
    @('U5','TPS2116DRLR'), @('U6','BQ24074RGTR'), @('U7','TPS63031DSKR'),
    @('Q1','2N7002,215'), @('L2','SRN4018-2R2M'),
    @('J27','USB4105-GF-A-120'), @('U8','USBLC6-2SC6')
)) {
    $mpn = (Component $entry[0]).SelectSingleNode("fields/field[@name='MPN']")
    if (!$mpn -or $mpn.InnerText -ne $entry[1]) { throw "Unexpected MPN for $($entry[0])" }
    $script:checks++
}

# Check physical pin endpoints, independent of hierarchy/net-label spelling.
Connected @('U5.3','U5.5','C40.1','R40.1')
Connected @('U5.6','C41.1','L1.2')
Connected @('U5.4','R40.2','R41.1')
Connected @('U5.2','U5.7','U6.13','C42.1','C43.1','R42.1','R43.1')
Connected @('U5.8','Q1.1','R42.2','R44.1')
Connected @('Q1.3','U6.5','R43.2')
Connected @('U6.10','U6.11','U7.5','U7.8','C44.1','C46.1','C49.1','JP21.1','R47.1')
Connected @('U6.2','U6.3','C45.1','J26.1')
Connected @('U6.1','J26.2')
Connected @('U6.4','R47.2','JP20.1')
Connected @('U6.12','R45.1')
Connected @('U6.16','R46.1')
Connected @('U7.6','R48.1','JP21.2')
Connected @('U7.4','L2.1')
Connected @('U7.2','L2.2')
Connected @('U7.1','U7.10','C47.1','C48.1','U2.3','U1.6','U3.14','J20.1')
Connected @('U5.1','U6.6','U6.8','U6.17','U7.3','U7.7','U7.9','U7.11',
    'Q1.2','J26.3','JP20.2','R41.2','R44.2','R45.2','R46.2','R48.2','J20.2',
    'C40.2','C41.2','C42.2','C43.2','C44.2','C45.2','C46.2','C47.2','C48.2','C49.2')
Separate @('U5.3','U5.6','U5.2','U6.10','U6.2','U7.1','U5.1')
Separate @('U7.4','U7.2','U7.1','U5.1')
Separate @('U6.4','U6.10','U5.1')
Separate @('U7.6','U6.10','U5.1')
Connected @('J27.A4','J27.A9','J27.B4','J27.B9','U8.5','U5.3','C50.1','J25.1')
Connected @('J27.A1','J27.A12','J27.B1','J27.B12','J27.SH','U8.2','C50.2','R49.2','R50.2','U5.1')
Connected @('J27.A5','R49.1')
Connected @('J27.B5','R50.1')
Connected @('J27.A7','J27.B7','U8.1')
Connected @('J27.A6','J27.B6','U8.3')
Connected @('U8.6','R33.2','J21.2')
Connected @('U8.4','R32.2','J21.1')
Connected @('R33.1','U2.26')
Connected @('R32.1','U2.27')
Separate @('J27.A5','J27.B5','J27.A4','J27.A1','J27.A6','J27.A7')
Separate @('U2.26','U2.27','U2.3','U5.1')
foreach ($ref in @('JP20','JP21')) {
    if ((Component $ref).libsource.part -notin @('Jumper_2_Open','SolderJumper_2_Open')) {
        throw "$ref must default open until its qualification gate is resolved."
    }
    $script:checks++
}
foreach ($pin in @('U6.7','U6.9','U6.14','U6.15','J27.A8','J27.B8')) {
    if (!$pins.ContainsKey($pin) -or $pins[$pin] -notlike 'unconnected-*') {
        throw "Re-review intentional open pin $pin against its manufacturer datasheet."
    }
    $script:checks++
}
Write-Output "PASS: $script:checks LV component/connectivity assertions. Not a hardware, USB-compliance or safety qualification."
