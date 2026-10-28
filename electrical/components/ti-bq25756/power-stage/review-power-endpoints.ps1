param([Parameter(Mandatory=$true)][string]$Netlist, [switch]$Voltage70, [switch]$ThtBulk, [switch]$AoyFets)
$ErrorActionPreference = 'Stop'
if ($ThtBulk -and !$Voltage70) { throw 'THT bank applies only to the 70V revision.' }
if ($AoyFets -and !$Voltage70) { throw 'AOY selection applies only to the 70V revision.' }
$fetD = if ($AoyFets) { '2' } else { '5' }
$fetS = if ($AoyFets) { '3' } else { '1' }
$fetG = if ($AoyFets) { '1' } else { '4' }
$bulkMpn = if ($ThtBulk) { 'EEU-FR2A101' } else { '100SXV27M' }
$bulkValue = if ($ThtBulk) { '100uF/100V' } else { '27uF 100V' }
$bulkFootprint = if ($ThtBulk) { 'Capacitor_THT:CP_Radial_D10.0mm_P5.00mm' } else { 'Capacitor_SMD:CP_Elec_10x12.5' }
[xml]$xml = Get-Content -LiteralPath $Netlist -Raw
$script:checks = 0
function Check($condition, [string]$message) {
    if (-not $condition) { throw $message }
    $script:checks++
}
function Part([string]$reference) {
    $found = @($xml.export.components.comp | Where-Object { $_.ref -eq $reference })
    Check ($found.Count -eq 1) "Expected one component $reference"
    return $found[0]
}
function Net([string]$reference, [string]$pin) {
    $found = @($xml.export.nets.net | Where-Object {
        @($_.node | Where-Object { $_.ref -eq $reference -and $_.pin -eq $pin }).Count -gt 0
    })
    Check ($found.Count -eq 1) "Expected one net for $reference.$pin"
    return $found[0].name
}
function Same($a, $ap, $b, $bp) {
    Check ((Net $a $ap) -eq (Net $b $bp)) "Expected $a.$ap connected to $b.$bp"
}
function Field([string]$reference, [string]$name) {
    return ((Part $reference).fields.field | Where-Object { $_.name -eq $name }).'#text'
}
foreach ($removed in @('R74','J30','U1','R2','R3','TP1','TP2')) {
    Check (@($xml.export.components.comp | Where-Object { $_.ref -eq $removed }).Count -eq 0) "Unexpected retained $removed"
}
Check ((Field R1 MPN) -eq 'CSS4J-4026K-5L00F') 'Wrong R1 MPN'
Same F1 2 JP30 1
if ($Voltage70) {
    Check (@($xml.export.components.comp | Where-Object { $_.ref -eq 'J2' }).Count -eq 0) 'External converter J2 must be absent'
} else {
    Same J2 2 JP30 1
}
Same JP30 2 R1 4
Same R1 1 U9 32
Same R1 3 R80 1
Same R80 2 U9 30
Same R1 2 R81 1
Same R81 2 U9 29
Check ((Net R1 3) -ne (Net R1 4)) 'Kelvin high wire shorted to force path in schematic'
Check ((Net R1 2) -ne (Net R1 1)) 'Kelvin low wire shorted to force path in schematic'
Check ((Field R62 MPN) -eq 'RC0805FR-071K47L') 'Wrong ILIM resistor'
Check ((Part R62).footprint -match '0805') 'R62 must use selected 0805 body'
Same R62 1 U9 10
Same R62 2 U9 17
Same R75 1 Q12 $fetD
Same R75 1 R82 1
Same R82 2 U9 14
Same R75 2 R83 1
Same R83 2 U9 13
Same R75 2 JP31 1
Same JP31 2 J31 1
Same J31 2 U9 17
$banks = @(
    @{refs=@('C73','C81'); anchor='R1'; pin='4'},
    @{refs=@('C74','C82'); anchor='R1'; pin='1'},
    @{refs=@('C75','C83','C84','C85'); anchor='R75'; pin='1'},
    @{refs=@('C76','C86'); anchor='R75'; pin='2'}
)
if ($Voltage70) {
    $banks[1].refs += 'C87'
    $banks[2].refs += 'C88'
}
foreach ($bank in $banks) {
    foreach ($reference in $bank.refs) {
        if ($Voltage70) {
            Check ((Field $reference MPN) -eq $bulkMpn) "Wrong 100 V bulk capacitor $reference"
            Check ((Part $reference).value -eq $bulkValue) "Wrong bulk value $reference"
            Check ((Part $reference).footprint -eq $bulkFootprint) "Wrong bulk model $reference"
            Check ((Part $reference).libsource.part -eq 'C_Polarized') "Wrong bulk symbol $reference"
        } else {
            Check ((Field $reference MPN) -eq 'B40950A0566M000') "Wrong bulk capacitor $reference"
        }
        Same $reference 1 $bank.anchor $bank.pin
        Same $reference 2 U9 17
    }
}
if ($Voltage70) {
    $bulk = @($xml.export.components.comp | Where-Object { @($_.fields.field | Where-Object { $_.name -eq 'MPN' -and $_.'#text' -eq $bulkMpn }).Count -gt 0 })
    Check ($bulk.Count -eq 12) 'Expected exactly twelve 100 V bulk capacitors'
    foreach ($reference in @('Q10','Q11','Q12','Q13')) {
        if ($AoyFets) {
            Check ((Field $reference MPN) -eq 'AOY66923') "Wrong THT FET $reference"
            Check ((Part $reference).footprint -eq 'Package_TO_SOT_THT:TO-251-3_Vertical') "Wrong THT footprint $reference"
            Check ((Part $reference).libsource.part -eq 'Q_NMOS_GDS') "Wrong THT pin map $reference"
            Check ((Net $reference $fetG) -ne (Net $reference $fetD)) "Gate-drain short $reference"
            Check ((Net $reference $fetD) -ne (Net $reference $fetS)) "Drain-source short $reference"
        } else {
            Check ((Field $reference MPN) -eq 'SIR870ADP-T1-RE3') "Wrong 100 V FET $reference"
            Check ((Part $reference).footprint -eq 'Package_SO:PowerPAK_SO-8_Single') "Wrong FET footprint $reference"
            foreach ($pin in @('2','3')) { Same $reference $pin $reference 1 }
        }
    }
    Same Q10 $fetD R1 1
    Same Q10 $fetS L3 1
    Same Q11 $fetD L3 1
    Same Q11 $fetS U9 17
    Same Q12 $fetS L3 2
    Same Q13 $fetD L3 2
    Same Q13 $fetS U9 17
    foreach ($row in @(@('Q10','R76','27'),@('Q11','R77','25'),@('Q12','R78','19'),@('Q13','R79','21'))) {
        Same $row[0] $fetG $row[1] 2
        Same $row[1] 1 U9 $row[2]
    }
    foreach ($row in @(@('R63','RT0805BRD071ML','1M 0.1%'),@('R64','RT0805BRD07105KL','105k 0.1%'),@('R65','RT0805BRD0719K6L','19.6k 0.1%'))) {
        Check ((Field $row[0] MPN) -eq $row[1]) "Wrong UV/OV MPN $($row[0])"
        Check ((Part $row[0]).value -eq $row[2]) "Wrong UV/OV value $($row[0])"
        Check ((Part $row[0]).footprint -eq 'Resistor_SMD:R_0805_2012Metric') "Wrong UV/OV model $($row[0])"
    }
    Same R63 1 U9 32
    Same R63 2 R64 1
    Same R64 1 U9 34
    Same R64 2 R65 1
    Same R65 1 U9 35
    Same R65 2 U9 17
    Check ((Field R75 MPN) -eq 'WSL25125L000FEB') 'Wrong output shunt'
    Check ((Field F1 MPN) -eq '0456020.ER') 'Wrong F1 variant'
    Check ((Part F1).value -in @('20A / 100VDC','20A/100VDC')) 'Wrong F1 displayed rating'
    Check ((Field L3 MPN) -eq 'IHLP6767GZER100M01') 'Unexpected inductor substitution'
    Same J1 1 D2 5
    Same J1 1 F1 1
    Same J1 2 D2 1
    Same D1 1 F1 2
    Same D1 2 U9 17

    # Local controller connections, independently checked against TI SLUSEN5A.
    Same U9 32 U9 33
    foreach ($pin in @('22','37')) { Same U9 $pin U9 17 }
    Same U9 23 U9 24
    foreach ($reference in @('C60','C61')) {
        Check ((Part $reference).value -eq '4.7uF 25V') "Wrong driver bypass $reference"
        Same $reference 1 U9 24
        Same $reference 2 U9 17
    }
    foreach ($reference in @('C62','C63','C64')) {
        $expected = if ($reference -eq 'C62') { '1uF 100V' } else { '100nF 100V' }
        Check ((Part $reference).value -eq $expected) "Wrong VAC bypass $reference"
        Same $reference 1 U9 32
        Same $reference 2 U9 17
    }
    foreach ($row in @(@('D10','C65','26','28'),@('D11','C66','20','18'))) {
        Same $row[0] 2 U9 24
        Same $row[0] 1 U9 $row[2]
        Same $row[1] 1 U9 $row[2]
        Same $row[1] 2 U9 $row[3]
        Check ((Part $row[1]).value -eq '100nF 25V') "Wrong bootstrap capacitor $($row[1])"
        Check ((Field $row[0] MPN) -eq 'V1FM10-M3/H') "Wrong bootstrap diode $($row[0])"
    }
    Same U9 28 L3 1
    Same U9 18 L3 2
    foreach ($reference in @('R76','R77','R78','R79')) {
        Check ((Part $reference).value -eq '0R') "Wrong gate resistor $reference"
    }
    foreach ($reference in @('R80','R81','R82','R83')) {
        Check ((Part $reference).value -eq '10R 1%') "Wrong sense filter resistor $reference"
    }
    foreach ($row in @(@('C67','C68','C69','30','29'),@('C70','C71','C72','14','13'))) {
        Check ((Part $row[0]).value -eq '470nF 16V') "Wrong differential filter $($row[0])"
        Same $row[0] 1 U9 $row[3]
        Same $row[0] 2 U9 $row[4]
        Same $row[1] 1 U9 $row[3]
        Same $row[2] 1 U9 $row[4]
        foreach ($reference in @($row[1],$row[2])) {
            Check ((Part $reference).value -eq '100nF 100V') "Wrong common-mode filter $reference"
            Same $reference 2 U9 17
        }
    }
    foreach ($row in @(@('R60','133k 1%'),@('R61','5.49k 1%'),@('RV1','50k 3296W'),@('R71','10k'),@('R72','5.23k 1%'),@('R73','30.1k 1%'))) {
        Check ((Part $row[0]).value -eq $row[1]) "Wrong control value $($row[0])"
    }
    Same R60 1 U9 36
    Same R60 2 U9 17
    Same R61 1 U9 9
    Same R61 2 RV1 3
    Same RV1 1 RV1 2
    Same RV1 2 U9 17
    Same R71 1 U9 7
    Same R71 2 U9 17
    Same U9 11 RV2 3
    Same U9 12 K1 3
    Same U9 12 R66 2
    Same R66 1 R75 2
    Same U9 1 R68 2
    Same U9 2 R69 2
    Same U9 3 R70 2
    Same R70 1 U2 3
    foreach ($row in @(@('1','2'),@('2','3'),@('3','4'),@('7','5'),@('17','6'))) {
        Same U9 $row[0] J32 $row[1]
    }
    Same J32 1 U2 3
    foreach ($pin in @('4','5','6','15','16','31')) {
        $name = Net U9 $pin
        $net = @($xml.export.nets.net | Where-Object { $_.name -eq $name })[0]
        Check ($name -like 'unconnected-*' -and @($net.node).Count -eq 1) "U9.$pin must remain unused"
    }
    # Each functional controller net is distinct except documented VAC/REGN/GND ties.
    $pins = @('1','2','3','7','8','9','10','11','12','13','14','17','18','19','20','21','24','25','26','27','28','29','30','32','34','35','36')
    $names = @($pins | ForEach-Object { Net U9 $_ })
    Check (@($names | Sort-Object -Unique).Count -eq $pins.Count) 'Unexpected short between controller functional nets'
}
Same C79 1 R75 1
Same C80 1 R75 2
foreach ($reference in @('J31','JP30','JP31')) {
    Check ((Field $reference MPN) -eq '1711725') "Wrong current-rated terminal $reference"
    Check ((Part $reference).footprint -eq 'TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-3-2-5.08_1x02_P5.08mm_Horizontal') "Wrong terminal footprint $reference"
}
Check ((Field D20 MPN) -eq 'SS1H10-E3/61T') 'Wrong USB diode'
Same D20 2 J27 A4
Same D20 1 U7 1
Same R51 1 D20 2
Same R51 2 U9 17
Check ((Part R51).value -eq '1k') 'USB pulldown must be 1k'
Same R72 1 U9 24
Same R72 2 U9 8
Same R73 1 U9 8
Same R73 2 U9 17
Same J33 1 U9 8
Same J33 2 U9 17
foreach ($reference in @('R4','R6')) {
    Check ((Part $reference).value -eq '4.7k') "Wrong shared I2C pullup $reference"
    Same $reference 1 U2 3
}
if ($Voltage70) {
    # R4/R6 are identical pullups; user rearrangement swapped their bus assignments.
    $pullups = @((Net R4 2), (Net R6 2)) | Sort-Object
    $bus = @((Net U2 12), (Net U2 13)) | Sort-Object
    Check (($pullups -join '|') -eq ($bus -join '|')) 'Expected one shared pullup on each I2C line'
    Same R68 1 U2 13
    Same R69 1 U2 12
} else {
    Same R4 2 U2 12
    Same R6 2 U2 13
}
Check (@($xml.export.nets.net | Where-Object { $_.name -match 'INA_ALERT|INA228|INA238' }).Count -eq 0) 'Stale INA net names'
foreach ($row in @(@('R7','5','1'),@('R8','6','3'),@('R9','18','5'),@('R10','22','7'),@('R34','16','9'))) {
    Same $row[0] 1 U2 $row[1]
    Same $row[0] 2 J5 $row[2]
}
Write-Output "PASS: $script:checks endpoint/part assertions. No PCB, thermal, transient or energization qualification."
