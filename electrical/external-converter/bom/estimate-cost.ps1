param([string]$Output)
$ErrorActionPreference = 'Stop'
if (-not $Output) { $Output = Join-Path $PSScriptRoot 'cost-lines.csv' }
$bom = @(Import-Csv (Join-Path $PSScriptRoot 'controller-external-working.csv'))
$book = @(Import-Csv (Join-Path $PSScriptRoot '../../v2/bom/pricebook.csv'))
$culture = [Globalization.CultureInfo]::InvariantCulture
function Number([string]$s) { return [double]::Parse($s, $culture) }
$rows = foreach ($part in $bom) {
    $low=$null; $high=$null; $source=''; $date='2026-10-14'; $basis='engineering_allowance_EUR_NOT_quote'
    $match=@($book | Where-Object { $_.Match -eq 'MPN' -and $_.Key -eq $part.MPN -and $part.MPN })
    if ($part.MPN -eq 'INA238AIDGSR') {
        $low=2.86; $high=9.0
        $source='https://www.lcsc.com/product-detail/C2868250.html'
        $basis='low_out_of_stock_EUR_observation_high_budget_allowance; LCSC_USD8.4027_not_converted'
    } elseif ($part.MPN -eq 'TYPE-C-31-M-12') {
        $low=0.20; $high=0.50
        $source='https://www.lcsc.com/product-detail/C165948.html'
        $basis='EUR_budget_allowance_NOT_conversion; USD0.1879_at_MOQ5'
    } elseif ($part.MPN -eq 'S2B-PH-K-S(LF)(SN)') {
        $low=0.20; $high=0.80
    } elseif ($match.Count -eq 1) {
        $low=Number $match[0].Low_1; $high=Number $match[0].High_1
        $source=$match[0].Source; $date=$match[0].Evidence_date; $basis=$match[0].Basis
    } elseif ($match.Count -gt 1) { throw "Ambiguous price for $($part.MPN)" }
    elseif ($part.Footprint -match '^TestPoint:|^Jumper:SolderJumper') {
        $low=0; $high=0; $basis='PCB_feature_no_purchased_component'
    } elseif ($part.Footprint -match '^Resistor_SMD:R_0805') { $low=0.03; $high=0.20 }
    elseif ($part.Footprint -match '^Capacitor_SMD:C_0805') { $low=0.08; $high=0.50 }
    elseif ($part.Footprint -match '^Connector_PinHeader_') { $low=0.10; $high=1.0 }
    else { throw "Unpriced component $($part.Reference) / $($part.MPN); do not silently count as zero" }
    if ($null -eq $low -or $high -lt $low) { throw 'Invalid price range' }
    [pscustomobject]@{
        Reference=$part.Reference; MPN=$part.MPN; Value=$part.Value; Quantity=$part.Quantity
        Low_EUR=([int]$part.Quantity*$low).ToString('F2',$culture)
        High_EUR=([int]$part.Quantity*$high).ToString('F2',$culture)
        Basis=$basis; EvidenceDate=$date; Source=$source
    }
}
$rows | Export-Csv -LiteralPath $Output -NoTypeInformation -Encoding UTF8
$lowTotal=0.0; $highTotal=0.0
foreach ($r in $rows) { $lowTotal+=Number $r.Low_EUR; $highTotal+=Number $r.High_EUR }
[pscustomobject]@{
    Entries=$rows.Count; LowEUR=$lowTotal.ToString('F2',$culture); HighEUR=$highTotal.ToString('F2',$culture)
    MissingMPN=@($bom|Where-Object {-not $_.MPN -and $_.Footprint -notmatch '^TestPoint:|^Jumper:SolderJumper'}).Count
    Status='BUDGET_ONLY; excludes PCB, tax, freight, MOQ surplus, cables, cell, cooling, external converter'
} | ConvertTo-Json
