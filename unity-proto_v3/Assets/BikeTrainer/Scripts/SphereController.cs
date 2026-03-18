using UnityEngine;

[RequireComponent(typeof(Renderer))]
[RequireComponent(typeof(Rigidbody))]
public class SphereController : MonoBehaviour
{
    [Tooltip("Forward speed in units/second per watt")]
    public float SpeedScale = 0.04f;

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

    void Start()
    {
        _rb = GetComponent<Rigidbody>();
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
        int watts      = BikeManager.Instance.LastData.PowerWatts;
        float speed    = watts * SpeedScale;               // units/sec
        float radius   = transform.localScale.x * 0.5f;   // sphere radius

        // Drive forward; keep Y velocity so gravity / bounce still work
        _rb.linearVelocity = new Vector3(0f, _rb.linearVelocity.y, speed);

        // Spin the ball at the correct angular speed for its size
        _rb.angularVelocity = new Vector3(speed / radius, 0f, 0f);

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