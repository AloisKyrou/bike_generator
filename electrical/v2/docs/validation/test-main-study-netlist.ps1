param([Parameter(Mandatory = $true)][string]$Netlist)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$settings = [Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
$reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $Netlist).Path, $settings)
try { $xml = [Xml.XmlDocument]::new(); $xml.Load($reader) } finally { $reader.Dispose() }
$pins = @{}
foreach ($net in $xml.SelectNodes('/export/nets/net')) {
    foreach ($node in $net.SelectNodes('node')) {
        $key = "$($node.ref).$($node.pin)"
        if ($pins.ContainsKey($key)) { throw "Duplicate endpoint $key" }
        $pins[$key] = [string]$net.name
    }
}
$script:checks = 0
function Connected([string[]]$endpoints) {
    $expected = $null
    foreach ($endpoint in $endpoints) {
        if (!$pins.ContainsKey($endpoint)) { throw "Missing endpoint $endpoint" }
        if ($null -eq $expected) { $expected = $pins[$endpoint] }
        if ($pins[$endpoint] -ne $expected) { throw "Disconnected: $($endpoints -join ', ')" }
    }
    $script:checks++
}
function Separate([string[]]$endpoints) {
    foreach ($endpoint in $endpoints) {
        if (!$pins.ContainsKey($endpoint)) { throw "Missing endpoint $endpoint" }
    }
    if (@($endpoints | ForEach-Object {$pins[$_]} | Sort-Object -Unique).Count -ne $endpoints.Count) {
        throw "Unexpected short: $($endpoints -join ', ')"
    }
    $script:checks++
}
function Component([string]$reference) {
    $items = $xml.SelectNodes("/export/components/comp[@ref='$reference']")
    if ($items.Count -ne 1) { throw "Missing/duplicate component $reference" }
    $items[0]
}

# TI SLUSEN5A pin map, including pin17 PGND (not the older EVM MODE name).
foreach ($group in @(
    @('U9.1','J32.2','R68.2'), @('U9.2','J32.3','R69.2'),
    @('U9.3','J32.4','R70.2'), @('U9.7','J32.5','R71.1'),
    @('U9.8','J33.1','R72.2','R73.1'), @('U9.9','R61.1'),
    @('U9.10','R62.1'), @('U9.11','RV2.3'), @('U9.12','R66.2','K1.3'),
    @('R67.1','K1.2'),
    @('R61.2','RV1.3'), @('R67.2','RV2.1','RV2.2'),
    @('U9.13','R83.2','C70.2','C72.1'), @('U9.14','R82.2','C70.1','C71.1'),
    @('U9.17','U9.22','U9.37','J32.6','R71.2','J33.2','R60.2','RV1.1','RV1.2','R62.2','R65.2','R73.2'),
    @('U9.18','L3.2','Q12.1','Q12.2','Q12.3','Q13.5','C66.2'),
    @('U9.19','R78.1'), @('U9.20','D11.1','C66.1'), @('U9.21','R79.1'),
    @('U9.23','U9.24','D10.2','D11.2','C60.1','C61.1','R72.1'),
    @('U9.25','R77.1'), @('U9.26','D10.1','C65.1'), @('U9.27','R76.1'),
    @('U9.28','L3.1','Q10.1','Q10.2','Q10.3','Q11.5','C65.2'),
    @('U9.29','R81.2','C67.2','C69.1'), @('U9.30','R80.2','C67.1','C68.1'),
    @('U9.32','U9.33','R1.1','Q10.5','R63.1','C62.1','C63.1','C64.1'),
    @('U9.34','R63.2','R64.1'), @('U9.35','R64.2','R65.1'), @('U9.36','R60.1'),
    @('J32.1','R70.1','U2.3','R4.1','R6.1'),
    @('R68.1','U2.13','R6.2'), @('R69.1','U2.12','R4.2'),
    @('JP30.2','R1.4'), @('R1.3','R80.1'), @('R1.2','R81.1'),
    @('JP30.1','J2.2','F1.2','D1.1'), @('Q12.5','R75.1','R82.1'),
    @('JP31.1','R75.2','R83.1','R66.1'),
    @('Q10.4','R76.2'), @('Q11.4','R77.2'), @('Q12.4','R78.2'), @('Q13.4','R79.2'),
    @('U9.17','Q11.1','Q11.2','Q11.3','Q13.1','Q13.2','Q13.3'),
    @('U9.17','C60.2','C61.2','C62.2','C63.2','C64.2','C68.2','C69.2','C71.2','C72.2')
)) { Connected $group }
foreach ($pin in @(4,5,6,15,16,31)) {
    $net = $xml.SelectSingleNode("/export/nets/net[node[@ref='U9' and @pin='$pin']]")
    if (!$net -or $net.SelectNodes('node').Count -ne 1) { throw "U9.$pin must remain explicitly unconnected" }
    $script:checks++
}
if (@($pins.Keys | Where-Object {$_ -like 'U9.*'}).Count -ne 37) { throw 'Expected all 37 U9 pins in export' }
$script:checks++
foreach ($group in @(
    @('U9.17','U9.23','U9.28','U9.18','Q10.5','Q12.5','R1.4','R75.2'),
    @('Q10.4','Q11.4','Q12.4','Q13.4','U9.17'),
    @('U9.26','U9.20','U9.28','U9.18','U9.23'),
    @('U9.29','U9.30','R1.1','R1.2','R1.3','R1.4'), @('U9.13','U9.14','R75.1','R75.2'),
    @('JP30.1','JP30.2'), @('JP31.1','JP31.2'),
    @('J32.1','J27.A4','U9.17','U9.23','U9.32','R75.2'),
    @('U9.1','U2.13'), @('U9.2','U2.12'), @('U9.7','J32.1','U9.17'),
    @('U9.1','U9.2','U9.3','U9.7','J32.1','U9.17')
)) { Separate $group }
foreach ($reference in @('JP30','JP31')) {
    if ((Component $reference).libsource.part -ne 'Jumper_2_Open') { throw "$reference must default open" }
    $script:checks++
}
if ($xml.SelectSingleNode("/export/components/comp[@ref='JP32']")) { throw 'Redundant CE bench jumper must be removed.' }
$script:checks++
foreach ($entry in @(@('R68','0R'),@('R69','0R'),@('R70','10k'),@('R71','10k'),@('R4','4.7k'),@('R6','4.7k'))) {
    if ((Component $entry[0]).value -ne $entry[1]) { throw "Wrong I2C/CE value $($entry[0])" }
    $script:checks++
}
foreach ($entry in @(
    @('U9','BQ25756RRVR'), @('Q10','SIR680LDP-T1-RE3'), @('Q11','SIR680LDP-T1-RE3'),
    @('Q12','SIR680LDP-T1-RE3'), @('Q13','SIR680LDP-T1-RE3'), @('L3','IHLP6767GZER100M01'),
    @('D10','V1FM10-M3/H'), @('D11','V1FM10-M3/H'),
    @('R1','CSS4J-4026K-5L00F'), @('R75','WSL25125L000FEB'),
    @('R62','RC0805FR-071K47L'),
    @('R61','RC0805FR-075K49L'), @('R66','RT0805BRD07249KL'), @('R67','RT0805BRD077K5L'),
    @('RV1','3296W-1-503LF'), @('RV2','3296W-1-503LF')
)) {
    $field = (Component $entry[0]).SelectSingleNode("fields/field[@name='MPN']")
    if (!$field -or $field.InnerText -ne $entry[1]) { throw "Unexpected MPN $($entry[0])" }
    $script:checks++
}
foreach ($entry in @(@('R60','133k 1%'),@('R61','5.49k 1%'),@('R62','1.47k 1%'),@('R66','249k 0.1%'),@('R67','7.50k 0.1%'),@('RV1','50k 3296W'),@('RV2','50k 3296W'))) {
    if ((Component $entry[0]).value -ne $entry[1]) { throw "Unexpected study setpoint $($entry[0])" }
    $script:checks++
}
Separate @('R61.1','R61.2','RV1.1')
Separate @('R66.1','R66.2','R67.2','RV2.3','U9.17')
foreach ($reference in @('RV1','RV2')) {
    if ((Component $reference).footprint -ne 'Potentiometer_THT:Potentiometer_Bourns_3296W_Vertical') { throw "Wrong trimmer footprint $reference" }
    $script:checks++
}
foreach ($reference in @('R61','R62','R66','R67')) {
    if ((Component $reference).footprint -ne 'Resistor_SMD:R_0805_2012Metric_Pad1.20x1.40mm_HandSolder') { throw "Wrong guard footprint $reference" }
    $script:checks++
}
Connected @('C73.1','C81.1','R1.4')
Connected @('C74.1','C82.1','C77.1','C78.1','Q10.5')
Connected @('C75.1','C83.1','C84.1','C85.1','C79.1','Q12.5')
Connected @('C76.1','C86.1','C80.1','R75.2')
Connected @('U9.17','C73.2','C74.2','C75.2','C76.2','C77.2','C78.2','C79.2','C80.2','C81.2','C82.2','C83.2','C84.2','C85.2','C86.2')
foreach ($reference in @('C73','C74','C75','C76','C77','C78','C79','C80','C81','C82','C83','C84','C85','C86')) {
    $mpn = (Component $reference).SelectSingleNode("fields/field[@name='MPN']")
    $expected = if ($reference -in @('C77','C78','C79','C80')) {'C3225X7R2A106K250AC'} else {'B40950A0566M000'}
    if (!$mpn -or $mpn.InnerText -ne $expected) { throw "Unexpected bank MPN $reference" }
    $script:checks++
}
foreach ($ref in @('U1','R74','J30','R2','R3','R5','C1','C2','C3','JP1','JP2','J9')) {
    if ($xml.SelectSingleNode("/export/components/comp[@ref='$ref']")) { throw "Obsolete default-assembly component $ref remains" }
    $script:checks++
}
foreach ($ref in @('J31','JP30','JP31')) {
    $part = Component $ref
    if ($part.footprint -ne 'TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-3-2-5.08_1x02_P5.08mm_Horizontal' -or
        $part.SelectSingleNode("fields/field[@name='MPN']").InnerText -ne '1711725') { throw "Unreviewed power terminal $ref" }
    $script:checks++
}
foreach ($ref in @('C73','C74','C75','C76','C81','C82','C83','C84','C85','C86')) {
    if ((Component $ref).footprint -ne 'Capacitor_SMD:CP_Elec_10x10.5') { throw "Wrong bulk footprint $ref" }
    $script:checks++
}
Write-Output "PASS: $script:checks main-study endpoint/model/default checks. NOT a thermal, safety or fabrication qualification."
