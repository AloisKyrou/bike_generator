/**
 * @file config.h
 * @brief Central configuration for Bike Generator/Smart Trainer
 * 
 * All hardware pins, calibration constants, and tuning parameters
 */

#ifndef CONFIG_H
#define CONFIG_H

// ============================================================================
// HARDWARE PIN DEFINITIONS
// ============================================================================

#define PIN_CURRENT_SENSOR  0   // ACS712 30A on GPIO0 (ADC)
#define PIN_VOLTAGE_SENSOR  1   // Voltage divider on GPIO1 (future)
#define PIN_POT_CS          5   // Digipot Chip Select
#define PIN_POT_SCK         6   // Digipot Clock
#define PIN_POT_MOSI        7   // Digipot MOSI
#define PIN_POT_MISO        4   // Digipot MISO (optional)

// ============================================================================
// SENSOR CALIBRATION
// ============================================================================

// ACS712 30A Configuration
#define ACS712_SENSITIVITY      0.039f  // 39 mV/A (calibrated, adjusted +5% from 41mV/A)
#define ADC_AVERAGING_SAMPLES   128     // Number of samples for ADC averaging

// ----------------------------------------------------------------------------
// Voltage divider (resistive) — bus voltage measurement
// ----------------------------------------------------------------------------
// Circuit:  V_BUS ──[R1]──┬──[R2]── GND
//                         └──► GPIO1 (ADC)
//
// Choose R1/R2 so that V_BUS_MAX maps to ≤ ADC_VREF:
//   V_ADC = V_BUS * R2 / (R1 + R2)
//   → R1=100kΩ, R2=12kΩ  → ratio=0.1071 → V_ADC_MAX = 30V * 0.1071 = 3.21V  ✅ < 3.3V
//
// To change resistors: update only R1_OHMS and R2_OHMS below.
// All scaling is derived automatically.
#define VDIV_R1_OHMS        100000.0f   // Top resistor (V_BUS side), Ω  e.g. 100kΩ
#define VDIV_R2_OHMS        12000.0f    // Bottom resistor (GND side),  Ω  e.g. 12kΩ

// ADC reference voltage (ESP32-C3 with ADC_11db attenuation, nominally 3.3V)
// Trim this slightly if your readings are off — measure 3V3 pin with multimeter.
#define ADC_VREF_MV         3300.0f     // millivolts

// Derived constants (do not edit)
#define VDIV_RATIO          (VDIV_R2_OHMS / (VDIV_R1_OHMS + VDIV_R2_OHMS))
#define VDIV_SCALE          (1.0f / VDIV_RATIO)         // multiply ADC voltage → bus voltage
#define VDIV_MAX_BUS_V      (ADC_VREF_MV / 1000.0f * VDIV_SCALE)  // theoretical max measurable (V)

// Software voltage calibration offset — set to 0 initially, trim after measuring a known voltage
#define VDIV_OFFSET_V       0.0f        // additive correction in Volts

// ============================================================================
// DIGITAL POTENTIOMETER (DFR0520 — internally MCP42100, 256 taps, 100kΩ)
// ============================================================================

#define CMD_WRITE_POT0      0x11    // Write to potentiometer 0 (MCP42xxx opcode)
#define CMD_WRITE_POT1      0x12    // Write to potentiometer 1
#define CMD_SHUTDOWN_POT0   0x21    // Shutdown POT0 (A open, B+W shorted)

// Single-point hardware calibration (linear through origin assumed).
// HOW TO UPDATE: set wiper to POT_CAL_VALUE, let rider pedal steadily at constant
// cadence, note the stable watt reading → update POT_CAL_POWER.
#define POT_CAL_VALUE       30      // Wiper position used for calibration measurement
#define POT_CAL_POWER       120.0f  // Measured bus power at POT_CAL_VALUE (W)

// Derived slope:  wiper_per_watt = POT_CAL_VALUE / POT_CAL_POWER
// → wiper(P) = P * (POT_CAL_VALUE / POT_CAL_POWER)
// This is identical to the old formula and preserves the same ceiling at wiper=50 for 200W.
#define POT_WATTS_TO_WIPER_SLOPE  ((float)POT_CAL_VALUE / POT_CAL_POWER)

// Hard limits
#define POT_MIN             0       // Minimum wiper
#define POT_MAX             255     // Hardware maximum (MCP42100 has 256 taps, never actually sent)
#define POT_SAFE_MAX        ((int)(HILL_POWER_TARGET * POT_WATTS_TO_WIPER_SLOPE))  // = old POT_MAX (50 at current cal)

// Initial wiper on boot (flat road target)
#define POT_INITIAL         ((int)(FLAT_POWER_TARGET * POT_WATTS_TO_WIPER_SLOPE))

// Button step: ~10 equal steps across usable range (POT_MIN → POT_SAFE_MAX)
#define POT_STEP            ((int)(POT_SAFE_MAX / 10))

// ============================================================================
// ENOCEAN BUTTON (BLE)
// ============================================================================

// Target MAC: E2:15:00:00:61:F1
#define ENOCEAN_MAC_0       0xE2
#define ENOCEAN_MAC_1       0x15
#define ENOCEAN_MAC_2       0x00
#define ENOCEAN_MAC_3       0x00
#define ENOCEAN_MAC_4       0x61
#define ENOCEAN_MAC_5       0xF1

#define BTN_PLUS_MASK       0x08    // byte[6] & 0xFE == 0x08
#define BTN_MINUS_MASK      0x10    // byte[6] & 0xFE == 0x10

// ============================================================================
// PHYSICS SIMULATION PARAMETERS
// ============================================================================

#define FLAT_POWER_TARGET       50.0f   // Max power on flat ground (W)
#define HILL_POWER_TARGET       200.0f  // Max power capability (W) - 120W battery + 2x40W halogen
#define MAX_SIMULATED_GRADE     12.5f   // Maximum grade we can simulate (%)
#define SPEED_POWER_COEFF       4.0f    // Speed = coeff  (power), tuned for ~18 km/h at 100W
#define GRADE_SPEED_PENALTY     2.5f    // km/h lost per 1% grade
#define CADENCE_SMOOTH_FACTOR   0.15f   // Cadence smoothing (0-1, lower=smoother)

// ============================================================================
// POWER & RESISTANCE MAPPING
// ============================================================================

#define POWER_PER_GRADE_PERCENT 8.0f    // Watts gained per 1% grade increase
#define ERG_MODE_POWER_MARGIN   5.0f    // Extra 5W capacity in ERG mode

// ============================================================================
// UPDATE RATES & TIMING
// ============================================================================

#define BIKE_DATA_UPDATE_MS     100     // Update bike data every 100ms
#define BLE_NOTIFY_INTERVAL_MS  500     // Send BLE notifications every 500ms (2 Hz)
#define STATUS_LOG_INTERVAL_MS  10000   // Status dump every 10 seconds
#define SCAN_RESTART_INTERVAL_MS 1000   // Restart button scan every second
#define HEARTBEAT_INTERVAL_MS   10000   // Heartbeat when waiting for connection

// ============================================================================
// BLE DEVICE NAME
// ============================================================================

#define BLE_DEVICE_NAME         "ESP32 Bike Trainer"
#define BLE_APPEARANCE          0x0485  // Generic Cycling device

// ============================================================================
// FTMS SERVICE UUIDS
// ============================================================================

#define FITNESSMACHINE_SERVICE_UUID              "00001826-0000-1000-8000-00805f9b34fb"
#define FITNESSMACHINE_FEATURE_UUID              "00002acc-0000-1000-8000-00805f9b34fb"
#define INDOOR_BIKE_DATA_UUID                    "00002ad2-0000-1000-8000-00805f9b34fb"
#define TRAINING_STATUS_UUID                     "00002ad3-0000-1000-8000-00805f9b34fb"
#define SUPPORTED_RESISTANCE_LEVEL_RANGE_UUID    "00002ad6-0000-1000-8000-00805f9b34fb"
#define SUPPORTED_POWER_RANGE_UUID               "00002ad8-0000-1000-8000-00805f9b34fb"
#define FITNESS_MACHINE_CONTROL_POINT_UUID       "00002ad9-0000-1000-8000-00805f9b34fb"
#define FITNESS_MACHINE_STATUS_UUID              "00002ada-0000-1000-8000-00805f9b34fb"

// ============================================================================
// FTMS FEATURE FLAGS
// ============================================================================

// Indoor Bike Data flags (FTMS spec, section 4.9.1):
//   Bit 1 (0x0002) = More Data (set = speed NOT present — leave 0 to include speed)
//   Bit 2 (0x0004) = Instantaneous Cadence present
//   Bit 5 (0x0020) = Instantaneous Power present
// 0x0044 was WRONG (bit 6 = Average Power, not instantaneous).
// Correct value for speed + instantaneous cadence + instantaneous power = 0x0024.
#define FTMS_FLAGS_CADENCE_POWER    0x0024  // Instantaneous Cadence (bit2) + Instantaneous Power (bit5)

// ============================================================================
// FTMS SUPPORTED RANGES
// ============================================================================

#define FTMS_RESISTANCE_MIN     0
#define FTMS_RESISTANCE_MAX     100
#define FTMS_RESISTANCE_INC     1

#define FTMS_POWER_MIN          0
#define FTMS_POWER_MAX          200
#define FTMS_POWER_INC          1

#endif // CONFIG_H