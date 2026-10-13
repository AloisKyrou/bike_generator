$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path
$scratch = Join-Path $repo ('.konnect-scratch/bom-tests-' + [Guid]::NewGuid().ToString('N'))
$null = New-Item -ItemType Directory -Path $scratch
$fixture = Join-Path $scratch 'fixture.xml'
$xml = [xml]'<export><components /></export>'
function Add-Component([string]$ref, [string]$mpn, [string]$footprint, [bool]$dnp = $false, [string]$manufacturer = 'Espressif', [string]$sheetName = '/MCU_MODULE_PROVISIONAL/') {
    $component = $xml.CreateElement('comp')
    $component.SetAttribute('ref', $ref)
    foreach ($pair in @(@('value','test'), @('footprint',$footprint))) {
        $element = $xml.CreateElement($pair[0]); $element.InnerText = $pair[1]
        $null = $component.AppendChild($element)
    }
    $fields = $xml.CreateElement('fields'); $field = $xml.CreateElement('field')
    $field.SetAttribute('name','MPN'); $field.InnerText = $mpn
    $null = $fields.AppendChild($field)
    $field = $xml.CreateElement('field'); $field.SetAttribute('name','Manufacturer'); $field.InnerText = $manufacturer
    $null = $fields.AppendChild($field); $null = $component.AppendChild($fields)
    $sheet = $xml.CreateElement('sheetpath'); $sheet.SetAttribute('names', $sheetName)
    $null = $component.AppendChild($sheet)
    if ($dnp) { $property = $xml.CreateElement('property'); $property.SetAttribute('name','dnp'); $null = $component.AppendChild($property) }
    $null = $xml.SelectSingleNode('/export/components').AppendChild($component)
}
function Check([bool]$condition, [string]$message) { if (!$condition) { throw $message } }
Add-Component 'U2' 'ESP32-C3-MINI-1-N4X' ''
Add-Component 'U3' 'ESP32-C3-MINI-1-N4X' '' $true
Add-Component 'J20' '' ''
Add-Component 'TP1' '' 'TestPoint:TestPoint_Pad_D1.5mm'
Add-Component 'R30' '' 'Resistor_SMD:R_0805_2012Metric'
Add-Component 'U99' 'ESP32-C3-MINI-1-N4X' '' $false 'Unrelated manufacturer'
Add-Component 'R49' '' 'Resistor_SMD:R_0805_2012Metric' $false '' '/USB_INTERFACE/'
Add-Component 'C60' '' 'Capacitor_SMD:C_0805_2012Metric' $false '' '/MAIN_CONVERTER_TBD/'
Add-Component 'C62' '' 'Capacitor_SMD:C_0805_2012Metric' $false '' '/MAIN_CONVERTER_TBD/'
Add-Component 'C99' '' 'Capacitor_SMD:C_0805_2012Metric' $false '' '/MAIN_CONVERTER_TBD/'
Add-Component 'U80' 'UNQUOTED_CHARGER' 'Package_TO_SOT_SMD:SOT-23-6' $false '' '/LOGIC_POWER_USB_ONLY/'
Add-Component 'U81' 'UNQUOTED_REGULATOR' 'Package_TO_SOT_SMD:SOT-23' $false '' '/LOGIC_POWER_USB_ONLY/'
Add-Component 'Q80' '' 'Package_TO_SOT_SMD:SOT-23' $false '' '/LOGIC_POWER_USB_ONLY/'
Add-Component 'Q81' '' 'Package_TO_SOT_SMD:SOT-23-6' $false '' '/LOGIC_POWER_USB_ONLY/'
$xml.SelectSingleNode("/export/components/comp[@ref='C60']/value").InnerText = '4.7uF 25V'
$xml.SelectSingleNode("/export/components/comp[@ref='C62']/value").InnerText = '1uF 100V'
$xml.Save($fixture)
# Freeze the test quote: changing a market observation must not alter expectations.
$testPrices = @(Import-Csv (Join-Path $PSScriptRoot 'pricebook.csv'))
$testQuote = $testPrices | Where-Object {$_.Match -eq 'MPN' -and $_.Key -eq 'ESP32-C3-MINI-1-N4X'}
$testQuote.Low_1 = '2.86'; $testQuote.High_1 = '2.86'
$testQuote | Add-Member -NotePropertyName Manufacturer -NotePropertyValue Espressif -Force
$testPricePath = Join-Path $scratch 'pricebook.csv'
$testPrices | Export-Csv $testPricePath -NoTypeInformation -Encoding UTF8
& (Join-Path $PSScriptRoot 'update-cost-tracker.ps1') -Netlist $fixture -OutputDirectory $scratch -Pricebook $testPricePath
$rows = @(Import-Csv (Join-Path $scratch 'controller-v2-overall-bom.csv'))
$blocks = @(Import-Csv (Join-Path $scratch 'controller-v2-cost-blocks.csv'))
Check ($rows.Count -eq 14) 'Inventory lost a component.'
Check (($rows | Where-Object Reference -eq U80).Basis -eq 'UNPRICED') 'Charger inherited a transistor allowance.'
Check (($rows | Where-Object Reference -eq U81).Basis -eq 'UNPRICED') 'IC reference inherited a transistor allowance.'
Check (($rows | Where-Object Reference -eq Q80).Basis -eq 'engineering_allowance') 'Discrete transistor allowance lost.'
Check (($rows | Where-Object Reference -eq Q81).Basis -eq 'UNPRICED') 'Other SOT-23 package inherited three-pin allowance.'
Check (($rows | Where-Object Reference -eq C60).Basis -eq 'engineering_allowance') 'Explicit LV capacitor allowance lost.'
Check (($rows | Where-Object Reference -eq C62).Basis -eq 'UNPRICED') 'HV capacitor inherited cheap LV allowance.'
Check (($rows | Where-Object Reference -eq C99).Basis -eq 'UNPRICED') 'Unknown voltage inherited LV allowance.'
Check (($rows | Where-Object Reference -eq R49).Block -eq 'LV') 'Separated USB interface mapped to wrong cost block.'
Check (@($blocks | Where-Object Block -eq AUX).Count -eq 0) 'Abandoned AUX allowance remains in active budget.'
$unknown = $rows | Where-Object Reference -eq J20
Check ($unknown.Basis -eq 'UNPRICED' -and $unknown.Low_1 -eq '') 'Unknown price became zero.'
$testpad = $rows | Where-Object Reference -eq TP1
Check ($testpad.Basis -eq 'PCB_feature' -and [decimal]$testpad.Low_1 -eq 0) 'Testpad accounting failed.'
$mcu = $blocks | Where-Object Block -eq MCU
Check ($mcu.Drawn_fitted -eq 5 -and $mcu.Unpriced -eq 2) 'DNP or unpriced count failed.'
Check (($rows | Where-Object Reference -eq U99).Basis -eq 'UNPRICED') 'Wrong manufacturer matched an exact quote.'
Check (($rows | Where-Object Reference -eq U2).Manufacturer -eq 'Espressif') 'Manufacturer lost from inventory.'
Check ([decimal]$mcu.Drawn_Low_1 -eq 2.89) 'Exact MPN or generic resistor pricing failed.'
Check ([decimal]$mcu.Projected_Low_1 -eq 4) 'Block allowance double-counted actual parts.'
Check ([decimal]$mcu.Reserve_Low_1 -eq 1.11) 'Remaining allowance arithmetic failed.'
Add-Component 'U2' '' ''
$xml.Save($fixture)
$rejected = $false
try { & (Join-Path $PSScriptRoot 'update-cost-tracker.ps1') -Netlist $fixture -OutputDirectory $scratch -Pricebook $testPricePath }
catch { $rejected = $_.Exception.Message -match 'Duplicate reference' }
Check $rejected 'Duplicate reference was not rejected.'
Write-Output 'PASS: XML inventory; manufacturer-aware exact and fallback prices; DNP; unknowns; PCB features; no double-count; duplicate rejection.'
Write-Output "Test evidence retained in $scratch"
