/**
 * @file ble_ftms.h
 * @brief BLE FTMS (Fitness Machine Service) Interface
 * 
 * Implements Indoor Bike profile for Zwift/GoldenCheetah compatibility
 */

#ifndef BLE_FTMS_H
#define BLE_FTMS_H

#include <Arduino.h>

// Bike data structure (matches Indoor Bike Data characteristic)
struct BikeData {
  uint16_t instantaneousSpeed;    // km/h * 100
  uint16_t instantaneousCadence;  // RPM * 2
  int16_t  instantaneousPower;    // Watts
};

// Public API
void FTMS_Init();
void FTMS_Start();
bool FTMS_IsConnected();
void FTMS_HandleConnectionChange();
void FTMS_SendBikeData(const BikeData& data);

#endif // BLE_FTMS_H