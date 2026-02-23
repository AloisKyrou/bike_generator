/**
 * @file control_modes.h
 * @brief Control mode management - Manual, ERG, Simulation
 */

#ifndef CONTROL_MODES_H
#define CONTROL_MODES_H

#include <Arduino.h>

typedef enum {
  MODE_MANUAL,
  MODE_ERG,
  MODE_SIMULATION
} ControlMode;

void ControlMode_Init();
void ControlMode_Set(ControlMode mode);
ControlMode ControlMode_Get();
void ControlMode_HandleManual(uint16_t resistanceLevel);
void ControlMode_HandleERG(int16_t targetPower);
void ControlMode_HandleSimulation(int16_t simulationGrade);
void ControlMode_UpdateResistance();
int16_t ControlMode_GetTargetPower();
int16_t ControlMode_GetSimulationGrade();
uint16_t ControlMode_GetResistanceLevel();

#endif // CONTROL_MODES_H