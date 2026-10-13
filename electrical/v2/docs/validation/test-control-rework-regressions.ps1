param([Parameter(Mandatory=$true)][string]$Netlist,[Parameter(Mandatory=$true)][string]$Before)
$ErrorActionPreference='Stop'; Set-StrictMode -Version Latest
$check=Join-Path $PSScriptRoot 'test-control-rework-netlist.ps1'
& $check -Netlist $Netlist -Before $Before
$settings=[Xml.XmlReaderSettings]::new();$settings.DtdProcessing=[Xml.DtdProcessing]::Prohibit
$r=[Xml.XmlReader]::Create((Resolve-Path -LiteralPath $Netlist).Path,$settings)
try{$source=[Xml.XmlDocument]::new();$source.Load($r)}finally{$r.Dispose()}
$repo=(Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
$scratch=Join-Path $repo ('.konnect-scratch/control-tests-'+[Guid]::NewGuid().ToString('N'))
$null=New-Item -ItemType Directory -Path $scratch; $script:count=0
function Reject([string]$name,[scriptblock]$edit,[string]$expected){
    $x=$source.CloneNode($true); &$edit $x; $file=Join-Path $scratch "$name.xml"; $x.Save($file);$msg=''
    try{&$check -Netlist $file -Before $Before}catch{$msg=$_.Exception.Message}
    if(!$msg -or $msg -notmatch $expected){throw "Fixture $name did not fail as expected: $msg"}
    $script:count++;Write-Output "Rejected $name : $msg"
}
function Move-Pin($x,[string]$ref,[string]$pin,[string]$destRef,[string]$destPin){
    $n=$x.SelectSingleNode("/export/nets/net/node[@ref='$ref' and @pin='$pin']")
    $to=$x.SelectSingleNode("/export/nets/net[node[@ref='$destRef' and @pin='$destPin']]");$null=$to.AppendChild($n)
}
Reject 'gpio-channel-swapped' {param($x) Move-Pin $x 'J5' '1' 'J5' '3'} 'Disconnected'
Reject 'gpio-ground-missing' {param($x) Move-Pin $x 'J5' '4' 'J5' '3'} 'Disconnected'
Reject 'boot-pulldown' {param($x) Move-Pin $x 'R37' '1' 'U2' '1'} 'Disconnected'
Reject 'led-reversed' {param($x) Move-Pin $x 'D22' '2' 'D22' '1'} 'Disconnected'
Reject 'remote-led-bypasses-series' {param($x) Move-Pin $x 'J28' '1' 'R35' '1'} 'Disconnected'
Reject 'wrong-boot-resistor' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='R36']/value").InnerText='0R'} 'Wrong boot pull-up'
Reject 'unreviewed-led-model' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='D22']/footprint").InnerText='LED_THT:Wrong'} 'Wrong status LED footprint'
Reject 'shdn-detached' {param($x) Move-Pin $x 'U2' '30' 'U2' '31'} 'Disconnected'
Reject 'usb-resistor-changed' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='R32']/value").InnerText='0R'} 'Untouched component changed'
Reject 'usb-data-short' {param($x) Move-Pin $x 'U2' '27' 'U2' '26'} 'Untouched connectivity partition changed'
Reject 'unexpected-component' {param($x) $p=$x.SelectSingleNode('/export/components/comp').CloneNode($true);$p.SetAttribute('ref','UNREVIEWED');$null=$x.SelectSingleNode('/export/components').AppendChild($p)} 'Unexpected inventory change'
Write-Output "PASS: $script:count targeted control regressions rejected. XML fixtures only: $scratch"
