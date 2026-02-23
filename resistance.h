/**
 * @file resistance.h
 * @brief Resistance control via digital potentiometer
 */

#ifndef RESISTANCE_H
#define RESISTANCE_H

#include <Arduino.h>

void Resistance_Init();
void Resistance_Set(int value, const char* reason);
int Resistance_Get();
void Resistance_Increase();
void Resistance_Decrease();
void Resistance_SetFromPower(float targetPower);
void Resistance_SetFromGrade(float gradePercent);
void Resistance_SetFromLevel(uint16_t level);

#endif // RESISTANCE_H