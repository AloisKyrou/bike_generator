param(
    [ValidateRange(1, 100)][int]$Boards = 2,
    [string]$OutputDirectory = (Join-Path $PSScriptRoot "shopping-${Boards}boards-2026-10-15")
)
$ErrorActionPreference = 'Stop'
$source = Import-Csv (Join-Path $PSScriptRoot 'supplier-plan-2026-10-15.csv')
if ($source.Count -ne 35 -or ($source | Group-Object MPN | Where-Object Count -ne 1)) {
    throw 'Expected 35 unique selected manufacturer part numbers'
}
$rows = foreach ($part in $source) {
    if ($part.Supplier -notin @('DigiKey', 'LCSC')) { throw 'Unmapped supplier' }
    $fitted = [int]$part.Qty_per_board * $Boards
    $multiple = [int]$part.Order_multiple
    $minimum = [int]$part.Minimum_order
    if ($multiple -lt 1 -or $minimum -lt 1 -or $fitted -lt 1) { throw 'Invalid quantity' }
    $quantity = [int]([Math]::Ceiling([Math]::Max($minimum, $fitted) / $multiple) * $multiple)
    [pscustomobject]@{
        ManufacturerPartNumber = $part.MPN
        Manufacturer = $part.Manufacturer
        Quantity = $quantity
        FittedQuantity = $fitted
        SpareQuantity = $quantity - $fitted
        ReferencesPerBoard = $part.References
        Supplier = $part.Supplier
        URL = $part.URL
        Status = $part.Status
    }
}
if (($rows | Measure-Object FittedQuantity -Sum).Sum -ne 74 * $Boards) {
    throw 'Population does not reconcile to 74 purchased components per board'
}
$null = New-Item -ItemType Directory -Force $OutputDirectory
$rows | Export-Csv (Join-Path $OutputDirectory 'quantities.csv') -NoTypeInformation -Encoding UTF8
foreach ($supplier in @('DigiKey', 'LCSC')) {
    $rows | Where-Object Supplier -eq $supplier |
        Select-Object ManufacturerPartNumber, Manufacturer, Quantity, ReferencesPerBoard |
        Export-Csv (Join-Path $OutputDirectory "$supplier-import-draft.csv") -NoTypeInformation -Encoding UTF8
}
$rows | Group-Object Supplier | ForEach-Object {
    [pscustomobject]@{
        Supplier = $_.Name
        References = $_.Count
        Fitted = ($_.Group | Measure-Object FittedQuantity -Sum).Sum
        Purchased = ($_.Group | Measure-Object Quantity -Sum).Sum
        Spares = ($_.Group | Measure-Object SpareQuantity -Sum).Sum
    }
} | Format-Table
'Drafts only: map columns in vendor import; verify exact manufacturer, packaging, stock and delivered total before accepting a basket.'
