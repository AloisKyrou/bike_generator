/**
 * @file physics.h
 * @brief Physics simulation - speed and cadence from power
 */

#ifndef PHYSICS_H
#define PHYSICS_H

#include <Arduino.h>

float Physics_CalculateSpeed(float power, float gradePercent);
float Physics_CalculateCadence(float power, float currentCadence);

#endif // PHYSICS_H