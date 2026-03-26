/**
 * @file control_modes.cpp
 * @brief Control mode management implementation
 */

#include "control_modes.h"
#include "config.h"
#include "resistance.h"

static ControlMode s_currentMode = MODE_MANUAL;
static int16_t s_targetPower = 0;
static int16_t s_simulationGrade = 0;
static uint16_t s_resistanceLevel = 10;

void ControlMode_Init() {
  Serial.println("[MODE] Control mode system initialized");
  s_currentMode = MODE_MANUAL;
}

void ControlMode_Set(ControlMode mode) {
  if (mode != s_currentMode) {
    s_currentMode = mode;
    Serial.print("[MODE] Mode changed to: ");
    switch(mode) {
      case MODE_MANUAL: Serial.println("MANUAL"); break;
      case MODE_ERG: Serial.println("ERG"); break;
      case MODE_SIMULATION: Serial.println("SIMULATION"); break;
    }
  }
}

ControlMode ControlMode_Get() {
  return s_currentMode;
}

void ControlMode_HandleManual(uint16_t resistanceLevel) {
  s_resistanceLevel = resistanceLevel;
  s_currentMode = MODE_MANUAL;
  Serial.printf("[MODE] Manual - Resistance Level: %d/100\n", resistanceLevel);
  Resistance_SetFromLevel(resistanceLevel);  // Apply immediately — don't wait for next loop tick
}

void ControlMode_HandleERG(int16_t targetPower) {
  if (targetPower != s_targetPower || s_currentMode != MODE_ERG) {
    s_targetPower = targetPower;
    s_currentMode = MODE_ERG;
    Serial.printf("[MODE] ERG - Target Power: %d W\n", targetPower);
  }
}

void ControlMode_HandleSimulation(int16_t simulationGrade) {
  if (simulationGrade != s_simulationGrade || s_currentMode != MODE_SIMULATION) {
    s_simulationGrade = simulationGrade;
    s_currentMode = MODE_SIMULATION;
    Serial.printf("[MODE] Simulation - Grade: %.1f%%\n", simulationGrade / 100.0);
  }
}

void ControlMode_UpdateResistance() {
  switch (s_currentMode) {
    case MODE_SIMULATION: {
      float gradePercent = s_simulationGrade / 100.0f;
      Resistance_SetFromGrade(gradePercent);
      break;
    }
    
    case MODE_ERG:
      Resistance_SetFromPower((float)s_targetPower);
      break;
    
    case MODE_MANUAL:
      Resistance_SetFromLevel(s_resistanceLevel);
      break;
  }
}

int16_t ControlMode_GetTargetPower() {
  return s_targetPower;
}

int16_t ControlMode_GetSimulationGrade() {
  return s_simulationGrade;
}

uint16_t ControlMode_GetResistanceLevel() {
  return s_resistanceLevel;
}