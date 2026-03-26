/**
 * @file ble_ftms.cpp
 * @brief BLE Fitness Machine Service implementation
 */

#include "ble_ftms.h"
#include "config.h"
#include "control_modes.h"
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// BLE Objects
static BLEServer* s_pServer = nullptr;
static BLECharacteristic* s_pIndoorBikeDataChar = nullptr;
static BLECharacteristic* s_pControlPointChar = nullptr;
static BLECharacteristic* s_pStatusChar = nullptr;

static bool s_deviceConnected = false;
static bool s_oldDeviceConnected = false;

// Forward declarations
class MyServerCallbacks;
class FitnessMachineControlPointCallbacks;

// ---- BLE Server Callbacks ----
class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    s_deviceConnected = true;
    Serial.println("");
    Serial.println("##################################################");
    Serial.println("##           BLE CLIENT CONNECTED               ##");
    Serial.println("##################################################");
    Serial.println("");
  }

  void onDisconnect(BLEServer* pServer) {
    s_deviceConnected = false;
    Serial.println("");
    Serial.println("##################################################");
    Serial.println("##          BLE CLIENT DISCONNECTED             ##");
    Serial.println("##################################################");
    Serial.println("");
  }
};

// ---- FTMS Control Point Callback ----
class FitnessMachineControlPointCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
    String value = pCharacteristic->getValue();
    
    if (value.length() > 0) {
      uint8_t opCode = (uint8_t)value[0];
      Serial.printf("[FTMS] >> opCode=0x%02X  connected=%s\n",
                    opCode, s_deviceConnected ? "YES" : "NO (stale write!)");

      // Response buffer
      uint8_t response[20];
      response[0] = 0x80;  // Response code
      response[1] = opCode;
      response[2] = 0x01;  // Success (default)
      int responseLength = 3;
      
      switch (opCode) {
        case 0x00:  // Request Control
          Serial.println("[FTMS] Request Control - Granted");
          break;
          
        case 0x01:  // Reset
          Serial.println("[FTMS] Reset");
          break;
          
        case 0x04:  // Set Target Resistance Level
          if (value.length() >= 2) {
            uint16_t resistanceLevel = (uint8_t)value[1];
            ControlMode_HandleManual(resistanceLevel);
          }
          break;
          
        case 0x05:  // Set Target Power (ERG Mode)
          if (value.length() >= 3) {
            int16_t targetPower = (int16_t)((uint8_t)value[1] | ((uint8_t)value[2] << 8));
            ControlMode_HandleERG(targetPower);
          }
          break;
          
        case 0x07:  // Start/Resume
          Serial.println("[FTMS] Start/Resume Training");
          break;
          
        case 0x08:  // Stop/Pause
          Serial.println("[FTMS] Stop/Pause Training");
          break;
          
        case 0x11:  // Set Indoor Bike Simulation Parameters
          if (value.length() >= 7) {
            int16_t windSpeed = (int16_t)((uint8_t)value[1] | ((uint8_t)value[2] << 8));
            int16_t grade = (int16_t)((uint8_t)value[3] | ((uint8_t)value[4] << 8));
            uint8_t crr = (uint8_t)value[5];
            uint8_t cw = (uint8_t)value[6];
            
            ControlMode_HandleSimulation(grade);
            
            Serial.print("[FTMS] Simulation - Grade: ");
            Serial.print(grade / 100.0);
            Serial.print("%, Wind: ");
            Serial.print(windSpeed / 1000.0);
            Serial.print(" m/s, CRR: ");
            Serial.print(crr / 10000.0);
            Serial.print(", CW: ");
            Serial.println(cw / 100.0);
            
            // Status notification
            if (s_pStatusChar) {
              uint8_t status[7] = {0x12, (uint8_t)value[1], (uint8_t)value[2], 
                                   (uint8_t)value[3], (uint8_t)value[4], 
                                   (uint8_t)value[5], (uint8_t)value[6]};
              s_pStatusChar->setValue(status, 7);
              s_pStatusChar->notify();
            }
          }
          break;
          
        default:
          Serial.print("[FTMS] Unsupported OpCode: 0x");
          Serial.println(opCode, HEX);
          response[2] = 0x02;  // Op Code not supported
          break;
      }
      
      // Send response
      pCharacteristic->setValue(response, responseLength);
      pCharacteristic->indicate();
    }
  }
};

void FTMS_Init() {
  Serial.println("[BLE] Initializing FTMS service...");
  
  // Create BLE Server
  BLEDevice::init(BLE_DEVICE_NAME);
  s_pServer = BLEDevice::createServer();
  s_pServer->setCallbacks(new MyServerCallbacks());
  
  // Create Fitness Machine Service
  BLEService* pService = s_pServer->createService(FITNESSMACHINE_SERVICE_UUID);
  
  // 1. Fitness Machine Feature (mandatory, read)
  BLECharacteristic* pFeatureChar = pService->createCharacteristic(
    FITNESSMACHINE_FEATURE_UUID,
    BLECharacteristic::PROPERTY_READ
  );
  uint8_t features[8] = {
    0x07, 0x00,  // Bits: Avg Speed, Cadence, Total Distance
    0x00, 0x00,
    0x0C, 0x40,  // Target Settings: Power, Resistance, Indoor Bike Simulation
    0x00, 0x00
  };
  pFeatureChar->setValue(features, 8);
  
  // 2. Indoor Bike Data (mandatory, notify)
  s_pIndoorBikeDataChar = pService->createCharacteristic(
    INDOOR_BIKE_DATA_UUID,
    BLECharacteristic::PROPERTY_NOTIFY
  );
  s_pIndoorBikeDataChar->addDescriptor(new BLE2902());
  
  // 3. Supported Resistance Level Range (optional, read)
  BLECharacteristic* pResistanceRangeChar = pService->createCharacteristic(
    SUPPORTED_RESISTANCE_LEVEL_RANGE_UUID,
    BLECharacteristic::PROPERTY_READ
  );
  uint8_t resistanceRange[6] = {
    (uint8_t)(FTMS_RESISTANCE_MIN & 0xFF), (uint8_t)(FTMS_RESISTANCE_MIN >> 8),
    (uint8_t)(FTMS_RESISTANCE_MAX & 0xFF), (uint8_t)(FTMS_RESISTANCE_MAX >> 8),
    (uint8_t)(FTMS_RESISTANCE_INC & 0xFF), (uint8_t)(FTMS_RESISTANCE_INC >> 8)
  };
  pResistanceRangeChar->setValue(resistanceRange, 6);
  
  // 4. Supported Power Range (optional, read)
  BLECharacteristic* pPowerRangeChar = pService->createCharacteristic(
    SUPPORTED_POWER_RANGE_UUID,
    BLECharacteristic::PROPERTY_READ
  );
  uint8_t powerRange[6] = {
    (uint8_t)(FTMS_POWER_MIN & 0xFF), (uint8_t)(FTMS_POWER_MIN >> 8),
    (uint8_t)(FTMS_POWER_MAX & 0xFF), (uint8_t)(FTMS_POWER_MAX >> 8),
    (uint8_t)(FTMS_POWER_INC & 0xFF), (uint8_t)(FTMS_POWER_INC >> 8)
  };
  pPowerRangeChar->setValue(powerRange, 6);
  
  // 5. Fitness Machine Control Point (mandatory, write/indicate)
  s_pControlPointChar = pService->createCharacteristic(
    FITNESS_MACHINE_CONTROL_POINT_UUID,
    BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_INDICATE
  );
  s_pControlPointChar->addDescriptor(new BLE2902());
  s_pControlPointChar->setCallbacks(new FitnessMachineControlPointCallbacks());
  
  // 6. Fitness Machine Status (optional, notify)
  s_pStatusChar = pService->createCharacteristic(
    FITNESS_MACHINE_STATUS_UUID,
    BLECharacteristic::PROPERTY_NOTIFY
  );
  s_pStatusChar->addDescriptor(new BLE2902());
  
  // Start service
  pService->start();
  
  Serial.println("[BLE]  FTMS Service created");
}

void FTMS_Start() {
  // Start advertising with enhanced settings
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  
  // Primary advertising data
  BLEAdvertisementData advData;
  advData.setFlags(0x06);  // LE General Discoverable, BR/EDR not supported
  advData.setCompleteServices(BLEUUID((uint16_t)0x1826));  // FTMS Service UUID
  advData.setAppearance(BLE_APPEARANCE);  // Generic Cycling device
  
  // Service Data - FTMS with Indoor Bike flag
  uint8_t serviceData[4] = {0x26, 0x18, 0x01, 0x00};
  advData.setServiceData(BLEUUID((uint16_t)0x1826), String((char*)serviceData, 4));
  
  // Scan response data with device name
  BLEAdvertisementData scanResponse;
  scanResponse.setName(BLE_DEVICE_NAME);
  
  pAdvertising->setAdvertisementData(advData);
  pAdvertising->setScanResponseData(scanResponse);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  
  BLEDevice::startAdvertising();
  
  Serial.println("[BLE]  Advertising started");
  Serial.printf("[BLE]  Device name: '%s'\n", BLE_DEVICE_NAME);
  Serial.println("[BLE]  Service UUID: 0x1826 (Fitness Machine)");
}

bool FTMS_IsConnected() {
  return s_deviceConnected;
}

void FTMS_SendBikeData(const BikeData& data) {
  if (!s_deviceConnected || !s_pIndoorBikeDataChar) return;
  
  // Indoor Bike Data format
  uint16_t flags = FTMS_FLAGS_CADENCE_POWER;  // Cadence + Power present
  
  uint8_t packet[20];
  int pos = 0;
  
  // Flags
  packet[pos++] = flags & 0xFF;
  packet[pos++] = (flags >> 8) & 0xFF;
  
  // Instantaneous Speed (mandatory)
  packet[pos++] = data.instantaneousSpeed & 0xFF;
  packet[pos++] = (data.instantaneousSpeed >> 8) & 0xFF;
  
  // Instantaneous Cadence
  packet[pos++] = data.instantaneousCadence & 0xFF;
  packet[pos++] = (data.instantaneousCadence >> 8) & 0xFF;
  
  // Instantaneous Power
  packet[pos++] = data.instantaneousPower & 0xFF;
  packet[pos++] = (data.instantaneousPower >> 8) & 0xFF;
  
  s_pIndoorBikeDataChar->setValue(packet, pos);
  s_pIndoorBikeDataChar->notify();
}

void FTMS_SendStatus(uint8_t* statusData, size_t length) {
  if (!s_deviceConnected || !s_pStatusChar) return;
  s_pStatusChar->setValue(statusData, length);
  s_pStatusChar->notify();
}

BLEServer* FTMS_GetServer() {
  return s_pServer;
}

void FTMS_HandleConnectionChange() {
  // Handle connection state changes
  if (s_deviceConnected && !s_oldDeviceConnected) {
    s_oldDeviceConnected = s_deviceConnected;
    Serial.println("\n====================================");
    Serial.println("    CLIENT CONNECTED!");
    Serial.println("====================================\n");
    Serial.println("Streaming bike data...\n");
  }
  
  if (!s_deviceConnected && s_oldDeviceConnected) {
    delay(500);  // Give BLE stack time
    s_pServer->startAdvertising();
    Serial.println("[BLE] Advertising restarted — waiting for next connection");
    s_oldDeviceConnected = s_deviceConnected;
  }
}
