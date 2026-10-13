notes : 

why j5 5 gnd

what is pwr_flag and why in so many places

TP4057 was on the beetle schematic ? 

is 0R82 0.5W like the dfr0868 a 0.8 ohm ? 

Q20 A03401A =  PMOS ?

issue in all situations such as D+ and D- that don't appear as outputs  of  USB interface nor as input of MCU_MODULE_PROVISIONNAL -> they must appears, can't be only used as symlink or something


why we need USBLC6-2 when file:///C:/travail/bike_generator/electrical/components/dfr0868-beetle-esp32-c3/dfr0868-schematic-v2.0.0.pdf doesn't show it ? Also strange how different our schematic of usb c is from theirs ? 

is it normal that our MCU has only pin one to GND where their schematic so a bunch of these ?
Why pwr_flag on j25 pin 1, also misses its name

For things like J32, use test points rather that pin conncetor no ? 

MAIN CONVERTER 

R68 & R69, what are 0ohm resistor for ? 

What are BQInt for ? I see we don't use but still wonder. 