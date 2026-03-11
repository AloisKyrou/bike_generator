using UnityEngine;

[RequireComponent(typeof(Renderer))]
public class CubeController : MonoBehaviour
{
    [Tooltip("Forward speed in units/second per watt")]
    public float SpeedScale = 0.04f;

    void Start()
    {
        ApplyStripedMaterial();

        var bike = BikeManager.Instance;
        bike.OnStateChanged.AddListener(s => Debug.Log($"[Bike] State: {s}"));
        bike.OnConnected.AddListener(()    => Debug.Log("[Bike] Connected!"));
        bike.OnDisconnected.AddListener(() => Debug.Log("[Bike] Disconnected"));
        bike.Connect();
    }

    void Update()
    {
        int watts   = BikeManager.Instance.LastData.PowerWatts;
        float dist  = watts * SpeedScale * Time.deltaTime;

        // Move forward in world space
        transform.Translate(Vector3.forward * dist, Space.World);

        // Roll: rotate around world X so it looks like rolling on the ground
        float radius    = transform.localScale.x * 0.5f;
        float rollDeg   = (dist / radius) * Mathf.Rad2Deg;
        transform.Rotate(rollDeg, 0f, 0f, Space.World);
    }

    // Generates a blue/white striped texture so the rolling is clearly visible
    void ApplyStripedMaterial()
    {
        const int size   = 256;
        const int stripe = 32;
        var tex = new Texture2D(size, size);
        for (int y = 0; y < size; y++)
            for (int x = 0; x < size; x++)
                tex.SetPixel(x, y, (x / stripe) % 2 == 0 ? new Color(0.2f, 0.55f, 1f) : Color.white);
        tex.Apply();

        var mat = new Material(Shader.Find("Standard")) { mainTexture = tex };
        GetComponent<Renderer>().material = mat;
    }
}