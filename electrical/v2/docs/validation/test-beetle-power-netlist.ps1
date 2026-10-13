param(
    [Parameter(Mandatory = $true)][string]$Netlist,
    [string]$Before
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
function Read-Netlist([string]$file) {
    if ([IO.Path]::GetExtension($file) -ne '.xml') { throw 'Use a KiCad XML netlist export.' }
    $settings = [Xml.XmlReaderSettings]::new()
    $settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
    $reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $file).Path, $settings)
    try { $doc = [Xml.XmlDocument]::new(); $doc.Load($reader); return ,$doc }
    finally { $reader.Dispose() }
}
$xml = Read-Netlist $Netlist
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
    foreach ($endpoint in $endpoints) {
        if (!$pins.ContainsKey($endpoint)) { throw "Missing pin $endpoint" }
    }
    if (@($endpoints | ForEach-Object {$pins[$_]} | Sort-Object -Unique).Count -ne 1) {
        throw "Disconnected: $($endpoints -join ', ')"
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
    @('U6','TP4057-42-SOT26-R'), @('U7','RT9080-33GJ5'),
    @('J27','USB4105-GF-A-120'), @('U8','USBLC6-2SC6'), @('J26','S2B-PH-K-S(LF)(SN)'),
    @('Q20','AO3401A'), @('D20','SS1H10-E3/61T'), @('D21','WP710A10LGD'), @('R45','CRM1206-FX-R820ELF')
)) {
    $mpn = (Component $entry[0]).SelectSingleNode("fields/field[@name='MPN']")
    if (!$mpn -or $mpn.InnerText -ne $entry[1]) { throw "Unexpected MPN for $($entry[0])" }
    $script:checks++
}
foreach ($entry in @(
    @('U6','Package_TO_SOT_SMD:SOT-23-6'), @('U7','Package_TO_SOT_SMD:TSOT-23-5'),
    @('J26','Connector_JST:JST_PH_S2B-PH-K_1x02_P2.00mm_Horizontal'),
    @('JP20','Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical'),
    @('R45','Resistor_SMD:R_1206_3216Metric_Pad1.30x1.75mm_HandSolder'),
    @('Q20','Package_TO_SOT_SMD:SOT-23_Handsoldering'), @('D21','LED_THT:LED_D3.0mm'),
    @('D20','Diode_SMD:D_SMA_Handsoldering')
)) {
    if ([string](Component $entry[0]).footprint -ne $entry[1]) { throw "Unreviewed package for $($entry[0])" }
    $script:checks++
}
foreach ($component in $xml.SelectNodes('/export/components/comp')) {
    $mpn = $component.SelectSingleNode("fields/field[@name='MPN']")
    if ($mpn -and $mpn.InnerText -match '^(TPS2116|LM5164|TPS63031|BQ24074)') {
        throw 'Abandoned AUX/mux/charger/regulator part remains active.'
    }
    if ($component.sheetpath.names -match 'AUX_SUPPLY') { throw 'Abandoned AUX sheet remains active.' }
}
$script:checks++
foreach ($ref in @('L2','JP21','JP22','R52','C43','C44','C48','C49')) {
    if ($xml.SelectSingleNode("/export/components/comp[@ref='$ref']")) { throw "Obsolete LV component $ref remains active." }
    $script:checks++
}

# Physical IC pins and verified Q20/D20/D21 mapping.
Connected @('J27.A4','J27.A9','J27.B4','J27.B9','U8.5','C50.1','J25.1',
    'C42.1','R45.1','R47.1','R51.1','Q20.1','D20.2')
Connected @('R45.2','U6.4')
Connected @('U6.3','C45.1','J26.1','Q20.3')
Connected @('Q20.2','D20.1','C46.1','R48.1','U7.1')
Connected @('R48.2','U7.3')
Connected @('U6.1','D21.1')
Connected @('D21.2','R47.2')
Connected @('U6.6','R46.1')
Connected @('R46.2','JP20.1')
Connected @('U7.5','C47.1','U2.3','U3.14','J20.1')
Connected @('U6.2','U7.2','J26.2','JP20.2','R51.2',
    'C42.2','C45.2','C46.2','C47.2','J20.2','J25.2',
    'J27.A1','J27.A12','J27.B1','J27.B12','J27.SH','U8.2','C50.2','R49.2','R50.2')
Separate @('J27.A4','U6.4','U6.3','U7.1','U7.5','R1.2','U7.2')
Separate @('U7.3','U7.1','U7.2')
Separate @('U6.6','R46.2','U6.2')
Separate @('U6.1','R47.2','J27.A4','U6.2')
Connected @('J27.A5','R49.1')
Connected @('J27.B5','R50.1')
Connected @('J27.A7','J27.B7','U8.1')
Connected @('J27.A6','J27.B6','U8.3')
Connected @('U8.6','R33.2','J21.2')
Connected @('U8.4','R32.2','J21.1')
Connected @('R33.1','U2.26')
Connected @('R32.1','U2.27')
Separate @('J27.A5','J27.B5','J27.A4','J27.A1','J27.A6','J27.A7')
Separate @('U2.26','U2.27','U2.3','U7.2')
if ((Component 'JP20').libsource.part -ne 'Jumper_2_Open') { throw 'JP20 must default open: charge qualification pending.' }
$script:checks++
foreach ($entry in @(@('R45','0R82 0.5W'),@('R46','2k'),@('R47','2k'),@('R48','200k'),@('R51','1k'))) {
    if ([string](Component $entry[0]).value -ne $entry[1]) { throw "Unexpected Beetle resistor $($entry[0])" }
    $script:checks++
}
foreach ($pin in @('U6.5','U7.4','J27.A8','J27.B8')) {
    if (!$pins.ContainsKey($pin) -or $pins[$pin] -notlike 'unconnected-*') {
        throw "Re-review intentional open pin $pin against its datasheet."
    }
    $script:checks++
}
$rating = (Component 'R45').SelectSingleNode("fields/field[@name='Power_Rating_MIN']")
if (!$rating -or $rating.InnerText -notmatch '^0\.5 W REQUIRED') {
    throw 'R45 requires an explicitly rated >=0.5 W part; footprint size alone is not a power rating.'
}
$script:checks++
foreach ($entry in @(
    @('TP4057','1','~{CHRG}'),@('TP4057','2','GND'),@('TP4057','3','BAT'),
    @('TP4057','4','V_{CC}'),@('TP4057','5','STDBY'),@('TP4057','6','PROG'),
    @('RT9080-3.3','1','VIN'),@('RT9080-3.3','2','GND'),@('RT9080-3.3','3','EN'),
    @('RT9080-3.3','4','NC'),@('RT9080-3.3','5','VOUT'),
    @('Q_PMOS_GSD','1','G'),@('Q_PMOS_GSD','2','S'),@('Q_PMOS_GSD','3','D'),
    @('D','1','K'),@('D','2','A')
)) {
    $pin = $xml.SelectSingleNode("/export/libparts/libpart[@part='$($entry[0])']/pins/pin[@num='$($entry[1])']")
    if (!$pin -or $pin.name -ne $entry[2]) { throw "Unreviewed library pin $($entry[0]).$($entry[1])" }
    $script:checks++
}

if ($Before) {
    $old = Read-Netlist $Before
    function Outside-LV($doc) {
        $refs = @{}
        $records = @()
        foreach ($part in $doc.SelectNodes('/export/components/comp')) {
            if ($part.sheetpath.names -match '/LOGIC_POWER_USB_ONLY/') { continue }
            $refs[[string]$part.ref] = $true
            $children = @($part.ChildNodes | ForEach-Object {$_.OuterXml} | Sort-Object)
            $records += "COMP:$($part.ref):$($children -join '')"
        }
        foreach ($net in $doc.SelectNodes('/export/nets/net')) {
            foreach ($node in $net.SelectNodes('node')) {
                if ($refs.ContainsKey([string]$node.ref)) {
                    $records += "PIN:$($node.ref).$($node.pin):$($net.name):$($node.GetAttribute('pinfunction')):$($node.GetAttribute('pintype'))"
                }
            }
        }
        $records | Sort-Object
    }
    $diff = @(Compare-Object @(Outside-LV $old) @(Outside-LV $xml))
    if ($diff.Count) { throw "Non-LV inventory/connectivity changed: $($diff | Select-Object -First 4 | Out-String)" }
    $script:checks++
}
Write-Output "PASS: $script:checks Beetle power/model/preservation assertions. Not electrical, USB-compliance or safety qualification."
