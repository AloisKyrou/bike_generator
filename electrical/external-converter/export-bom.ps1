param(
    [Parameter(Mandatory = $true)][string]$Netlist,
    [string]$Output
)

$ErrorActionPreference = 'Stop'
if (-not $Output) { $Output = Join-Path $PSScriptRoot 'bom/controller-external-working.csv' }
[xml]$document = Get-Content -LiteralPath $Netlist -Raw
$rows = foreach ($component in $document.export.components.comp) {
    $fields = @{}
    foreach ($field in $component.fields.field) { $fields[$field.name] = $field.InnerText }
    [pscustomobject]@{
        Reference = $component.ref
        Value = $component.value
        MPN = $fields['MPN']
        Manufacturer = $fields['Manufacturer']
        Datasheet = $fields['Datasheet']
        DesignStatus = $fields['Design_Status']
        Footprint = $component.footprint
        Sheet = $component.sheetpath.names
        Quantity = 1
        Status = 'SCHEMATIC_CHECKPOINT_NOT_RELEASED'
    }
}
$parent = Split-Path $Output
if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent | Out-Null }
$rows | Sort-Object Reference | Export-Csv -LiteralPath $Output -NoTypeInformation -Encoding UTF8
Write-Output "Exported $($rows.Count) schematic entries to $Output. Not a purchasing or assembly release."
