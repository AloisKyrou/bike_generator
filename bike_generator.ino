/**
 * @file main.ino
 * @brief ESP32-C3 Bike Generator / Smart Trainer - Modular Implementation
 * 
 * Human-powered energy system + "smart trainer" feel
 * Compatible with: Zwift, GoldenCheetah, TrainerRoad, Rouvy
 * 
 * Hardware: ESP32-C3 Beetle + ACS712 + MCP42100 + Bluetti AC50S
 */

#include "config.h"
#include "hardware.h"
#include "sensors.h"
#include "resistance.h"
#include "ble_ftms.h"
#include "physics.h"
#include "control_modes.h"
#include "button_scanner.h"
#include "utils.h"

// Global state
static BikeData bikeData = {0, 0, 0};
static float currentCadence = 70.0f;

// Button callback
void onButtonPress(bool isPlus) {
  if (isPlus) {
    Resistance_Increase();
    Serial.println("[BUTTON] PLUS pressed");
  } else {
    Resistance_Decrease();
    Serial.println("[BUTTON] MINUS pressed");
  }
}

// Update bike data
void updateBikeData() {
  static unsigned long lastUpdate = 0;
  
  if (millis() - lastUpdate < BIKE_DATA_UPDATE_MS) return;
  lastUpdate = millis();
  
  // Read sensors
  Sensors_Update();
  SensorData sensors = Sensors_GetAll();
  
  // Update resistance if app is connected
  if (FTMS_IsConnected()) {
    ControlMode_UpdateResistance();
  }
  
  // Get current grade
  float gradePercent = 0.0f;
  if (ControlMode_Get() == MODE_SIMULATION) {
    gradePercent = ControlMode_GetSimulationGrade() / 100.0f;
  }
  
  // Calculate speed and cadence
  float speed = Physics_CalculateSpeed(sensors.power, gradePercent);
  bikeData.instantaneousSpeed = (uint16_t)(speed * 100);
  
  currentCadence = Physics_CalculateCadence(sensors.power, gradePercent, currentCadence);
  bikeData.instantaneousCadence = (uint16_t)(currentCadence * 2);
  
  bikeData.instantaneousPower = (int16_t)sensors.power;
  if (bikeData.instantaneousPower < 0) bikeData.instantaneousPower = 0;
}

// Status logging
void logStatus() {
  static unsigned long lastLog = 0;
  
  if (millis() - lastLog < STATUS_LOG_INTERVAL_MS) return;
  lastLog = millis();
  
  SensorData sensors = Sensors_GetAll();
  
  Serial.println("\n========== STATUS DUMP ==========");
  
  Serial.print("Mode:     ");
  ControlMode mode = ControlMode_Get();
  switch(mode) {
    case MODE_MANUAL:
      Serial.printf("MANUAL (resistance: %d/100)\n", ControlMode_GetResistanceLevel());
      break;
    case MODE_ERG:
      Serial.printf("ERG\n");
      Serial.printf("Target:   %dW\n", ControlMode_GetTargetPower());
      break;
    case MODE_SIMULATION:
      Serial.printf("SIMULATION\n");
      Serial.printf("Grade:    %.1f%%\n", ControlMode_GetSimulationGrade() / 100.0);
      break;
  }
  
  Serial.printf("Power:    %.1fW (V=%.2fV, I=%.3fA)\n", 
                sensors.power, sensors.voltage, sensors.current);
  Serial.printf("ADC curr: Raw=%d, Vpin=%.3fV\n", 
                sensors.rawADC, sensors.adcVoltage);
  Serial.printf("ADC volt: Vpin=%.3fV → bus=%.2fV (divider x%.2f)\n",
                sensors.adcVoltageDivider, sensors.voltage, VDIV_SCALE);
  
  int digipot = Resistance_Get();
  Serial.printf("Digipot:  %d/%d (%.0f%% = ~%.0fW)\n", 
                digipot, POT_SAFE_MAX,
                (digipot / (float)POT_SAFE_MAX) * 100.0f,
                digipot / POT_WATTS_TO_WIPER_SLOPE);
  
  Serial.printf("Speed:    %.1f km/h\n", bikeData.instantaneousSpeed / 100.0);
  Serial.printf("Cadence:  %d RPM\n", bikeData.instantaneousCadence / 2);
  
  Serial.println("=================================\n");
}

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n\n========================================");
  Serial.println("  ESP32-C3 FTMS Indoor Bike Trainer");
  Serial.println("  Modular Open Source Version");
  Serial.println("========================================\n");
  
  // Initialize all modules
  Hardware_Init();
  Sensors_Init();
  Resistance_Init();
  ControlMode_Init();
  FTMS_Init();
  FTMS_Start();
  
  // Initialize button scanner
  ButtonScanner_Init();
  ButtonScanner_SetCallback(onButtonPress);
  ButtonScanner_Start();
  
  Serial.println("\n*** READY TO PAIR ***");
  Serial.println("Device name: '" BLE_DEVICE_NAME "'");
  Serial.println("Open Zwift/GoldenCheetah and scan for devices");
  Serial.println("Waiting for connection...\n");
}

void loop() {
  // Handle BLE connection state changes
  FTMS_HandleConnectionChange();
  
  // Manage button scanning
  static bool wasConnected = false;
  bool isConnected = FTMS_IsConnected();
  
  if (isConnected && !wasConnected) {
    ButtonScanner_Stop();
    Serial.println("[SCAN] Stopped button scanning (app in control)");
  }
  
  if (!isConnected && wasConnected) {
    ButtonScanner_Start();
    Serial.println("[SCAN] Resumed button scanning (manual control)");
  }
  
  wasConnected = isConnected;
  
  // Update button scanner when not connected
  if (!isConnected) {
    ButtonScanner_Update();
  }
  
  // Always update bike data
  updateBikeData();
  
  // Send BLE notifications when connected
  static unsigned long lastNotify = 0;
  if (isConnected && millis() - lastNotify >= BLE_NOTIFY_INTERVAL_MS) {
    lastNotify = millis();
    FTMS_SendBikeData(bikeData);
  }
  
  // Log status
  logStatus();
  
  // Heartbeat: print current BLE state so it's always clear in the log
  {
    static unsigned long lastHeartbeat = 0;
    if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
      lastHeartbeat = millis();
      if (isConnected) {
        Serial.println("[BLE] << connected — streaming data >>");
      } else {
        Serial.println("[BLE] << not connected — advertising >>");
      }
    }
  }
  
  delay(100);
}