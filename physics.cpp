/**
 * @file physics.cpp
 * @brief Physics simulation implementation
 */

#include "physics.h"
#include "config.h"

float Physics_CalculateSpeed(float power, float gradePercent) {
  if (power < 5.0f) return 0.0f;

  const float g         = 9.81f;
  const float totalMass = PHYSICS_RIDER_MASS_KG + PHYSICS_BIKE_MASS_KG;
  const float grade     = gradePercent / 100.0f;
  const float k_aero    = 0.5f * PHYSICS_AIR_DENSITY * PHYSICS_CDA;
  const float F_const   = totalMass * g * (PHYSICS_CRR + grade);

  // Newton's method: solve k_aero*v³ + F_const*v - P = 0
  float v = cbrtf(power / k_aero);  // aero-only initial guess
  for (int i = 0; i < 10; i++) {
    float fv  = k_aero * v * v * v + F_const * v - power;
    float dfv = 3.0f * k_aero * v * v + F_const;
    if (dfv < 0.001f) break;
    v -= fv / dfv;
    if (v < 0.1f) v = 0.1f;
  }

  float speedKmh = v * 3.6f;
  if (speedKmh > 70.0f) speedKmh = 70.0f;
  return speedKmh;
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