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
    $result = $xml.SelectNodes("/export/components/comp[@ref='$reference']")
    if ($result.Count -ne 1) { throw "Missing or duplicate component $reference" }
    $result[0]
}
foreach ($entry in @(
    @('U6','BQ24074RGTR'), @('U7','TPS63031DSKR'), @('L2','SRN4018-2R2M'),
    @('J27','USB4105-GF-A-120'), @('U8','USBLC6-2SC6')
)) {
    $mpn = (Component $entry[0]).SelectSingleNode("fields/field[@name='MPN']")
    if (!$mpn -or $mpn.InnerText -ne $entry[1]) { throw "Unexpected MPN for $($entry[0])" }
    $script:checks++
}
foreach ($component in $xml.SelectNodes('/export/components/comp')) {
    $mpn = $component.SelectSingleNode("fields/field[@name='MPN']")
    if ($mpn -and $mpn.InnerText -match '^(TPS2116|LM5164)') { throw 'Abandoned AUX/mux part remains active.' }
    if ($component.sheetpath.names -match 'AUX_SUPPLY') { throw 'Abandoned AUX sheet remains active.' }
}
$script:checks++

# Physical endpoints, not net-label spelling; open jumpers are distinct nets.
Connected @('U6.13','C42.1','C43.1','J27.A4','J27.A9','J27.B4','J27.B9','U8.5','C50.1','J25.1')
Connected @('U6.10','U6.11','U7.5','U7.8','C44.1','C46.1','C49.1','JP21.1','R47.1','R52.1')
Connected @('U6.2','U6.3','C45.1','J26.1')
Connected @('U6.1','J26.2')
Connected @('U6.4','R47.2','JP20.1')
Connected @('U6.12','R45.1')
Connected @('U6.16','R46.1')
Connected @('U6.6','R51.1')
Connected @('U7.6','R48.2','JP21.2')
Connected @('U7.4','L2.1')
Connected @('U7.2','L2.2')
Connected @('U7.1','U7.10','C47.1','C48.1','U2.3','U1.6','U3.14','J20.1')
Connected @('U6.5','U6.8','U6.17','U7.3','U7.7','U7.9','U7.11',
    'J26.3','JP20.2','R45.2','R46.2','R48.1','R51.2','J20.2','J25.2',
    'C42.2','C43.2','C44.2','C45.2','C46.2','C47.2','C48.2','C49.2',
    'J27.A1','J27.A12','J27.B1','J27.B12','J27.SH','U8.2','C50.2','R49.2','R50.2')
Separate @('U6.13','U6.10','U6.2','U7.1','R1.2','U7.3')
Separate @('U7.4','U7.2','U7.1','U7.3')
Separate @('U6.4','U6.10','U7.3')
Separate @('U7.6','U6.10','U7.3')
Separate @('U6.6','R52.2','U6.10','U7.3')
Connected @('J27.A5','R49.1')
Connected @('J27.B5','R50.1')
Connected @('J27.A7','J27.B7','U8.1')
Connected @('J27.A6','J27.B6','U8.3')
Connected @('U8.6','R33.2','J21.2')
Connected @('U8.4','R32.2','J21.1')
Connected @('R33.1','U2.26')
Connected @('R32.1','U2.27')
Separate @('J27.A5','J27.B5','J27.A4','J27.A1','J27.A6','J27.A7')
Separate @('U2.26','U2.27','U2.3','U7.3')
foreach ($ref in @('JP20','JP21','JP22')) {
    if ((Component $ref).libsource.part -notin @('Jumper_2_Open','SolderJumper_2_Open')) {
        throw "$ref must default open until its qualification gate is resolved."
    }
    $script:checks++
}
foreach ($entry in @(@('R51','100k'), @('R52','10k'))) {
    if ([string](Component $entry[0]).value -notmatch "^$($entry[1])( |$)") { throw "Unexpected selector resistor $($entry[0])" }
    $script:checks++
}
$selector = @('JP22.1','JP22.2') | ForEach-Object {
    if (!$pins.ContainsKey($_)) { throw "Missing selector pin $_" }
    $pins[$_]
}
if (@(Compare-Object ($selector | Sort-Object) (@($pins['R52.2'], $pins['U6.6']) | Sort-Object)).Count) {
    throw 'JP22 must connect R52 to EN1 only when intentionally closed.'
}
$script:checks++
foreach ($pin in @('U6.7','U6.9','U6.14','U6.15','J27.A8','J27.B8')) {
    if (!$pins.ContainsKey($pin) -or $pins[$pin] -notlike 'unconnected-*') {
        throw "Re-review intentional open pin $pin against its manufacturer datasheet."
    }
    $script:checks++
}
foreach ($ref in @('J27','U8','R49','R50','C50','J25')) {
    if ((Component $ref).sheetpath.names -notmatch 'USB_INTERFACE') { throw "$ref must be on the USB interface sheet." }
    $script:checks++
}
Write-Output "PASS: $script:checks USB-only component/connectivity assertions. Not a hardware, USB-compliance or safety qualification."
