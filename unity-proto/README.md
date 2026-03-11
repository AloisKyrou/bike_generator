# Unity Proto — ESP32 Bike Trainer Integration

Drop-in Unity project for connecting to the ESP32 Bike Trainer over BLE.  
Receives live power / speed / cadence and sends resistance / ERG / grade commands — no BLE library needed in Unity.

---

## 🚀 Tutorial — First Launch

### Step 1 — Install Python + bleak

You need a real Python installation (not the Microsoft Store stub).

**Check which Python you have:**
```
where python
```
If the result is `C:\Users\AppData\Local\Microsoft\WindowsApps\python.exe` → that's the stub, use the path below instead.

**Find your real Python** — look for one of these:
- `C:\Users\yourname\miniconda3\python.exe`  ← miniconda (recommended)
- `C:\Users\yourname\AppData\Local\Programs\Python\Python3xx\python.exe`  ← standard install
- `py` ← Windows Python Launcher (works if you installed Python from python.org)

**Install bleak into that Python:**
```
C:\Users\yourname\miniconda3\python.exe -m pip install bleak
```

---

### Step 2 — Open the project in Unity Hub

1. Open **Unity Hub**
2. Click **Open → Add project from disk**
3. Browse to this folder (`unity-proto/`) → click **Select Folder**
4. Unity Hub will show the project — click it to open (Unity 2022.3 LTS required)
5. Wait for Unity to import assets (~1 min first time)

---

### Step 3 — Open the demo scene

In Unity, in the **Project** panel at the bottom:
- Navigate to `Assets → Scenes`
- Double-click **BikeDemo** to open it

You should see in the Hierarchy: `BikeManager`, `PlayerSphere`, `Plane`, `Main Camera`, `Canvas`.

---

### Step 4 — Set your Python path

1. In the Hierarchy, click **BikeManager**
2. In the Inspector on the right, find the **BikeManager** component
3. Find the field **Python Executable**
4. Replace the default value with your full Python path, e.g.:  
   `C:\Users\yourname\miniconda3\python.exe`

---

### Step 5 — Turn on Bluetooth

Windows Settings → **Bluetooth & devices** → **Bluetooth → On**

---

### Step 6 — Hit Play

Click the ▶ Play button at the top of Unity.  
Watch the **Console** panel (bottom). You should see:

```
[Bike] State -> Connecting
[Bike] Bridge launched (PID xxxxx) — waiting for data...
[bridge] Scanning for 'ESP32 Bike Trainer'...
[bridge] Found ESP32 Bike Trainer (...) — connecting...
[bridge] Ready — streaming to Unity :5700
[Bike] Connected!
[Bike] 20W  12.5 km/h  55 rpm
```

The sphere will start rolling when you pedal.

---

## 🔧 Troubleshooting

**`bleak not installed` in Console**  
→ Python found but bleak missing. Run: `C:\path\to\python.exe -m pip install bleak`

**`Could not launch bridge` in Console**  
→ Python Executable path is wrong. Double-check Step 4.

**`Bluetooth radio is not powered on`**  
→ Do Step 5 — turn on Bluetooth in Windows Settings.

**Bridge launches but bike not found**  
→ ESP32 not powered or not advertising. Check the bike is on.

**Connected but numbers stuck at 0**  
→ Stop Play, check the bike is actually transmitting (serial monitor on ESP32).

**Grade feels wrong / stuck**  
→ Normal for up to 2s after Play starts — RouteController resets to 0 on Start then takes over.

---

## 📖 Technical Reference

### Architecture

```
ESP32 Bike Trainer
      │
      │ BLE (FTMS)
      ▼
bike_bridge.py          ← Python bridge, auto-launched by Unity
      │         ▲
      │ UDP 5700│ UDP 5701
      ▼         │
  BikeManager.cs        ← Unity singleton
```

### BikeManager API

```csharp
// Read live data
BikeData data = BikeManager.Instance.LastData;
Debug.Log($"{data.PowerWatts}W  {data.SpeedKmh} km/h  {data.CadenceRpm} rpm");

// Subscribe to events
BikeManager.Instance.OnBikeData.AddListener(d => { /* called ~1Hz */ });
BikeManager.Instance.OnConnected.AddListener(() => Debug.Log("Connected!"));

// Connect / disconnect
BikeManager.Instance.Connect();
BikeManager.Instance.Disconnect();

// Send commands
BikeManager.Instance.SetGrade(5.0f);        // Simulation: 5% grade
BikeManager.Instance.SetTargetPower(150);   // ERG: hold 150W
BikeManager.Instance.SetResistance(50);     // Manual: 50% resistance
```

### UDP Packet Format

| Direction | Port | Format |
|---|---|---|
| Bridge → Unity | 5700 | `[speed u16 ×100][cadence u16 ×2][power i16]` — 6 bytes LE |
| Unity → Bridge | 5701 | `[opcode][param_low][param_high]` — 3 bytes |

Opcodes: `0x04` = resistance (0–100), `0x05` = ERG watts (int16 LE), `0x11` = grade ×100 (int16 LE)

### Demo Scripts

| Script | Purpose |
|---|---|
| `BikeManager.cs` | Core singleton — BLE bridge + UDP + events. **Always needed.** |
| `BikeDemo.cs` | Wires TMP_Text labels to live data + Connect/Disconnect buttons |
| `BikeHUD.cs` | Fallback OnGUI HUD — no Canvas needed, just add to any GameObject |
| `SphereController.cs` | Moves + rolls a sphere based on power output |
| `CameraFollow.cs` | Smooth third-person camera follow |
| `RoadController.cs` | Procedural road texture with scrolling dashes |
| `RouteController.cs` | Scripted grade route (Zwift-style), sends grade commands automatically |

All demo scripts except `BikeManager.cs` are optional — delete them and build your own.

### Using BikeManager in Your Own Scene

The only required GameObject is `BikeManager`:

```
Hierarchy → Create Empty → rename "BikeManager" → Add Component → BikeManager
```

Set **Python Executable** in the Inspector, call `Connect()` from any script, done.

