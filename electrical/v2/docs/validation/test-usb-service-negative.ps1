param([Parameter(Mandatory=$true)][string]$Netlist)
$ErrorActionPreference = 'Stop'
$audit = Join-Path $PSScriptRoot 'test-usb-service-netlist.ps1'
& $audit -Netlist $Netlist
$fixtures = @(
    @{name='wrong USB series value'; xpath="/export/components/comp[@ref='R32']/value"; text='220R'},
    @{name='wrong ESD pin map'; xpath="/export/components/comp[@ref='U8']/fields/field[@name='MPN']"; text='different-part'},
    @{name='missing MCU D+'; xpath="/export/nets/net/node[@ref='U2' and @pin='27']"; remove=$true},
    @{name='missing USB reversed-plug D-'; xpath="/export/nets/net/node[@ref='J27' and @pin='B7']"; remove=$true},
    @{name='missing boot recovery'; xpath="/export/nets/net/node[@ref='J23' and @pin='2']"; remove=$true}
)
foreach ($fixture in $fixtures) {
    $settings = [Xml.XmlReaderSettings]::new()
    $settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
    $reader = [Xml.XmlReader]::Create((Resolve-Path -LiteralPath $Netlist).Path, $settings)
    try { $x = [Xml.XmlDocument]::new(); $x.Load($reader) } finally { $reader.Dispose() }
    $node = $x.SelectSingleNode($fixture.xpath)
    if ($null -eq $node) { throw "Invalid fixture: $($fixture.name)" }
    if ($fixture.remove) { [void]$node.ParentNode.RemoveChild($node) }
    else { $node.InnerText = $fixture.text }
    $temp = [IO.Path]::GetTempFileName()
    try {
        $x.Save($temp)
        $rejected = $false
        try { & $audit -Netlist $temp | Out-Null } catch { $rejected = $true }
        if (!$rejected) { throw "Fixture not detected: $($fixture.name)" }
        Write-Output "REJECTED: $($fixture.name)"
    } finally { Remove-Item -LiteralPath $temp }
}
Write-Output 'PASS: baseline accepted; five deliberately broken XML fixtures rejected. No native KiCad edits.'
