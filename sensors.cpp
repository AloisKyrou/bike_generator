/**
 * @file sensors.cpp
 * @brief Sensor management implementation
 */

#include "sensors.h"
#include "config.h"
#include "utils.h"

static uint32_t s_midpoint_mV = 0;
static float s_measured_voltage = 0.0f;   // Now read from ADC, no longer hardcoded
static float s_measured_current = 0.0f;
static float s_measured_power = 0.0f;
static int   s_last_adc_raw = 0;
static float s_last_adc_voltage = 0.0f;
static float s_last_adc_voltage_divider = 0.0f;  // raw ADC voltage on voltage pin (debug)

void Sensors_Init() {
  Serial.println("[SENSORS] Initializing...");
  Sensors_Calibrate();
  Serial.println("[SENSORS] Ready");
}

void Sensors_Calibrate() {
  Serial.println("[SENSORS] Calibrating zero point (no current)...");
  delay(1000);
  s_midpoint_mV = Utils_ReadMilliVoltsAvg(PIN_CURRENT_SENSOR, 8192);
  Serial.printf("[SENSORS] ACS712 midpoint: %lu mV (%.3fV)\n", 
                (unsigned long)s_midpoint_mV, s_midpoint_mV / 1000.0f);
}

float Sensors_ReadCurrent() {
  uint32_t mv = Utils_ReadMilliVoltsAvg(PIN_CURRENT_SENSOR, ADC_AVERAGING_SAMPLES);
  float voltage = mv / 1000.0f;
  float midpoint = s_midpoint_mV / 1000.0f;
  
  float dV = voltage - midpoint;
  float current = fabsf(dV / ACS712_SENSITIVITY);
  
  s_last_adc_raw = analogRead(PIN_CURRENT_SENSOR);
  s_last_adc_voltage = voltage;
  s_measured_current = current;
  
  return current;
}

float Sensors_ReadVoltage() {
  // Read ADC, average to reduce noise
  uint32_t mv = Utils_ReadMilliVoltsAvg(PIN_VOLTAGE_SENSOR, ADC_AVERAGING_SAMPLES);

  // Scale from ADC millivolts to actual bus voltage using the divider ratio
  s_last_adc_voltage_divider = mv / 1000.0f;
  float busVoltage = s_last_adc_voltage_divider * VDIV_SCALE + VDIV_OFFSET_V;

  if (busVoltage < 0.0f) busVoltage = 0.0f;

  s_measured_voltage = busVoltage;
  return busVoltage;
}

float Sensors_GetPower() {
  return s_measured_power;
}

SensorData Sensors_GetAll() {
  SensorData data;
  data.voltage              = s_measured_voltage;
  data.current              = s_measured_current;
  data.power                = s_measured_power;
  data.rawADC               = s_last_adc_raw;
  data.adcVoltage           = s_last_adc_voltage;
  data.adcVoltageDivider    = s_last_adc_voltage_divider;
  return data;
}

void Sensors_Update() {
  s_measured_current = Sensors_ReadCurrent();
  s_measured_voltage = Sensors_ReadVoltage();
  s_measured_power = s_measured_voltage * s_measured_current;
  if (s_measured_power < 0) s_measured_power = 0;
}