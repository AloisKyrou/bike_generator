/**
 * @file physics.cpp
 * @brief Physics simulation implementation
 */

#include "physics.h"
#include "config.h"

float Physics_CalculateSpeed(float power, float gradePercent) {
  if (power < 5.0f) return 0.0f;
  
  float basePower = max(10.0f, power);
  float baseSpeed = SPEED_POWER_COEFF * cbrtf(basePower);
  float speedPenalty = gradePercent * GRADE_SPEED_PENALTY;
  float finalSpeed = baseSpeed - speedPenalty;
  
  if (finalSpeed < 0) finalSpeed = 0;
  return finalSpeed;
}

float Physics_CalculateCadence(float power, float currentCadence) {
  if (power < 5.0f) return 0.0f;
  
  float targetCadence;
  
  if (power < 40.0f) {
    targetCadence = 50.0f + (power / 40.0f) * 15.0f;
  } else if (power < 80.0f) {
    targetCadence = 65.0f + ((power - 40.0f) / 40.0f) * 15.0f;
  } else {
    targetCadence = 80.0f + ((power - 80.0f) / 40.0f) * 15.0f;
    if (targetCadence > 95.0f) targetCadence = 95.0f;
  }
  
  float smoothedCadence = currentCadence + CADENCE_SMOOTH_FACTOR * (targetCadence - currentCadence);
  float variation = (random(-200, 200) / 100.0f);
  smoothedCadence += variation;
  
  if (smoothedCadence < 0) smoothedCadence = 0;
  if (smoothedCadence > 120) smoothedCadence = 120;
  
  return smoothedCadence;
}