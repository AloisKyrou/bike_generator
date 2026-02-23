/**
 * @file hardware.h
 * @brief Hardware abstraction layer - pins, SPI, ADC setup
 */

#ifndef HARDWARE_H
#define HARDWARE_H

#include <Arduino.h>
#include <SPI.h>

void Hardware_Init();
void Hardware_SetupADC();
void Hardware_SetupSPI();
int Hardware_GetSPI_CS_Pin();

#endif // HARDWARE_H