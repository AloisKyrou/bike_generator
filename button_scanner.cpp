/**
 * @file button_scanner.cpp
 * @brief EnOcean button scanner implementation
 */

#include "button_scanner.h"
#include "config.h"
#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

static BLEScan* s_pBLEScan = nullptr;
static volatile bool s_needScanRestart = false;
static ButtonPressCallback s_buttonCallback = nullptr;

static const uint8_t TARGET_MAC[6] = {
  ENOCEAN_MAC_0, ENOCEAN_MAC_1, ENOCEAN_MAC_2,
  ENOCEAN_MAC_3, ENOCEAN_MAC_4, ENOCEAN_MAC_5
};

class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    std::string macStr = advertisedDevice.getAddress().toString();
    
    char targetStr[18];
    snprintf(targetStr, sizeof(targetStr), "%02x:%02x:%02x:%02x:%02x:%02x",
             TARGET_MAC[0], TARGET_MAC[1], TARGET_MAC[2],
             TARGET_MAC[3], TARGET_MAC[4], TARGET_MAC[5]);
    
    bool isTarget = (strcasecmp(macStr.c_str(), targetStr) == 0);
    
    if (isTarget && advertisedDevice.haveManufacturerData()) {
      std::string mfgData = advertisedDevice.getManufacturerData();
      
      if (mfgData.length() >= 11) {
        uint8_t* data = (uint8_t*)mfgData.c_str();
        
        if (data[0] == 0xDA && data[1] == 0x03) {
          uint8_t buttonByte = data[6];
          uint8_t buttonMasked = buttonByte & 0xFE;
          bool isPress = (buttonByte & 0x01) == 1;
          
          if (isPress) {
            bool isPlus = (buttonMasked == BTN_PLUS_MASK);
            bool isMinus = (buttonMasked == BTN_MINUS_MASK);
            
            if ((isPlus || isMinus) && s_buttonCallback) {
              s_buttonCallback(isPlus);
              s_needScanRestart = true;
            }
          }
        }
      }
    }
  }
};

void ButtonScanner_Init() {
  Serial.println("[BUTTON] Initializing button scanner...");
  s_pBLEScan = BLEDevice::getScan();
  s_pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  s_pBLEScan->setActiveScan(true);
  s_pBLEScan->setInterval(100);
  s_pBLEScan->setWindow(99);
  
  char macStr[18];
  snprintf(macStr, sizeof(macStr), "%02X:%02X:%02X:%02X:%02X:%02X",
           TARGET_MAC[0], TARGET_MAC[1], TARGET_MAC[2],
           TARGET_MAC[3], TARGET_MAC[4], TARGET_MAC[5]);
  Serial.printf("[BUTTON] Target MAC: %s\n", macStr);
}

void ButtonScanner_Start() {
  if (s_pBLEScan) {
    s_pBLEScan->start(1, false);
    Serial.println("[BUTTON] Scanning started");
  }
}

void ButtonScanner_Stop() {
  if (s_pBLEScan) {
    s_pBLEScan->stop();
    Serial.println("[BUTTON] Scanning stopped");
  }
}

bool ButtonScanner_Update() {
  static unsigned long lastScanStart = 0;
  bool needRestart = false;
  
  if (millis() - lastScanStart > SCAN_RESTART_INTERVAL_MS) {
    lastScanStart = millis();
    if (s_pBLEScan) {
      s_pBLEScan->clearResults();
      s_pBLEScan->start(1, false);
    }
    needRestart = true;
  }
  
  if (s_needScanRestart && s_pBLEScan) {
    s_needScanRestart = false;
    s_pBLEScan->stop();
    delay(50);
    s_pBLEScan->clearResults();
    s_pBLEScan->start(1, false);
    needRestart = true;
  }
  
  return needRestart;
}

void ButtonScanner_SetCallback(ButtonPressCallback callback) {
  s_buttonCallback = callback;
}