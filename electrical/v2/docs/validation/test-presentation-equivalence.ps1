param(
    [Parameter(Mandatory = $true)][string]$Before,
    [Parameter(Mandatory = $true)][string]$After
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Read-Netlist([string]$path) {
    if ([IO.Path]::GetExtension($path) -ne '.xml') { throw 'Use KiCad XML exports only.' }
    $settings = [Xml.XmlReaderSettings]::new()
    $settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
    $reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $path).Path, $settings)
    try {
        $document = [Xml.XmlDocument]::new()
        $document.Load($reader)
    } finally { $reader.Dispose() }
    if (!$document.SelectSingleNode('/export/components/comp') -or
        !$document.SelectSingleNode('/export/nets/net')) { throw "Incomplete export: $path" }
    return ,$document
}

function Record-Map($nodes, [scriptblock]$key, [scriptblock]$value) {
    $map = [Collections.Generic.Dictionary[string,string]]::new([StringComparer]::Ordinal)
    foreach ($node in $nodes) {
        $id = & $key $node
        if ($map.ContainsKey($id)) { throw "Duplicate record: $id" }
        $map.Add($id, (& $value $node))
    }
    return ,$map
}

function Assert-Same([string]$kind, $left, $right) {
    foreach ($key in $left.Keys) {
        if (!$right.ContainsKey($key)) { throw "$kind removed: $key" }
        if ($left[$key] -cne $right[$key]) { throw "$kind changed: $key" }
    }
    foreach ($key in $right.Keys) {
        if (!$left.ContainsKey($key)) { throw "$kind added: $key" }
    }
    Write-Output "PASS: $($left.Count) $kind records unchanged."
}

$a = Read-Netlist $Before
$b = Read-Netlist $After

# Compare complete component metadata, ignoring only the order of child records.
$components = { param($node) (@($node.ChildNodes | ForEach-Object { $_.OuterXml } | Sort-Object) -join "`n") }
$byReference = { param($node) $node.GetAttribute('ref') }
Assert-Same 'component' (Record-Map $a.SelectNodes('/export/components/comp') $byReference $components) `
    (Record-Map $b.SelectNodes('/export/components/comp') $byReference $components)

# Net codes are generated sequence numbers; names and actual pin membership matter.
$byName = { param($node) $node.GetAttribute('name') }
$endpoints = { param($node) (@($node.SelectNodes('node') | ForEach-Object { $_.OuterXml } | Sort-Object) -join "`n") }
Assert-Same 'net' (Record-Map $a.SelectNodes('/export/nets/net') $byName $endpoints) `
    (Record-Map $b.SelectNodes('/export/nets/net') $byName $endpoints)

$sheetIdentity = { param($node) $node.GetAttribute('tstamps') + '|' + $node.SelectSingleNode('title_block/source').InnerText }
Assert-Same 'sheet' (Record-Map $a.SelectNodes('/export/design/sheet') $byName $sheetIdentity) `
    (Record-Map $b.SelectNodes('/export/design/sheet') $byName $sheetIdentity)

$partId = { param($node) $node.GetAttribute('lib') + ':' + $node.GetAttribute('part') }
$partData = { param($node) $node.OuterXml }
Assert-Same 'library part' (Record-Map $a.SelectNodes('/export/libparts/libpart') $partId $partData) `
    (Record-Map $b.SelectNodes('/export/libparts/libpart') $partId $partData)

Write-Output 'PASS: presentation-only XML equivalence. Visual inspection and ERC remain separate checks.'
