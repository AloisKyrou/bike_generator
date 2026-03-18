/// BikeManager.cs
/// Connects to the ESP32 Bike Trainer via a Python BLE bridge (bike_bridge.py).
/// Unity auto-launches the bridge on Connect(). No BLE libs needed in Unity.
///
/// Architecture:
///   bike_bridge.py  â”€â”€BLEâ”€â”€>  ESP32 Bike Trainer
///   bike_bridge.py  â”€â”€UDP 5700â”€â”€>  BikeManager  (data: speed, cadence, power)
///   BikeManager     â”€â”€UDP 5701â”€â”€>  bike_bridge.py  (commands: resistance/ERG/grade)
///
/// The bridge script lives in:  Assets/StreamingAssets/BikeTrainer/bike_bridge.py
/// Requires Python 3.8+ and bleak:  pip install bleak

using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using UnityEngine;
using UnityEngine.Events;

[Serializable] public class BikeDataEvent  : UnityEvent<BikeData> {}
[Serializable] public class BikeStateEvent : UnityEvent<BikeManager.ConnectionState> {}

[Serializable]
public struct BikeData
{
    public float SpeedKmh;
    public float CadenceRpm;
    public int   PowerWatts;
    public override string ToString() =>
        $"{PowerWatts}W  {SpeedKmh:F1} km/h  {CadenceRpm:F0} rpm";
}

public class BikeManager : MonoBehaviour
{
    const int DATA_PORT = 5700;  // bridge â†’ Unity
    const int CMD_PORT  = 5701;  // Unity  â†’ bridge
    const string PYTHON_PREF_KEY = "BikeTrainer.PythonExecutable";

    public enum ConnectionState { Idle, Connecting, Connected, Disconnected }

    [Header("Bridge")]
    [Tooltip("Override path to bike_bridge.py. Leave empty to use StreamingAssets.")]
    public string BridgeScriptPath = "";
    [Tooltip("Python executable name or full path. 'py' uses the Windows Python Launcher (recommended).")]
    public string PythonExecutable = "py";

    [Header("Events")]
    public UnityEvent     OnConnected;
    public UnityEvent     OnDisconnected;
    public BikeDataEvent  OnBikeData;
    public BikeStateEvent OnStateChanged;

    public static BikeManager Instance { get; private set; }
    public ConnectionState State { get; private set; } = ConnectionState.Idle;
    public BikeData LastData { get; private set; }

    UdpClient _receiver;
    UdpClient _sender;
    Thread    _receiveThread;
    Process   _bridge;
    volatile bool _running;
    volatile bool _everConnected;

    readonly ConcurrentQueue<Action> _mainQueue = new ConcurrentQueue<Action>();

    // â”€â”€ Unity lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    void Awake()
    {
        if (Instance != null && Instance != this) { Destroy(gameObject); return; }
        Instance = this;
        DontDestroyOnLoad(gameObject);
        ApplyPythonExecutableOverride();

        // Force decent rendering on any hardware (integrated GPU, no discrete card)
        QualitySettings.SetQualityLevel(QualitySettings.names.Length - 1, applyExpensiveChanges: true);
        QualitySettings.antiAliasing = 2;
        QualitySettings.anisotropicFiltering = AnisotropicFiltering.ForceEnable;
    }

    void Update()
    {
        while (_mainQueue.TryDequeue(out var action)) action?.Invoke();
    }

    void OnDestroy() => Disconnect();

    // â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    public void Connect()
    {
        if (State == ConnectionState.Connecting || State == ConnectionState.Connected) return;

        SetState(ConnectionState.Connecting);
        _everConnected = false;

        string scriptPath = string.IsNullOrEmpty(BridgeScriptPath)
            ? System.IO.Path.Combine(Application.streamingAssetsPath, "BikeTrainer", "bike_bridge.py")
            : BridgeScriptPath;

        if (LooksLikePath(PythonExecutable) && !File.Exists(PythonExecutable))
        {
            UnityEngine.Debug.LogError($"[Bike] Python executable not found: {PythonExecutable}");
            SetState(ConnectionState.Idle);
            return;
        }

        try
        {
            _bridge = new Process();
            _bridge.StartInfo = new ProcessStartInfo
            {
                FileName               = PythonExecutable,
                Arguments              = $"\"{scriptPath}\"",
                UseShellExecute        = false,
                CreateNoWindow         = true,
                RedirectStandardOutput = true,
                RedirectStandardError  = true,
            };
            _bridge.OutputDataReceived += (_, e) => { if (e.Data != null) UnityEngine.Debug.Log($"[bridge] {e.Data}"); };
            _bridge.ErrorDataReceived  += (_, e) => { if (e.Data != null) UnityEngine.Debug.LogWarning($"[bridge] {e.Data}"); };
            _bridge.Start();
            _bridge.BeginOutputReadLine();
            _bridge.BeginErrorReadLine();
            UnityEngine.Debug.Log($"[Bike] Bridge launched (PID {_bridge.Id}) â€” waiting for data...");
        }
        catch (Exception e)
        {
            UnityEngine.Debug.LogError($"[Bike] Could not launch bridge: {e.Message}");
            SetState(ConnectionState.Idle);
            return;
        }

        _sender   = new UdpClient();
        _receiver = new UdpClient(new IPEndPoint(IPAddress.Loopback, DATA_PORT));
        _receiver.Client.ReceiveTimeout = 2000;
        _running  = true;

        _receiveThread = new Thread(ReceiveLoop) { IsBackground = true, Name = "BikeUDP" };
        _receiveThread.Start();
    }

    /// Set Python executable at runtime (optionally persisted across launches).
    public void SetPythonExecutable(string pythonPath, bool persist = true)
    {
        if (string.IsNullOrWhiteSpace(pythonPath)) return;
        PythonExecutable = pythonPath.Trim();
        if (persist)
        {
            PlayerPrefs.SetString(PYTHON_PREF_KEY, PythonExecutable);
            PlayerPrefs.Save();
        }
    }

    public void Disconnect()
    {
        _running = false;

        try { _receiver?.Close(); } catch { }
        try { _sender?.Close();   } catch { }
        _receiver = null;
        _sender   = null;

        if (_bridge != null && !_bridge.HasExited)
        {
            try { _bridge.Kill(); } catch { }
            _bridge.Dispose();
        }
        _bridge = null;

        if (_everConnected)
            _mainQueue.Enqueue(() => OnDisconnected?.Invoke());

        SetState(ConnectionState.Disconnected);
    }

    /// Manual mode â€” fixed resistance (0 = min, 100 = max).
    public void SetResistance(byte level)
        => SendCommand(new byte[] { 0x04, level, 0 });

    /// ERG mode â€” bike holds target wattage.
    public void SetTargetPower(short watts)
        => SendCommand(new byte[] { 0x05, (byte)(watts & 0xFF), (byte)((watts >> 8) & 0xFF) });

    /// Simulation mode â€” resistance from road slope (-20 to +20 %).
    public void SetGrade(float gradePercent)
    {
        short raw = (short)Mathf.RoundToInt(gradePercent * 100f);
        SendCommand(new byte[] { 0x11, (byte)(raw & 0xFF), (byte)((raw >> 8) & 0xFF) });
    }

    // â”€â”€ Internals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    void SendCommand(byte[] payload)
    {
        if (_sender == null) return;
        try { _sender.Send(payload, payload.Length, "127.0.0.1", CMD_PORT); }
        catch (Exception e) { UnityEngine.Debug.LogWarning($"[Bike] Send error: {e.Message}"); }
    }

    void ReceiveLoop()
    {
        var ep = new IPEndPoint(IPAddress.Any, 0);

        while (_running)
        {
            try
            {
                byte[] bytes = _receiver.Receive(ref ep);
                if (bytes.Length < 6) continue;

                var data = new BikeData
                {
                    SpeedKmh   = BitConverter.ToUInt16(bytes, 0) / 100f,
                    CadenceRpm = BitConverter.ToUInt16(bytes, 2) / 2f,
                    PowerWatts = BitConverter.ToInt16(bytes, 4),
                };

                _mainQueue.Enqueue(() =>
                {
                    LastData = data;

                    if (!_everConnected)
                    {
                        _everConnected = true;
                        SetState(ConnectionState.Connected);
                        OnConnected?.Invoke();
                    }

                    OnBikeData?.Invoke(data);
                });
            }
            catch (SocketException) { /* receive timeout â€” normal, keep looping */ }
            catch (ObjectDisposedException) { break; }
            catch (Exception e)
            {
                if (_running)
                    _mainQueue.Enqueue(() => UnityEngine.Debug.LogWarning($"[Bike] Receive error: {e.Message}"));
            }
        }
    }

    void SetState(ConnectionState s)
    {
        State = s;
        _mainQueue.Enqueue(() => OnStateChanged?.Invoke(s));
        UnityEngine.Debug.Log($"[Bike] State -> {s}");
    }

    void ApplyPythonExecutableOverride()
    {
        string argPath = TryGetArgValue("--python");
        if (!string.IsNullOrWhiteSpace(argPath))
        {
            SetPythonExecutable(argPath, persist: true);
            UnityEngine.Debug.Log($"[Bike] Python executable from CLI: {PythonExecutable}");
            return;
        }

        string savedPath = PlayerPrefs.GetString(PYTHON_PREF_KEY, "");
        if (!string.IsNullOrWhiteSpace(savedPath))
        {
            PythonExecutable = savedPath;
            UnityEngine.Debug.Log($"[Bike] Python executable from saved settings: {PythonExecutable}");
        }
    }

    static bool LooksLikePath(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        return value.Contains("\\") || value.Contains("/") || value.Contains(":");
    }

    static string TryGetArgValue(string key)
    {
        string[] args = Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length; i++)
        {
            string arg = args[i];

            if (arg.Equals(key, StringComparison.OrdinalIgnoreCase) && i + 1 < args.Length)
                return args[i + 1].Trim('"');

            if (arg.StartsWith(key + "=", StringComparison.OrdinalIgnoreCase))
                return arg.Substring(key.Length + 1).Trim('"');
        }
        return "";
    }
}
