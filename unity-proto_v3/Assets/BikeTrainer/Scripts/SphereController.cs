using UnityEngine;

[RequireComponent(typeof(Renderer))]
[RequireComponent(typeof(Rigidbody))]
public class SphereController : MonoBehaviour
{
    [Header("Speed Mapping")]
    [Tooltip("When enabled, spin follows trainer speed (km/h) using omega = v / r")]
    public bool UseTrainerSpeedForSpin = true;

    [Tooltip("Conversion from metres to world units (1 = 1 Unity unit per metre)")]
    public float WorldUnitsPerMeter = 1f;

    [Tooltip("Fallback mode only: speed in units/second per watt")]
    public float SpeedScale = 0.04f;

    [Tooltip("Max allowed angular speed (rad/s). Increase so spin is not clamped by Unity default.")]
    public float MaxAngularVelocity = 80f;

    [Header("Debug")]
    [Tooltip("Log target vs actual sphere rotation speed in the Console")]
    public bool LogRotationDebug = false;

    [Tooltip("Seconds between rotation debug logs")]
    public float RotationLogInterval = 0.75f;

    [Header("Jump")]
    [Tooltip("Enable simple jump gameplay")]
    public bool EnableJump = true;

    [Tooltip("Vertical impulse applied when jumping")]
    public float JumpImpulse = 4.5f;

    [Tooltip("If enabled, jump automatically when power exceeds threshold")]
    public bool AutoJumpFromPower = true;

    [Tooltip("Auto-jump threshold in watts")]
    public int AutoJumpPowerThreshold = 160;

    [Tooltip("Minimum delay between two jumps")]
    public float JumpCooldown = 0.75f;

    [Tooltip("Ground check distance below sphere center")]
    public float GroundCheckDistance = 0.62f;

    Rigidbody _rb;
    float _lastJumpTime;
    float _nextRotationLogTime;

    const float RAD_PER_SEC_TO_RPM = 60f / (2f * Mathf.PI);

    void Start()
    {
        _rb = GetComponent<Rigidbody>();

        // Unity defaults this to 7 rad/s, which can clamp visible spin and make
        // SpeedScale changes appear to have little/no effect at moderate watts.
        _rb.maxAngularVelocity = MaxAngularVelocity;

        // Freeze X/Z position — sphere stays at scene centre, road scrolls past it
        _rb.constraints = RigidbodyConstraints.FreezeRotationY
                        | RigidbodyConstraints.FreezeRotationZ
                        | RigidbodyConstraints.FreezePositionX
                        | RigidbodyConstraints.FreezePositionZ;

        ApplyStripedMaterial();

        var bike = BikeManager.Instance;
        bike.OnStateChanged.AddListener(s => Debug.Log($"[Bike] State: {s}"));
        bike.OnConnected.AddListener(()    => Debug.Log("[Bike] Connected!"));
        bike.OnDisconnected.AddListener(() => Debug.Log("[Bike] Disconnected"));
        bike.Connect();
    }

    void FixedUpdate()
    {
        var bikeData   = BikeManager.Instance.LastData;
        int watts      = bikeData.PowerWatts;
        float speedMs  = Mathf.Max(0f, bikeData.SpeedKmh / 3.6f) * Mathf.Max(0.01f, WorldUnitsPerMeter);
        float speed    = UseTrainerSpeedForSpin ? speedMs : Mathf.Max(0, watts) * SpeedScale; // units/sec
        float radius   = transform.localScale.x * 0.5f;   // sphere radius
        float safeRad  = Mathf.Max(0.0001f, radius);
        float targetWx = speed / safeRad;

        // Drive forward; keep Y velocity so gravity / bounce still work
        _rb.linearVelocity = new Vector3(0f, _rb.linearVelocity.y, speed);

        // Spin the ball at the correct angular speed for its size
        _rb.angularVelocity = new Vector3(targetWx, 0f, 0f);

        if (LogRotationDebug && Time.time >= _nextRotationLogTime)
        {
            float actualWx   = _rb.angularVelocity.x;
            float targetRad  = Mathf.Abs(targetWx);
            float actualRad  = Mathf.Abs(actualWx);
            float targetRpm  = targetRad * RAD_PER_SEC_TO_RPM;
            float actualRpm  = actualRad * RAD_PER_SEC_TO_RPM;
            bool  isClamping = targetRad > (_rb.maxAngularVelocity - 0.05f);

            Debug.Log(
                $"[SphereRot] mode={(UseTrainerSpeedForSpin ? "trainer-speed" : "watts-scale")} " +
                $"kmh={bikeData.SpeedKmh:F1} watts={watts} speedScale={SpeedScale:F4} radius={radius:F3} " +
                $"target={targetRad:F2}rad/s ({targetRpm:F1}rpm) " +
                $"actual={actualRad:F2}rad/s ({actualRpm:F1}rpm) " +
                $"max={_rb.maxAngularVelocity:F2} clampLikely={isClamping}");

            _nextRotationLogTime = Time.time + Mathf.Max(0.1f, RotationLogInterval);
        }

        TryJump(watts);
    }

    void TryJump(int watts)
    {
        if (!EnableJump) return;
        if (Time.time - _lastJumpTime < JumpCooldown) return;
        if (!IsGrounded()) return;

        bool manualJump = Input.GetKey(KeyCode.Space);
        bool autoJump   = AutoJumpFromPower && watts >= AutoJumpPowerThreshold;
        if (!manualJump && !autoJump) return;

        _rb.linearVelocity = new Vector3(_rb.linearVelocity.x, 0f, _rb.linearVelocity.z);
        _rb.AddForce(Vector3.up * JumpImpulse, ForceMode.VelocityChange);
        _lastJumpTime = Time.time;
    }

    bool IsGrounded()
    {
        return Physics.Raycast(transform.position, Vector3.down, GroundCheckDistance);
    }

    // Generates a blue/white striped texture so the rolling is clearly visible.
    // Stripes run vertically on the UV map → become horizontal bands on the sphere.
    void ApplyStripedMaterial()
    {
        const int size   = 256;
        const int stripe = 32;
        var tex = new Texture2D(size, size);
        for (int y = 0; y < size; y++)
            for (int x = 0; x < size; x++)
                tex.SetPixel(x, y, (y / stripe) % 2 == 0 ? new Color(0.2f, 0.55f, 1f) : Color.white);
        tex.Apply();

        var mat = new Material(Shader.Find("Standard")) { mainTexture = tex };
        GetComponent<Renderer>().material = mat;
    }
}