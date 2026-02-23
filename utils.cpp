/**
 * @file utils.cpp
 * @brief Helper functions implementation
 */

#include "utils.h"

uint32_t Utils_ReadMilliVoltsAvg(int pin, int samples) {
  uint64_t sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogReadMilliVolts(pin);
    delayMicroseconds(200);
  }
  return (uint32_t)(sum / samples);
}

float Utils_Constrain(float value, float min, float max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

float Utils_MapFloat(float x, float in_min, float in_max, float out_min, float out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

float Utils_LowPassFilter(float input, float output, float alpha) {
  return output + alpha * (input - output);
}