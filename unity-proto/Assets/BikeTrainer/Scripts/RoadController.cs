using UnityEngine;

/// Attach to the Plane.
/// - Paints a procedural road texture (dark asphalt + dashed white centre line)
/// - Scrolls the texture forward based on bike speed (visual motion feedback)
/// - Repositions the plane to always stay under the sphere (endless road)
public class RoadController : MonoBehaviour
{
    [Tooltip("The sphere to follow")]
    public Transform Sphere;

    Material _mat;
    float    _uvOffset;

    // Texture resolution & road layout
    const int   TEX_W       = 256;   // width  (across road)
    const int   TEX_H       = 512;   // height (along road) — taller = longer dash repeat
    const float ASPHALT_V   = 0.18f; // grey value for road surface
    const int   LINE_W      = 8;     // dash width in pixels
    const int   DASH_ON     = 80;    // pixels of white dash
    const int   DASH_OFF    = 80;    // pixels of gap

    void Start()
    {
        _mat = BuildRoadMaterial();
        GetComponent<Renderer>().material = _mat;
    }

    void Update()
    {
        // Scroll texture at current bike speed (speed in km/h, convert to units/sec feel)
        float speedKmh = BikeManager.Instance.LastData.SpeedKmh;
        float scrollSpeed = speedKmh * 0.004f;   // tune: higher = faster scroll
        _uvOffset -= scrollSpeed * Time.deltaTime;

        _mat.mainTextureOffset = new Vector2(0f, _uvOffset);

        // Keep plane centred under sphere on Z so road never ends
        if (Sphere != null)
        {
            var p = transform.position;
            transform.position = new Vector3(p.x, p.y, Sphere.position.z);
        }
    }

    Material BuildRoadMaterial()
    {
        var tex = new Texture2D(TEX_W, TEX_H, TextureFormat.RGB24, false);
        tex.wrapMode = TextureWrapMode.Repeat;

        int centerX = TEX_W / 2;

        for (int y = 0; y < TEX_H; y++)
        {
            bool dashOn = (y % (DASH_ON + DASH_OFF)) < DASH_ON;

            for (int x = 0; x < TEX_W; x++)
            {
                Color c;

                // Asphalt base with subtle edge shading
                float edgeFade = 1f - Mathf.Pow(Mathf.Abs((x - centerX) / (float)centerX), 3f) * 0.35f;
                c = new Color(ASPHALT_V * edgeFade, ASPHALT_V * edgeFade, ASPHALT_V * edgeFade);

                // White dashed centre line
                bool onLine = Mathf.Abs(x - centerX) <= LINE_W / 2;
                if (onLine && dashOn)
                    c = new Color(0.95f, 0.95f, 0.95f);

                tex.SetPixel(x, y, c);
            }
        }
        tex.Apply();

        var mat = new Material(Shader.Find("Standard"));
        mat.mainTexture = tex;

        // Tile the texture so the plane looks like a road (not one giant tile)
        mat.mainTextureScale = new Vector2(1f, 6f);

        // Kill specular shine — asphalt is matte
        mat.SetFloat("_Smoothness", 0.05f);
        mat.SetFloat("_Metallic",   0f);

        return mat;
    }
}
