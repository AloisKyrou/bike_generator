param(
    [Parameter(Mandatory = $true)][string]$Netlist,
    [ValidateSet('Direct', 'Raw', 'RheostatStudy', 'ThreeWire')][string]$InterfaceMode = 'Direct',
    [switch]$SelfTest
)

$ErrorActionPreference = 'Stop'

function Test-Controller([xml]$Document) {
    $components = @{}
    $pins = @{}
    $failures = [System.Collections.Generic.List[string]]::new()
    foreach ($c in $Document.export.components.comp) {
        if ($components.ContainsKey($c.ref)) { $failures.Add("Duplicate reference $($c.ref)") }
        $components[$c.ref] = $c
    }
    foreach ($n in $Document.export.nets.net) {
        foreach ($p in $n.node) {
            $key = "$($p.ref).$($p.pin)"
            if ($pins.ContainsKey($key)) { $failures.Add("Pin on multiple nets: $key") }
            $pins[$key] = [string]$n.name
        }
    }
    function Check([bool]$Condition, [string]$Message) {
        if (-not $Condition) { $failures.Add($Message) }
    }
    function Same([string]$A, [string]$B) {
        return ($pins.ContainsKey($A) -and $pins.ContainsKey($B) -and $pins[$A] -eq $pins[$B])
    }
    function Separate([string]$A, [string]$B) {
        return ($pins.ContainsKey($A) -and $pins.ContainsKey($B) -and $pins[$A] -ne $pins[$B])
    }
    function ResistorBetween([string]$A, [string]$B, [string]$ValuePattern) {
        foreach ($c in $components.Values) {
            if ($c.ref -notmatch '^R[0-9]+$' -or $c.value -notmatch $ValuePattern) { continue }
            if (((Same $A "$($c.ref).1") -and (Same $B "$($c.ref).2")) -or
                ((Same $A "$($c.ref).2") -and (Same $B "$($c.ref).1"))) { return $true }
        }
        return $false
    }

    Check ($components['U3'].value -match 'MCP42100') 'U3 must remain dual 100k MCP42100'
    Check ($components['U2'].value -match 'ESP32-C3-MINI-1') 'ESP32 module missing'
    $inas = @($components.Values | Where-Object value -match '^INA238')
    Check ($inas.Count -eq 2) 'Exactly two INA238 monitors expected'
    Check (@($components.Values | Where-Object value -match 'LM5164|BQ25756|DFR0868').Count -eq 0) 'AUX/BQ/Beetle remains active'
    Check (@($Document.export.nets.net | Where-Object name -match 'AUX_5V|AUX_IN').Count -eq 0) 'Obsolete AUX net remains'
    foreach ($ref in @('U1', 'U10')) {
        Check ($components[$ref].value -match '^INA238') "$ref must be INA238"
        Check (Same "$ref.6" 'U2.3') "$ref supply must be MCU 3V3"
        Check (Same "$ref.7" 'U3.4') "$ref ground mismatch"
        Check (Same "$ref.4" 'U2.12') "$ref SDA missing"
        Check (Same "$ref.5" 'U2.13') "$ref SCL missing"
    }
    Check (Separate 'U1.2' 'U10.2') 'INA A0 addresses must differ'
    Check (Same 'U10.1' 'U3.4') 'Output INA A1 must be GND'
    Check (Same 'U10.2' 'U2.3') 'Output INA A0 must be 3V3 (0x41)'
    Check (Separate 'R1.1' 'R100.1') 'Input/output positive rails shorted'
    Check (Separate 'R100.1' 'R100.4') 'Output shunt force pads bypassed'
    Check (Same 'J40.1' 'R100.4') 'Converter output must enter shunt force pad4'
    Check (Same 'J41.1' 'R100.1') 'Receiver must leave shunt force pad1'
    Check (Same 'U10.8' 'R100.1') 'Output voltage must be receiver-side'
    Check (Same 'J40.2' 'U3.4') 'Converter return missing'
    Check (Same 'J41.2' 'U3.4') 'Receiver return missing'
    Check (ResistorBetween 'R100.3' 'U10.10' '^10([Rr ]|$)') 'Output positive Kelvin filter missing'
    Check (ResistorBetween 'R100.2' 'U10.9' '^10([Rr ]|$)') 'Output negative Kelvin filter missing'
    Check (Separate 'R100.3' 'R100.4') 'Output positive Kelvin tap joined to force net in schematic'
    Check (Separate 'R100.2' 'R100.1') 'Output negative Kelvin tap joined to force net in schematic'
    foreach ($pin in @('11','14')) { Check (Same "U3.$pin" 'U2.3') "MCP pin$pin must be 3V3" }
    Check (Same 'U3.1' 'U2.19') 'SPI CS missing'
    Check (Same 'U3.2' 'U2.20') 'SPI SCK missing'
    Check (Same 'U3.3' 'U2.21') 'SPI MOSI missing'
    if ($InterfaceMode -eq 'Direct') {
        Check (Same 'C42.1' 'U6.4') 'TP4057 requires C42 directly on VCC'
        Check (Same 'C42.1' 'R45.2') 'C42 must be downstream of R45'
        Check (Same 'C42.2' 'U6.2') 'C42 return must be charger ground'
        Check (Same 'U6.2' 'U3.4') 'Charger ground missing'
        Check (Same 'R45.1' 'J27.A4') 'R45 input must remain USB VBUS'
        Check (Separate 'C42.1' 'J27.A4') 'C42 must not bypass R45 onto USB VBUS'
        Check (Same 'U3.12' 'U2.3') 'Direct interface requires SHDN held high'
        Check (ResistorBetween 'U3.1' 'U2.3' '^10[kK]') 'SPI CS pull-up missing'
        foreach ($ref in @('K1','K2','K3','Q22','R19','R87','R88','R89','R90','D23','D24','D25','J42','J43')) {
            Check (-not $components.ContainsKey($ref)) "Rejected selector component remains: $ref"
        }
        Check (@($Document.export.nets.net | Where-Object name -match 'AUTO_N|COIL_SUPPLY|MAN_[ABW]').Count -eq 0) 'Rejected selector net remains'
        Check ($pins['U2.30'] -match '^unconnected-') 'GPIO20 must be explicitly unused'
        $analogPins = @()
        foreach ($channel in @(@{Port='J7'; A='8'; W='9'; B='10'}, @{Port='J9'; A='7'; W='6'; B='5'})) {
            Check (Same "$($channel.Port).1" "U3.$($channel.A)") 'Direct A output missing'
            Check (Same "$($channel.Port).2" "U3.$($channel.W)") 'Direct W output missing'
            Check (Same "$($channel.Port).3" "U3.$($channel.B)") 'Direct B output missing'
            $analogPins += @("$($channel.Port).1", "$($channel.Port).2", "$($channel.Port).3")
        }
        for ($i = 0; $i -lt $analogPins.Count; $i++) {
            Check (Separate $analogPins[$i] 'U3.4') "$($analogPins[$i]) tied to logic GND"
            Check (Separate $analogPins[$i] 'U2.3') "$($analogPins[$i]) tied to logic supply"
            for ($j = $i + 1; $j -lt $analogPins.Count; $j++) {
                Check (Separate $analogPins[$i] $analogPins[$j]) "Direct analog strap: $($analogPins[$i])/$($analogPins[$j])"
            }
        }
    } elseif ($InterfaceMode -eq 'Raw') {
        Check (Same 'U3.12' 'U2.30') 'Raw V1 interface requires GPIO20 to MCP SHDN'
        Check (ResistorBetween 'U3.12' 'U3.4' '^10[kK]') 'Raw V1 shutdown pulldown missing'
        Check (@($components.Values | Where-Object value -eq 'TQ2-3V').Count -eq 0) 'Unapproved selector remains in raw active hierarchy'
        foreach ($channel in @(@{Port='J7'; A='8'; W='9'; B='10'}, @{Port='J9'; A='7'; W='6'; B='5'})) {
            Check (Same "$($channel.Port).1" "U3.$($channel.A)") 'Raw A output missing'
            Check (Same "$($channel.Port).2" "U3.$($channel.W)") 'Raw W output missing'
            Check (Same "$($channel.Port).3" "U3.$($channel.B)") 'Raw B output missing'
            Check (Separate "$($channel.Port).1" "$($channel.Port).2") 'Raw A/W shorted'
            Check (Separate "$($channel.Port).2" "$($channel.Port).3") 'Raw W/B shorted'
            Check (Separate "$($channel.Port).1" "$($channel.Port).3") 'Raw A/B shorted'
        }
    } elseif ($InterfaceMode -eq 'ThreeWire') {
        Check (Same 'U3.12' 'U2.3') 'Three-wire selector requires SHDN high independently'
        Check (ResistorBetween 'U3.1' 'U2.3' '^10[kK]') 'SPI CS pull-up missing'
        Check (ResistorBetween 'U2.30' 'Q22.1' '^100([Rr ]|$)') 'GPIO20 selector gate resistor missing'
        Check (ResistorBetween 'Q22.1' 'Q22.2' '^10[kK]') 'Selector default-off pull-up missing'
        Check (Same 'Q22.2' 'U2.3') 'Selector PMOS source must be 3V3'
        Check (Separate 'Q22.3' 'U2.3') 'Coil supply bypasses PMOS'
        Check ($components['Q22'].value -match 'AO3401A') 'Selector PMOS mismatch'
        Check (@($components.Values | Where-Object value -eq 'TQ2-3V').Count -eq 3) 'Exactly three nonlatching relays required'
        $poles = @(
            @{Relay='K1'; Com='3'; Nc='2'; No='4'; Output='J7.1'; Manual='J42.1'; Digital='U3.8'},
            @{Relay='K1'; Com='8'; Nc='9'; No='7'; Output='J7.2'; Manual='J42.2'; Digital='U3.9'},
            @{Relay='K2'; Com='3'; Nc='2'; No='4'; Output='J9.1'; Manual='J43.1'; Digital='U3.7'},
            @{Relay='K2'; Com='8'; Nc='9'; No='7'; Output='J9.2'; Manual='J43.2'; Digital='U3.6'},
            @{Relay='K3'; Com='3'; Nc='2'; No='4'; Output='J7.3'; Manual='J42.3'; Digital='U3.10'},
            @{Relay='K3'; Com='8'; Nc='9'; No='7'; Output='J9.3'; Manual='J43.3'; Digital='U3.5'}
        )
        $analogPins = @()
        foreach ($p in $poles) {
            Check (Same "$($p.Relay).$($p.Com)" $p.Output) "$($p.Output) converter COM mismatch"
            Check (Same "$($p.Relay).$($p.Nc)" $p.Manual) "$($p.Manual) manual NC mismatch"
            Check (Same "$($p.Relay).$($p.No)" $p.Digital) "$($p.Digital) digital NO mismatch"
            $analogPins += @($p.Output, $p.Manual, $p.Digital)
        }
        # Eighteen separate nets prevent straps, bypasses and cross-channel coupling.
        for ($i = 0; $i -lt $analogPins.Count; $i++) {
            Check (Separate $analogPins[$i] 'U3.4') "$($analogPins[$i]) tied to logic GND"
            Check (Separate $analogPins[$i] 'U2.3') "$($analogPins[$i]) tied to logic supply"
            for ($j = $i + 1; $j -lt $analogPins.Count; $j++) {
                Check (Separate $analogPins[$i] $analogPins[$j]) "Analog strap/bypass: $($analogPins[$i])/$($analogPins[$j])"
            }
        }
        foreach ($k in @('K1','K2','K3')) {
            Check ($components[$k].value -eq 'TQ2-3V') "$k must be nonlatching TQ2-3V"
            Check (Same "$k.10" 'U3.4') "$k coil return missing"
            Check (ResistorBetween 'Q22.3' "$k.1" '^6[.]8') "$k coil resistor missing"
            $diodes = @($components.Values | Where-Object {
                $_.value -match 'BAT54' -and (Same "$($_.ref).1" 'U3.4') -and (Same "$($_.ref).3" "$k.1")
            })
            Check ($diodes.Count -eq 1) "$k flyback diode missing or reversed"
        }
    } else {
    Check (Same 'U3.12' 'U2.3') 'Relay study requires SHDN high independently of selector'
    Check (ResistorBetween 'U2.30' 'Q22.1' '^100([Rr ]|$)') 'Single GPIO20 driver path missing'
    Check (ResistorBetween 'Q22.1' 'Q22.2' '^10[kK]') 'PMOS off pull-up missing'
    Check (Same 'Q22.2' 'U2.3') 'PMOS source must be 3V3'
    Check (Separate 'Q22.3' 'U2.3') 'Coil supply bypasses transistor'
    $selectors = @(
        @{Relay='K1'; Port='J7'; Manual='J42'; A='8'; W='9'; B='10'},
        @{Relay='K2'; Port='J9'; Manual='J43'; A='7'; W='6'; B='5'}
    )
    foreach ($s in $selectors) {
        $k = $s.Relay
        Check ($components[$k].value -eq 'TQ2-3V') "$k must be nonlatching TQ2-3V"
        Check (Same "$k.3" "$($s.Port).1") "$k COM1 external terminal mismatch"
        Check (Same "$k.8" "$($s.Port).2") "$k COM2 external terminal mismatch"
        Check (Same "$k.2" "$($s.Manual).1") "$k NC1 manual mismatch"
        Check (Same "$k.9" "$($s.Manual).2") "$k NC2 manual mismatch"
        Check (Same "$k.4" "U3.$($s.W)") "$k NO1 digital wiper mismatch"
        Check (Same "$k.7" "U3.$($s.B)") "$k NO2 digital endpoint mismatch"
        Check (Same "U3.$($s.W)" "U3.$($s.A)") "$k rheostat A/W strap missing"
        foreach ($a in @('3','8')) {
            foreach ($b in @('2','9','4','7')) {
                Check (Separate "$k.$a" "$k.$b") "$k has hardwired contact bypass $a/$b"
            }
            Check (Separate "$k.$a" 'U3.4') "$k external terminal permanently grounded"
        }
        Check (Same "$k.10" 'U3.4') "$k coil return missing"
        Check (ResistorBetween 'Q22.3' "$k.1" '^6[.]8') "$k shared driver coil resistor missing"
        $diodes = @($components.Values | Where-Object {
            $_.value -match 'BAT54' -and (Same "$($_.ref).1" 'U3.4') -and (Same "$($_.ref).3" "$k.1")
        })
        Check ($diodes.Count -eq 1) "$k flyback diode missing or reversed"
    }
    }
    Check (Same 'J27.A6' 'J27.B6') 'USB orientation D+ mismatch'
    Check (Same 'J27.A7' 'J27.B7') 'USB orientation D- mismatch'
    Check (Separate 'J27.A6' 'J27.A7') 'USB data pair short'
    Check (Same 'J27.A6' 'U8.3') 'USB D+ ESD input missing'
    Check (Same 'J27.A7' 'U8.1') 'USB D- ESD input missing'
    Check (ResistorBetween 'U8.4' 'U2.27' '^22([Rr ]|$)') 'USB D+ MCU path missing'
    Check (ResistorBetween 'U8.6' 'U2.26' '^22([Rr ]|$)') 'USB D- MCU path missing'
    Check (Separate 'J27.A4' 'U2.3') 'USB VBUS shorted directly to 3V3'
    return [pscustomobject]@{ Passed=($failures.Count -eq 0); Failures=@($failures.ToArray()); Components=$components.Count; Nets=@($Document.export.nets.net).Count }
}

[xml]$source = Get-Content -LiteralPath $Netlist -Raw
$result = Test-Controller $source
$result | ConvertTo-Json -Depth 5
if (-not $result.Passed) { throw 'Schematic contract failed; see failures above.' }

if ($SelfTest) {
    # Mutate only in-memory exported XML fixtures, never native KiCad files.
    $selectorEndpoint = @('J9','2')
    if ($InterfaceMode -eq 'RheostatStudy') { $selectorEndpoint = @('K2','4') }
    $endpoints = @(@('U3','12'), @('U10','2'), $selectorEndpoint, @('J27','B6'), @('R100','3'))
    if ($InterfaceMode -eq 'Direct') { $endpoints += @(@('J7','1'), @('J7','2'), @('J7','3'), @('J9','1'), @('J9','3'), @('U2','30'), @('C42','1'), @('C42','2'), @('U6','4'), @('R45','2')) }
    if ($InterfaceMode -eq 'ThreeWire') { $endpoints += @(@('K3','7'), @('J42','3'), @('Q22','1')) }
    foreach ($endpoint in $endpoints) {
        [xml]$broken = $source.CloneNode($true)
        $node = $broken.SelectSingleNode("/export/nets/net/node[@ref='$($endpoint[0])' and @pin='$($endpoint[1])']")
        if (-not $node) { throw 'Negative fixture endpoint missing.' }
        [void]$node.ParentNode.RemoveChild($node)
        if ((Test-Controller $broken).Passed) { throw "Negative fixture escaped: $($endpoint -join '.')" }
    }
    if ($InterfaceMode -in @('Direct','ThreeWire')) {
        [xml]$broken = $source.CloneNode($true)
        $a = $broken.SelectSingleNode("/export/nets/net[node[@ref='U3' and @pin='8']]")
        $w = $broken.SelectSingleNode("/export/nets/net[node[@ref='U3' and @pin='9']]")
        foreach ($node in @($w.SelectNodes('node'))) { [void]$a.AppendChild($node) }
        [void]$w.ParentNode.RemoveChild($w)
        if ((Test-Controller $broken).Passed) { throw 'A/W strap fixture escaped.' }
        Write-Output "PASS: $($endpoints.Count) broken-connectivity fixtures and one A/W-short fixture rejected."
    } else {
        Write-Output "PASS: $($endpoints.Count) broken-connectivity fixtures rejected."
    }
    if ($InterfaceMode -eq 'Direct') {
        [xml]$broken = $source.CloneNode($true)
        $cap = $broken.SelectSingleNode("/export/nets/net/node[@ref='C42' and @pin='1']")
        $vbus = $broken.SelectSingleNode("/export/nets/net[node[@ref='J27' and @pin='A4']]")
        [void]$vbus.AppendChild($cap)
        if ((Test-Controller $broken).Passed) { throw 'Upstream C42 fixture escaped.' }
        Write-Output 'PASS: upstream C42 regression fixture rejected.'
    }
}
