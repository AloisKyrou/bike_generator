/**
 * @file physics.cpp
 * @brief Physics simulation implementation
 */

#include "physics.h"
#include "config.h"

float Physics_CalculateSpeed(float power, float gradePercent) {
  const float g         = 9.81f;
  const float totalMass = PHYSICS_RIDER_MASS_KG + PHYSICS_BIKE_MASS_KG;
  const float grade     = gradePercent / 100.0f;
  const float k_aero    = 0.5f * PHYSICS_AIR_DENSITY * PHYSICS_CDA;

  // F_const = total resistive/assistive force per unit speed (N).
  // Negative on downhill: gravity pulls the rider forward.
  const float F_const = totalMass * g * (PHYSICS_CRR + grade);

  // Terminal freewheel speed: the speed gravity alone sustains with no pedaling.
  // Solve k_aero*v² = -F_const  →  v = sqrt(-F_const / k_aero)
  float freewheelSpeed = 0.0f;
  if (F_const < 0.0f) {
    freewheelSpeed = sqrtf(-F_const / k_aero);
  }

  // Only return zero when truly no effort AND no gravitational assistance.
  if (power < 5.0f && freewheelSpeed < 0.5f) return 0.0f;

  // Newton's method: solve f(v) = k_aero*v³ + F_const*v - power = 0
  // Start from freewheelSpeed on downhill (much closer to solution than aero estimate).
  float v = (freewheelSpeed > 0.5f) ? freewheelSpeed : cbrtf(fabsf(power) / k_aero + 0.01f);
  if (v < 0.1f) v = 0.1f;

  for (int i = 0; i < 20; i++) {
    float v2  = v * v;
    float fv  = k_aero * v2 * v + F_const * v - power;
    float dfv = 3.0f * k_aero * v2 + F_const;
    // On steep downhill dfv can be small — guard against divide by near-zero.
    // Use a damped step instead of skipping, so we still converge.
    if (dfv < 0.1f) dfv = 0.1f;
    float step = fv / dfv;
    // Clamp step to avoid overshooting into negative territory.
    if (step > v * 0.5f) step = v * 0.5f;
    v -= step;
    if (v < 0.01f) v = 0.01f;
    if (fabsf(step) < 0.0005f) break;
  }

  // Never report less than freewheelSpeed on a downhill — gravity is always there.
  if (v < freewheelSpeed) v = freewheelSpeed;

  float speedKmh = v * 3.6f;
  if (speedKmh > 70.0f) speedKmh = 70.0f;
  return speedKmh;
}

float Physics_CalculateCadence(float power, float gradePercent, float currentCadence) {
  // On a downhill the rider may barely pedal but legs are still turning.
  // Keep a minimum cadence proportional to how steep the descent is.
  float minCadence = 0.0f;
  if (gradePercent < 0.0f) {
    minCadence = fabsf(gradePercent) * 3.0f;  // e.g. -4% → 12 rpm minimum
    if (minCadence > 40.0f) minCadence = 40.0f;
  }
  if (power < 5.0f) return minCadence;
  
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
  
  if (smoothedCadence < minCadence) smoothedCadence = minCadence;
  if (smoothedCadence > 120) smoothedCadence = 120;
  
  return smoothedCadence;
}