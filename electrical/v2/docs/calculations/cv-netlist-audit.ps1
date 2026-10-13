param(
    [Parameter(Mandatory = $true)][string]$Netlist,
    [switch]$OpenIdleContact,
    [switch]$Voltage70
)
$ErrorActionPreference = 'Stop'
$openIdle = $OpenIdleContact -or $Voltage70
[xml]$design = Get-Content -LiteralPath $Netlist
$pins = @{}
$netNodes = @{}
$components = @{}
$passed = [System.Collections.Generic.List[string]]::new()
foreach ($component in $design.export.components.comp) { $components[$component.ref] = $component }
foreach ($net in $design.export.nets.net) {
    $nodes = @($net.node | ForEach-Object { "$($_.ref).$($_.pin)" })
    $netNodes[$net.name] = $nodes
    foreach ($node in $nodes) {
        if ($pins.ContainsKey($node)) { throw "Duplicate endpoint $node" }
        $pins[$node] = $net.name
    }
}
function Require-Same([string]$Label, [string[]]$Nodes, [switch]$Exact) {
    $first = $pins[$Nodes[0]]
    if (!$first) { throw "$Label missing endpoint $($Nodes[0])" }
    foreach ($node in $Nodes) {
        if ($pins[$node] -ne $first) { throw "$Label wrong/missing endpoint $node" }
    }
    if ($Exact -and $netNodes[$first].Count -ne $Nodes.Count) {
        throw "$Label has unexpected endpoints: $($netNodes[$first] -join ', ')"
    }
    $passed.Add($Label)
}
function Require-Value([string]$Ref, [string]$Prefix) {
    if (!$components.ContainsKey($Ref)) {
        throw "Wrong/missing component $Ref, expected $Prefix"
    }
    # Accept the approved compact slash typography in newer schematic exports.
    $actual = $components[$Ref].value -replace '\s*/\s*', '/'
    $expected = $Prefix -replace '\s*/\s*', '/'
    if (!$actual.StartsWith($expected)) {
        throw "Wrong/missing component $Ref, expected $Prefix"
    }
    $passed.Add("$Ref value $Prefix")
}

$fbNodes = @('K1.3','R66.2','U9.12')
if ($components.ContainsKey('TP40')) { $fbNodes += 'TP40.1' }
Require-Same 'Relay common FB / permanent upper resistor' $fbNodes -Exact
Require-Same 'Upper resistor receiver-side output sense' @('R66.1','R75.2','JP31.1')
Require-Same 'Manual NC contact' @('K1.2','R67.1') -Exact
if ($Voltage70) {
    Require-Same 'Manual series guard junction' @('R67.2','R89.1') -Exact
    Require-Same 'Manual guard to tied trimmer end/wiper' @('R89.2','RV2.1','RV2.2') -Exact
} else {
    Require-Same 'Manual guard to tied trimmer end/wiper' @('R67.2','RV2.1','RV2.2') -Exact
}
Require-Same 'Manual FBG return' @('RV2.3','U9.11') -Exact
if ($Voltage70) {
    Require-Same 'Digital NO contact and series guard' @('K1.4','R90.1') -Exact
    Require-Same 'Digital series guard junction' @('R90.2','R84.2') -Exact
    Require-Same 'NX drain after digital guard and zener cathode' @('R84.1','Q21.3','D25.3') -Exact
} else {
    Require-Same 'Digital NO contact and guard' @('K1.4','R84.2') -Exact
    Require-Same 'NX drain after digital guard' @('R84.1','Q21.3') -Exact
}
Require-Same 'NX source to relay second NO' @('Q21.2','K1.7') -Exact
$potNodes = @('U3.6','U3.7','K1.8','D24.3','R85.1')
if ($components.ContainsKey('TP45')) { $potNodes += 'TP45.1' }
Require-Same 'MCP tied A/W, relay common, dual-clamp junction, bleeder' $potNodes -Exact
Require-Same 'Coil supply after series resistor and flyback cathode' @('R88.2','K1.1','D23.3') -Exact
$driveNodes = @('Q21.1','Q22.3','R88.1')
if ($components.ContainsKey('TP46')) { $driveNodes += 'TP46.1' }
Require-Same 'NX gate upstream of coil resistor at PMOS drain' $driveNodes -Exact
Require-Same 'PMOS gate, pullup and GPIO series resistor' @('Q22.1','R19.2','R87.2') -Exact
Require-Same 'GPIO20 active-low selector' @('U2.30','R87.1') -Exact
Require-Same 'Logic rail and inactive MCP pins' @('U2.3','U3.11','U3.12','U3.14','Q22.2','D24.2','R19.1','R86.1','R11.1')
$groundNodes = @('U3.4','U3.5','K1.10','D23.1','D24.1','R85.2','R86.2','U9.17')
if (!$openIdle) { $groundNodes += 'K1.9' }
if ($Voltage70) { $groundNodes += 'D25.1' }
if ($components.ContainsKey('TP47')) { $groundNodes += 'TP47.1' }
Require-Same 'Grounded lower terminals and diode anodes' $groundNodes
Require-Same 'MCP CS with pullup' @('U3.1','U2.19','R11.2') -Exact
Require-Same 'MCP SCK' @('U3.2','U2.20') -Exact
Require-Same 'MCP SDI' @('U3.3','U2.21') -Exact
Require-Same 'Spare A' @('J7.1','U3.8') -Exact
Require-Same 'Spare W' @('J7.2','U3.9') -Exact
Require-Same 'Spare B' @('J7.3','U3.10') -Exact
$noConnects = @('U3.13','K1.5','K1.6','D23.2')
if ($openIdle) { $noConnects += 'K1.9' }
if ($Voltage70) { $noConnects += 'D25.2' }
foreach ($node in $noConnects) {
    Require-Same "Deliberate NC $node" @($node) -Exact
    if ($pins[$node] -notlike 'unconnected-*') { throw "$node is not marked unconnected" }
}
if ($pins['U3.14'] -eq $pins['U3.4']) { throw 'Logic rail shorted to ground' }
if ($components.ContainsKey('J9')) { throw 'Obsolete external CV channel1 J9 still present' }
$passed.Add('J9 absent')
foreach ($entry in @(
    @('U3','MCP4251-503E/SL'), @('K1','TQ2-3V'), @('Q21','NX6008NBKR'),
    @('Q22','AO3401A'), @('D23','BAT54LT1G'), @('D24','BAT54SLT1G'),
    @('R66','249k 0.1%'), @('R86','10k'), @('R87','100R'), @('R88','6.8R'),
    @('R19','10k'), @('R11','10k'), @('RV2','50k'), @('J7','SPARE POT0 / 50k')
)) { Require-Value $entry[0] $entry[1] }
if ($Voltage70) {
    foreach ($entry in @(
        @('R67','5.62k 0.1%'), @('R84','5.62k 0.1%'),
        @('R89','200R 0.1%'), @('R90','200R 0.1%'),
        @('R85','150k 0.1%'), @('D25','BZX84C27LT1G')
    )) { Require-Value $entry[0] $entry[1] }
} else {
    foreach ($entry in @(
        @('R67','7.50k 0.1%'), @('R84','7.50k 0.1%'), @('R85','110k 1%')
    )) { Require-Value $entry[0] $entry[1] }
}
$sot23Refs = @('D23','D24','Q21')
if ($Voltage70) { $sot23Refs += 'D25' }
foreach ($ref in $sot23Refs) {
    if ($components[$ref].footprint -ne 'Package_TO_SOT_SMD:SOT-23') { throw "$ref wrong footprint" }
    $passed.Add("$ref SOT23 footprint")
}
[pscustomobject]@{
    status = 'PASS: static endpoint audit only, not dynamic or fabrication approval'
    netlist = (Resolve-Path -LiteralPath $Netlist).Path
    sha256 = (Get-FileHash -LiteralPath $Netlist -Algorithm SHA256).Hash
    exportDate = $design.export.design.date
    checks = $passed.Count
    idleContact = $(if ($openIdle) { 'open' } else { 'grounded' })
    revision = $(if ($Voltage70) { 'voltage70' } elseif ($OpenIdleContact) { 'continuation' } else { 'adaptive checkpoint' })
    passed = $passed
} | ConvertTo-Json -Depth 5
