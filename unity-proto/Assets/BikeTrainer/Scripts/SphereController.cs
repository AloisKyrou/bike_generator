using UnityEngine;

[RequireComponent(typeof(Renderer))]
[RequireComponent(typeof(Rigidbody))]
public class SphereController : MonoBehaviour
{
    [Tooltip("Forward speed in units/second per watt")]
    public float SpeedScale = 0.04f;

    Rigidbody _rb;

    void Start()
    {
        _rb = GetComponent<Rigidbody>();
        // Only allow rolling on the X axis — no wobble sideways
        _rb.constraints = RigidbodyConstraints.FreezeRotationY
                        | RigidbodyConstraints.FreezeRotationZ
                        | RigidbodyConstraints.FreezePositionX;

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
        _rb.velocity = new Vector3(0f, _rb.velocity.y, speed);

        // Spin the ball at the correct angular speed for its size
        _rb.angularVelocity = new Vector3(speed / radius, 0f, 0f);
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