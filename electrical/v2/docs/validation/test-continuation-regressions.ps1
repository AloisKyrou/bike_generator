param([Parameter(Mandatory=$true)][string]$Before,[Parameter(Mandatory=$true)][string]$After)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
$check=Join-Path $PSScriptRoot 'test-continuation-netlist.ps1'
& $check -Before $Before -After $After -RelayNcChange
$settings=[Xml.XmlReaderSettings]::new();$settings.DtdProcessing=[Xml.DtdProcessing]::Prohibit
$reader=[Xml.XmlReader]::Create((Resolve-Path $After).Path,$settings)
try{$source=[Xml.XmlDocument]::new();$source.Load($reader)}finally{$reader.Dispose()}
$repo=(Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
$scratch=Join-Path $repo ('.konnect-scratch/continuation-faults-'+[Guid]::NewGuid().ToString('N'))
$null=New-Item -ItemType Directory -Path $scratch
$script:count=0
function Reject([string]$name,[scriptblock]$edit,[string]$expected){
    $x=$source.CloneNode($true); & $edit $x
    $file=Join-Path $scratch "$name.xml";$x.Save($file);$message=''
    try{$null=& $check -Before $Before -After $file -RelayNcChange}catch{$message=$_.Exception.Message}
    if(!$message -or $message -notmatch $expected){throw "Fixture $name did not reject expected fault: $message"}
    $script:count++;Write-Output "Rejected $name : $message"
}
function Move-Pin($x,[string]$ref,[string]$pin,[string]$toRef,[string]$toPin){
    $node=$x.SelectSingleNode("/export/nets/net/node[@ref='$ref' and @pin='$pin']")
    $to=$x.SelectSingleNode("/export/nets/net[node[@ref='$toRef' and @pin='$toPin']]")
    $null=$to.AppendChild($node)
}
foreach($ref in @('TP40','TP41','TP42','TP43','TP44','TP45','TP46','TP47')){
    $current=$ref
    Reject "misplaced-$ref" {param($x) Move-Pin $x $current '1' 'U3' '14'} 'Wrong pad endpoint'
}
Reject 'fitted-testpoint-instead-copper' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='TP40']/footprint").InnerText='TestPoint:TestPoint_THTPad_D1.5mm_Drill0.7mm'} 'Wrong/missing bare pad'
Reject 'arbitrary-10k-ntc' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='J33']/value").InnerText='10k NTC'} 'Wrong external NTC'
Reject 'grounded-idle-contact' {param($x) Move-Pin $x 'K1' '9' 'U3' '4'} 'Relay NC9'
Reject 'unrelated-regulator-value' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='R48']/value").InnerText='100k'} 'component changed'
Reject 'unrelated-usb-net' {param($x) Move-Pin $x 'U2' '26' 'U2' '27'} 'net changed'
Reject 'wrong-mlcc-package' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='C62']/footprint").InnerText='Capacitor_SMD:C_0603_1608Metric'} 'Wrong MLCC'
Reject 'wrong-mlcc-mpn' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='C63']/fields/field[@name='MPN']").InnerText='unapproved'} 'Wrong MLCC'
Reject 'wrong-mlcc-rating' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='C4']/value").InnerText='100nF 16V'} 'Wrong MLCC'
Reject 'wrong-shunt-variant' {param($x) $x.SelectSingleNode("/export/components/comp[@ref='R75']/fields/field[@name='MPN']").InnerText='WSL25125L000JEB'} 'Wrong R75'
Write-Output "PASS: $script:count XML-only continuation fault fixtures. Evidence: $scratch"
