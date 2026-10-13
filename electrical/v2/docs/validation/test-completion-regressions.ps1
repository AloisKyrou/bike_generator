param([Parameter(Mandatory=$true)][string]$Netlist,[Parameter(Mandatory=$true)][string]$Before)
$ErrorActionPreference='Stop';Set-StrictMode -Version Latest
$check=Join-Path $PSScriptRoot 'test-completion-netlist.ps1'
& $check -Netlist $Netlist -Before $Before
$s=[Xml.XmlReaderSettings]::new();$s.DtdProcessing=[Xml.DtdProcessing]::Prohibit
$r=[Xml.XmlReader]::Create((Resolve-Path $Netlist).Path,$s)
try{$source=[Xml.XmlDocument]::new();$source.Load($r)}finally{$r.Dispose()}
$repo=(Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
$dir=Join-Path $repo ('.konnect-scratch/completion-tests-'+[Guid]::NewGuid().ToString('N'))
$null=New-Item -ItemType Directory $dir;$script:count=0
function Reject($name,[scriptblock]$edit,$expected){
 $x=$source.CloneNode($true);& $edit $x;$path=Join-Path $dir "$name.xml";$x.Save($path);$message=''
 try{& $check -Netlist $path -Before $Before}catch{$message=$_.Exception.Message}
 if(!$message -or $message -notmatch $expected){throw "Regression $name missed: $message"};$script:count++;Write-Output "Rejected $name"
}
Reject 'unrelated-value' {param($x)$x.SelectSingleNode("/export/components/comp[@ref='R1']/value").InnerText='BAD'} 'Unapproved component'
Reject 'unrelated-endpoint' {param($x)
 $n=$x.SelectSingleNode("/export/nets/net/node[@ref='R1' and @pin='1']");$to=$x.SelectSingleNode("/export/nets/net[node[@ref='U2' and @pin='3']]");$null=$to.AppendChild($n)
} 'Unapproved connectivity'
Reject 'service-wrong-pitch' {param($x)$x.SelectSingleNode("/export/components/comp[@ref='J32']/footprint").InnerText='Connector_PinHeader_2.00mm:PinHeader_1x06_P2.00mm_Vertical'} 'Wrong service header'
Reject 'same-marking-wrong-maker' {param($x)$x.SelectSingleNode("/export/components/comp[@ref='Q20']/fields/field[@name='Manufacturer']").InnerText='UMW'} 'Wrong manufacturer'
Reject 'unexpected-removal' {param($x)$n=$x.SelectSingleNode("/export/components/comp[@ref='J25']");$null=$n.ParentNode.RemoveChild($n)} 'Unexpected completion inventory'
Write-Output "PASS: $script:count completion negative fixtures. Evidence: $dir"
