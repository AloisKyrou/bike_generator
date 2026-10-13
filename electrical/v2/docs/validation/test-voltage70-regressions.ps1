param([Parameter(Mandatory=$true)][string]$Before,[Parameter(Mandatory=$true)][string]$After)
$ErrorActionPreference='Stop'
$check=Join-Path $PSScriptRoot 'test-voltage70-netlist.ps1'
$null=& $check -Before $Before -After $After
$source=[Xml.XmlDocument]::new();$source.Load((Resolve-Path -LiteralPath $After).Path)
$repo=(Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
$scratch=Join-Path $repo ('.konnect-scratch/voltage70-negative-'+[Guid]::NewGuid().ToString('N'))
$null=New-Item -ItemType Directory $scratch
$script:count=0
function Reject($name,[scriptblock]$edit,$expected){
    $x=$source.CloneNode($true);& $edit $x;$path=Join-Path $scratch ($name+'.xml');$x.Save($path)
    $message='';try{$null=& $check -Before $Before -After $path}catch{$message=$_.Exception.Message}
    if(!$message -or $message -notmatch $expected){throw "Fixture $name failed incorrectly: $message"}
    $script:count++;Write-Output "Rejected $name : $message"
}
function Move-Pin($x,$r,$p,$r2,$p2){
    $node=$x.SelectSingleNode("/export/nets/net/node[@ref='$r' and @pin='$p']")
    $to=$x.SelectSingleNode("/export/nets/net[node[@ref='$r2' and @pin='$p2']]");$null=$to.AppendChild($node)
}
Reject 'wrong-fet' {param($x)$x.SelectSingleNode("/export/components/comp[@ref='Q10']/fields/field[@name='MPN']").InnerText='SIR680LDP-T1-RE3'} 'MPN Q10'
Reject 'old-cap-bank' {param($x)$x.SelectSingleNode("/export/components/comp[@ref='C73']/value").InnerText='56uF 80V'} 'value C73'
Reject 'wrong-acov-guard' {param($x)$x.SelectSingleNode("/export/components/comp[@ref='R65']/value").InnerText='24.9k 0.1%'} 'value R65'
Reject 'wrong-zener' {param($x)$x.SelectSingleNode("/export/components/comp[@ref='D25']/fields/field[@name='MPN']").InnerText='BZX84C75LT1G'} 'MPN D25'
Reject 'manual-series-bypassed' {param($x)Move-Pin $x R89 1 RV2 1} 'endpoint R89.1'
Reject 'digital-series-bypassed' {param($x)Move-Pin $x R90 1 R84 2} 'endpoint R90.1'
Reject 'drain-clamp-reversed' {param($x)Move-Pin $x D25 3 U3 4} 'endpoint D25.3'
Reject 'clamp-nc-grounded' {param($x)Move-Pin $x D25 2 U3 4} 'D25.2'
Reject 'input-can-upstream' {param($x)Move-Pin $x C87 1 R1 4} 'endpoint C87.1'
Reject 'output-can-far' {param($x)Move-Pin $x C88 1 R75 2} 'endpoint C88.1'
Reject 'usb-rail-short' {param($x)Move-Pin $x J27 A4 U3 14} 'common endpoints'
Reject 'changed-usb-part' {param($x)$x.SelectSingleNode("/export/components/comp[@ref='U8']/value").InnerText='wrong'} 'component change U8'
Write-Output "PASS: $script:count voltage70 XML-only negative fixtures. Evidence: $scratch"
