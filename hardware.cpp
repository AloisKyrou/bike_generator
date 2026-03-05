/**
 * @file hardware.cpp
 * @brief Hardware abstraction layer implementation
 */

#include "hardware.h"
#include "config.h"
#include "driver/gpio.h"  // for gpio_set_pull_mode / GPIO_FLOATING

void Hardware_Init() {
  Serial.println("[HW] Initializing hardware...");
  Hardware_SetupADC();
  Hardware_SetupSPI();
  Serial.println("[HW] Hardware initialization complete");
}

void Hardware_SetupADC() {
  analogReadResolution(12);

  // Current sensor (ACS712)
  analogSetPinAttenuation(PIN_CURRENT_SENSOR, ADC_11db);
  pinMode(PIN_CURRENT_SENSOR, INPUT);
  gpio_set_pull_mode((gpio_num_t)PIN_CURRENT_SENSOR, GPIO_FLOATING);  // disable internal pull-up/down (must be last)
  Serial.printf("[HW] Current sensor on GPIO%d (ACS712 30A)\n", PIN_CURRENT_SENSOR);

  // Voltage sensor (resistive divider)
  analogSetPinAttenuation(PIN_VOLTAGE_SENSOR, ADC_11db);
  pinMode(PIN_VOLTAGE_SENSOR, INPUT);
  gpio_set_pull_mode((gpio_num_t)PIN_VOLTAGE_SENSOR, GPIO_FLOATING);  // disable internal pull-up/down (must be last)
  Serial.printf("[HW] Voltage sensor on GPIO%d (divider R1=%.0fk R2=%.0fk, max=%.1fV)\n",
                PIN_VOLTAGE_SENSOR,
                VDIV_R1_OHMS / 1000.0f,
                VDIV_R2_OHMS / 1000.0f,
                VDIV_MAX_BUS_V);
}

void Hardware_SetupSPI() {
  pinMode(PIN_POT_CS, OUTPUT);
  digitalWrite(PIN_POT_CS, HIGH);
  SPI.begin(PIN_POT_SCK, PIN_POT_MISO, PIN_POT_MOSI, PIN_POT_CS);
  Serial.printf("[HW] Digipot SPI: CS=%d, SCK=%d, MOSI=%d, MISO=%d\n", 
                PIN_POT_CS, PIN_POT_SCK, PIN_POT_MOSI, PIN_POT_MISO);
}

int Hardware_GetSPI_CS_Pin() {
  return PIN_POT_CS;
}