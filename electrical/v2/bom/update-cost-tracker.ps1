param(
    [Parameter(Mandatory = $true)][string]$Netlist,
    [string]$OutputDirectory,
    [string]$Pricebook,
    [string]$Budget
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (!$OutputDirectory) { $OutputDirectory = $PSScriptRoot }
if (!$Pricebook) { $Pricebook = Join-Path $PSScriptRoot 'pricebook.csv' }
if (!$Budget) { $Budget = Join-Path $PSScriptRoot 'project-budget.csv' }
$culture = [Globalization.CultureInfo]::InvariantCulture
function Number([string]$value) { [decimal]::Parse($value, $culture) }
function Amount($value) { ([decimal]$value).ToString('0.00', $culture) }
function Csv-Rows($items) {
    foreach ($item in $items) {
        $copy = $item | Select-Object *
        foreach ($property in $copy.PSObject.Properties) {
            if ($property.Value -is [decimal]) { $property.Value = $property.Value.ToString($culture) }
        }
        $copy
    }
}
function Field($component, [string]$name) {
    $node = $component.SelectSingleNode("fields/field[@name='$name']")
    if ($node) { $node.InnerText } else { '' }
}
function Block($component) {
    $ref = $component.GetAttribute('ref')
    if ($ref -in @('D2', 'J8')) { return 'RECTIFIER' }
    if ($ref -eq 'F2') { return 'AUX' }
    if ($ref -eq 'R1' -and $component.sheetpath.names -notmatch 'MAIN_CONVERTER') { return 'SENSE' }
    switch -Regex ($component.sheetpath.names) {
        'POWER_PATH' { return 'INPUT_PROTECTION' }
        'INA228_SENSE' { return 'SENSE' }
        'AUX_SUPPLY' { return 'AUX' }
        'MCU_MODULE' { return 'MCU' }
        'CC_CONTROL|CONNECTORS' { return 'CONTROLS' }
        'LV_POWER_USB|LOGIC_POWER|USB_INTERFACE' { return 'LV' }
        'MAIN_CONVERTER' { return 'MAIN' }
        'OUTPUT_PROTECTION' { return 'OUTPUT_PROTECTION' }
        default { throw "Unmapped sheet $($component.sheetpath.names) for $ref" }
    }
}
$netlistPath = (Resolve-Path -LiteralPath $Netlist).Path
if ([IO.Path]::GetExtension($netlistPath) -ne '.xml') { throw 'Supply a KiCad XML export, not a KiCad source.' }
# Parse only an exported netlist. This script never opens or edits KiCad sources.
$settings = [Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
$reader = [Xml.XmlReader]::Create($netlistPath, $settings)
try { $document = [Xml.XmlDocument]::new(); $document.Load($reader) } finally { $reader.Dispose() }
$prices = @(Import-Csv -LiteralPath $Pricebook)
$budgets = @(Import-Csv -LiteralPath $Budget)
foreach ($entry in @($prices) + @($budgets)) {
    foreach ($quantity in @('1','10')) {
        $low = Number $entry."Low_$quantity"
        $high = Number $entry."High_$quantity"
        if ($low -lt 0 -or $high -lt $low) { throw 'Invalid negative or reversed cost interval.' }
    }
}
if (@($budgets | Group-Object Block | Where-Object Count -gt 1).Count) { throw 'Duplicate block budget.' }
$seen = @{}
$rows = @(foreach ($component in $document.SelectNodes('/export/components/comp')) {
    $ref = $component.GetAttribute('ref')
    if ($seen.ContainsKey($ref)) { throw "Duplicate reference: $ref" }
    $seen[$ref] = $true
    $mpn = Field $component 'MPN'
    $manufacturer = Field $component 'Manufacturer'
    $footprintNode = $component.SelectSingleNode('footprint')
    $footprint = if ($footprintNode) { $footprintNode.InnerText } else { '' }
    $matches = @($prices | Where-Object {
        $maker = $_.PSObject.Properties['Manufacturer']
        $_.Match -eq 'MPN' -and $_.Key -eq $mpn -and $mpn -and
            (!$maker -or !$maker.Value -or $maker.Value -eq $manufacturer)
    })
    if ($matches.Count -gt 1) { throw "Duplicate MPN price: $mpn" }
    if (!$matches.Count) {
        $voltage = [regex]::Match([string]$component.value, '(?i)\b(\d+(?:\.\d+)?)\s*V\b')
        $lvCap = $voltage.Success -and (Number $voltage.Groups[1].Value) -le 25
        $matches = @($prices | Where-Object {
            ($_.Match -eq 'Reference' -and $ref -match $_.Key) -or
            ($_.Match -eq 'Footprint' -and $footprint -match $_.Key) -or
            ($_.Match -eq 'TransistorFootprint' -and $ref -match '^Q\d+$' -and $footprint -match $_.Key) -or
            ($_.Match -eq 'LVCapacitorFootprint' -and $lvCap -and $footprint -match $_.Key)
        } | Select-Object -First 1)
    }
    $price = if ($matches.Count) { $matches[0] } else { $null }
    $excluded = @($component.SelectNodes("property[@name='dnp' or @name='exclude_from_bom']")).Count -gt 0
    $row = [ordered]@{
        Reference = $ref; Block = Block $component; Value = [string]$component.value
        MPN = $mpn; Manufacturer = $manufacturer; Footprint = $footprint; Sheet = [string]$component.sheetpath.names
        Quantity = 1; Fitted = !$excluded; Status = 'DRAWN_UNQUALIFIED'
        Low_1 = ''; High_1 = ''; Low_10 = ''; High_10 = ''
        Basis = 'UNPRICED'; Evidence_date = ''; Source = ''; Notes = 'Price required; never treated as zero'
    }
    if ($price) {
        foreach ($key in @('Low_1','High_1','Low_10','High_10')) { $row[$key] = Number $price.$key }
        foreach ($key in @('Basis','Evidence_date','Source','Notes')) { $row[$key] = $price.$key }
    }
    [pscustomobject]$row
})
if (!$rows.Count) { throw 'No components found in exported XML.' }
$summary = @(foreach ($budgetRow in $budgets) {
    $parts = @($rows | Where-Object { $_.Block -eq $budgetRow.Block -and $_.Fitted })
    $priced = @($parts | Where-Object { $_.Basis -ne 'UNPRICED' })
    $entry = [ordered]@{ Block=$budgetRow.Block; Category=$budgetRow.Category; Label=$budgetRow.Label
        Drawn_fitted=$parts.Count; Unpriced=@($parts | Where-Object {$_.Basis -eq 'UNPRICED'}).Count
        Scope=$budgetRow.Scope; Basis=$budgetRow.Basis }
    foreach ($key in @('Low_1','High_1','Low_10','High_10')) {
        $sum = [decimal]0
        foreach ($part in $priced) { $sum += $part.$key }
        $planned = Number $budgetRow.$key
        $entry["Drawn_$key"] = $sum
        # Block allowance is a complete-block budget, not an additive missing-parts line.
        $entry["Projected_$key"] = [Math]::Max($planned, $sum)
        $entry["Reserve_$key"] = [Math]::Max([decimal]0, $planned - $sum)
    }
    [pscustomobject]$entry
})
foreach ($row in $rows) {
    if ($row.Block -notin $budgets.Block) { throw "Missing block budget for $($row.Reference)" }
}
$null = New-Item -ItemType Directory -Path $OutputDirectory -Force
Csv-Rows ($rows | Sort-Object Block,Reference) | Export-Csv (Join-Path $OutputDirectory 'controller-v2-overall-bom.csv') -NoTypeInformation -Encoding UTF8
Csv-Rows $summary | Export-Csv (Join-Path $OutputDirectory 'controller-v2-cost-blocks.csv') -NoTypeInformation -Encoding UTF8
$lines = [Collections.Generic.List[string]]::new()
$lines.Add('# V2 overall cost dashboard')
$lines.Add('')
$lines.Add('Generated from a saved schematic XML export; NOT a purchasing or fabrication release.')
$lines.Add('EUR per board, excluding VAT and delivery. Column 10 means per board in a ten-board batch.')
$lines.Add('')
$lines.Add("Export: $([IO.Path]::GetFileName($netlistPath)); SHA-256: $((Get-FileHash -LiteralPath $netlistPath -Algorithm SHA256).Hash)")
$lines.Add("Components exported: $($rows.Count). Fitted entries without price: $(@($rows | Where-Object {$_.Fitted -and $_.Basis -eq 'UNPRICED'}).Count).")
$lines.Add('')
$lines.Add('| Block | Drawn parts, 1 board | Complete-block budget, 1 board | Complete-block budget, 10 boards |')
$lines.Add('|---|---:|---:|---:|')
foreach ($row in $summary) {
    $lines.Add("| $($row.Label) | $(Amount $row.Drawn_Low_1)-$(Amount $row.Drawn_High_1) | $(Amount $row.Projected_Low_1)-$(Amount $row.Projected_High_1) | $(Amount $row.Projected_Low_10)-$(Amount $row.Projected_High_10) |")
}
$lines.Add('')
foreach ($category in @('board_components','offboard_hardware','manufacturing','ALL')) {
    $subset = @($summary | Where-Object { $category -eq 'ALL' -or $_.Category -eq $category })
    $totals = @{}
    foreach ($key in @('Low_1','High_1','Low_10','High_10')) {
        $totals[$key] = ($subset | Measure-Object -Property "Projected_$key" -Sum).Sum
    }
    $lines.Add("$category : 1 board $(Amount $totals.Low_1)-$(Amount $totals.High_1); 10-board batch per board $(Amount $totals.Low_10)-$(Amount $totals.High_10) EUR.")
}
$lines.Add('')
$lines.Add('Active architecture: USB-only external logic power, with an optional USB-charged protected 1S cell. No generator AUX 5 V branch or USB/AUX mux. The CELL allowance is included in full totals; subtract only that row for the no-cell variant, not the common charger/regulator circuitry.')
$lines.Add('')
$lines.Add('Do not add drawn costs to complete-block budgets: they overlap. Projected values are the larger of the complete-block allowance and drawn priced subtotal. Unpriced components are reported, not valued at zero; a block budget is not proof that its missing parts fit.')
$lines.Add('')
$lines.Add('Scope: 70 V-class AC-capable integrated converter, one receiver, no internal dump. External-converter support has been removed. A qualified DC-only assembly may omit RECTIFIER parts while retaining required input fusing and protection.')
$lines.Add('')
$lines.Add('Unknowns: high-voltage USB fault containment, independent output protection, CV selection accuracy, magnetics and thermal qualification can increase this estimate. Prices are observations/allowances, not reserved inventory. Read README.md and project-budget.csv for assumptions.')
$lines.Add('')
$lines.Add('Excluded: bicycle, donor generator, trainer mechanics/guards, main receiver battery, special OEM chargers/adapters, development labor, failed prototypes, compliance/certification, warranty, shipping, VAT and commercial margin. No selling price is inferred.')
$lines | Set-Content (Join-Path $OutputDirectory 'COST_DASHBOARD.md') -Encoding UTF8
Write-Output "Updated $($rows.Count) component rows and $($summary.Count) block budgets in $OutputDirectory"
