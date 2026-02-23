/**
 * @file button_scanner.h
 * @brief EnOcean button scanner for manual resistance control
 */

#ifndef BUTTON_SCANNER_H
#define BUTTON_SCANNER_H

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

typedef void (*ButtonPressCallback)(bool isPlus);

void ButtonScanner_Init();
void ButtonScanner_Start();
void ButtonScanner_Stop();
bool ButtonScanner_Update();
void ButtonScanner_SetCallback(ButtonPressCallback callback);

#endif // BUTTON_SCANNER_H