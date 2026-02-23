/**
 * @file utils.h
 * @brief Helper functions and utilities
 */

#ifndef UTILS_H
#define UTILS_H

#include <Arduino.h>

/**
 * @brief Read ADC with averaging for stable readings
 * @param pin GPIO pin to read
 * @param samples Number of samples to average
 * @return Average reading in millivolts
 */
uint32_t Utils_ReadMilliVoltsAvg(int pin, int samples);

/**
 * @brief Constrain a float value between min and max
 */
float Utils_Constrain(float value, float min, float max);

/**
 * @brief Map float value from one range to another
 */
float Utils_MapFloat(float x, float in_min, float in_max, float out_min, float out_max);

/**
 * @brief Simple low-pass filter
 * @param input New input value
 * @param output Previous output value
 * @param alpha Smoothing factor (0-1, lower = smoother)
 * @return Filtered output
 */
float Utils_LowPassFilter(float input, float output, float alpha);

#endif // UTILS_H