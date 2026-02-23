/**
 * @file sensors.h
 * @brief Sensor management - current, voltage, power measurement
 */

#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>

typedef struct {
  float voltage;        // Bus voltage (V), from resistive divider + ADC
  float current;        // Bus current (A), from ACS712
  float power;          // Bus power (W) = voltage * current
  int   rawADC;         // Raw ADC count from current sensor (debug)
  float adcVoltage;     // ADC pin voltage for current sensor (V, debug)
  float adcVoltageDivider; // ADC pin voltage for voltage divider (V, debug)
} SensorData;

void Sensors_Init();
void Sensors_Calibrate();
float Sensors_ReadCurrent();
float Sensors_ReadVoltage();
float Sensors_GetPower();
SensorData Sensors_GetAll();
void Sensors_Update();

#endif // SENSORS_H