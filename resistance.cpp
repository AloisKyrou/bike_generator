/**
 * @file resistance.cpp
 * @brief Resistance control implementation
 */

#include "resistance.h"
#include "config.h"
#include "hardware.h"
#include <SPI.h>

static int s_currentDigipotValue = POT_INITIAL;

static void writePot0(uint8_t value) {
  int cs_pin = Hardware_GetSPI_CS_Pin();
  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));
  digitalWrite(cs_pin, LOW);
  SPI.transfer(CMD_WRITE_POT0);
  SPI.transfer(value);
  digitalWrite(cs_pin, HIGH);
  SPI.endTransaction();
}

void Resistance_Init() {
  Serial.println("[RESISTANCE] Initializing...");
  Resistance_Set(POT_INITIAL, "Initial");
  Serial.println("[RESISTANCE] Ready");
}

void Resistance_Set(int value, const char* reason) {
  if (value < POT_MIN)      value = POT_MIN;
  if (value > POT_SAFE_MAX) value = POT_SAFE_MAX;  // Never exceed power-safe limit
  
  if (value != s_currentDigipotValue) {
    s_currentDigipotValue = value;
    writePot0((uint8_t)value);
    Serial.printf("[DIGIPOT] %s -> Value: %d/%d (%.1f%% of usable range)\n", 
                  reason, value, POT_SAFE_MAX,
                  (value / (float)POT_SAFE_MAX) * 100.0);
  }
}

int Resistance_Get() {
  return s_currentDigipotValue;
}

void Resistance_Increase() {
  int newValue = s_currentDigipotValue + POT_STEP;
  if (newValue > POT_SAFE_MAX) newValue = POT_SAFE_MAX;
  Resistance_Set(newValue, "Manual Increase");
}

void Resistance_Decrease() {
  int newValue = s_currentDigipotValue - POT_STEP;
  if (newValue < POT_MIN) newValue = POT_MIN;
  Resistance_Set(newValue, "Manual Decrease");
}

// Convert a target power (W) to a wiper position.
// Formula (linear through origin): wiper = P * (POT_CAL_VALUE / POT_CAL_POWER)
// Clamped to [POT_MIN, POT_SAFE_MAX] — never exceeds the HILL_POWER_TARGET ceiling.
static int powerToWiper(float targetPower) {
  float wiper = targetPower * POT_WATTS_TO_WIPER_SLOPE;
  if (wiper < POT_MIN)      wiper = POT_MIN;
  if (wiper > POT_SAFE_MAX) wiper = POT_SAFE_MAX;
  return (int)wiper;
}

void Resistance_SetFromPower(float targetPower) {
  if (targetPower <= 0.0f) {
    Resistance_Set(POT_MIN, "ERG Power Target (zero)");
    return;
  }
  if (targetPower > HILL_POWER_TARGET) targetPower = HILL_POWER_TARGET;
  
  // Apply a small ERG margin so the wiper slightly overshoots the target,
  // letting the rider feel they need to push — closed-loop improvement point.
  float adjustedTarget = targetPower + ERG_MODE_POWER_MARGIN;
  Resistance_Set(powerToWiper(adjustedTarget), "ERG Power Target");
}

void Resistance_SetFromGrade(float gradePercent) {
  float targetPower = FLAT_POWER_TARGET + (gradePercent * POWER_PER_GRADE_PERCENT);
  if (targetPower < 0.0f)           targetPower = 0.0f;
  if (targetPower > HILL_POWER_TARGET) targetPower = HILL_POWER_TARGET;
  
  Resistance_Set(powerToWiper(targetPower), "Simulation Grade");
}

void Resistance_SetFromLevel(uint16_t level) {
  // Manual level 0-100 maps linearly across the usable wiper range [POT_MIN, POT_SAFE_MAX]
  int targetResistance = map(level, 0, 100, POT_MIN, POT_SAFE_MAX);
  Resistance_Set(targetResistance, "Manual Level");
}