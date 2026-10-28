param([Parameter(Mandatory=$true)][string]$Netlist, [switch]$ThtBulk, [switch]$AoyFets)
$ErrorActionPreference = 'Stop'
$audit = Join-Path $PSScriptRoot '../power-stage/review-power-endpoints.ps1'
# A failing baseline must never make every deliberately broken fixture look valid.
& $audit -Netlist $Netlist -Voltage70 -ThtBulk:$ThtBulk -AoyFets:$AoyFets
function Move-Pin($x, $ref, $pin, $targetRef, $targetPin) {
    $node = $x.SelectSingleNode("//net/node[@ref='$ref' and @pin='$pin']")
    $target = $x.SelectSingleNode("//net/node[@ref='$targetRef' and @pin='$targetPin']").ParentNode
    [void]$node.ParentNode.RemoveChild($node)
    [void]$target.AppendChild($node)
}
$fixtures = @(
    @{name='old MOSFET'; change={param($x) $x.SelectSingleNode("//comp[@ref='Q10']/fields/field[@name='MPN']").InnerText='SIR680ADP-T1-RE3'}},
    @{name='old bulk voltage'; change={param($x) $x.SelectSingleNode("//comp[@ref='C88']/fields/field[@name='MPN']").InnerText='B40950A0566M000'}},
    @{name='wrong cap polarity'; change={param($x) $x.SelectSingleNode("//net/node[@ref='C87' and @pin='1']").SetAttribute('pin','2')}},
    @{name='missing local cap'; change={param($x) $n=$x.SelectSingleNode("//comp[@ref='C88']"); [void]$n.ParentNode.RemoveChild($n)}},
    @{name='old OV resistor'; change={param($x) $x.SelectSingleNode("//comp[@ref='R65']/fields/field[@name='MPN']").InnerText='wrong'}},
    @{name='incorrect F1 variant'; change={param($x) $x.SelectSingleNode("//comp[@ref='F1']/fields/field[@name='MPN']").InnerText='0456040.DR'}},
    @{name='VAC pin33 disconnected from pin32'; change={param($x) Move-Pin $x U9 33 U9 17}},
    @{name='VAC bypass return on positive rail'; change={param($x) Move-Pin $x C63 2 U9 32}},
    @{name='driver supply disconnected'; change={param($x) Move-Pin $x U9 23 U9 17}},
    @{name='bootstrap diode reversed'; change={param($x)
        $a=$x.SelectSingleNode("//net/node[@ref='D10' and @pin='1']")
        $b=$x.SelectSingleNode("//net/node[@ref='D10' and @pin='2']")
        $a.SetAttribute('pin','2'); $b.SetAttribute('pin','1')
    }},
    @{name='bootstrap return grounded'; change={param($x) Move-Pin $x C66 2 U9 17}},
    @{name='input differential filter grounded'; change={param($x) Move-Pin $x C67 2 U9 17}},
    @{name='output common-mode filter underrated'; change={param($x) $x.SelectSingleNode("//comp[@ref='C72']/value").InnerText='100nF 16V'}},
    @{name='current guard bypassed'; change={param($x) Move-Pin $x RV1 3 U9 9}},
    @{name='CE incorrectly pulled high'; change={param($x) Move-Pin $x R71 2 U2 3}},
    @{name='NC pin grounded'; change={param($x) Move-Pin $x U9 15 U9 17}},
    @{name='exposed ground pad disconnected'; change={param($x) Move-Pin $x U9 37 U9 32}}
)
$passed=0
foreach ($fixture in $fixtures) {
    [xml]$x=Get-Content -LiteralPath $Netlist -Raw
    & $fixture.change $x
    $temp=Join-Path ([IO.Path]::GetTempPath()) ('bike-voltage70-audit-'+[guid]::NewGuid()+'.xml')
    try {
        $x.Save($temp)
        $rejected=$false
        try { & $audit -Netlist $temp -Voltage70 -ThtBulk:$ThtBulk -AoyFets:$AoyFets | Out-Null } catch { $rejected=$true }
        if (-not $rejected) { throw "Fixture was not rejected: $($fixture.name)" }
        $passed++
        Write-Output "Rejected: $($fixture.name)"
    } finally {
        Remove-Item -LiteralPath $temp
    }
}
Write-Output "PASS: $passed deliberately broken XML fixtures rejected. No native files touched."
