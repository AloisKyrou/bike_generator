using UnityEngine;

/// Attach to the Plane.
/// - Paints a procedural road texture (dark asphalt + dashed white centre line)
/// - Scrolls the texture forward based on bike speed (visual motion feedback)
/// - Repositions the plane to always stay under the sphere (endless road)
public class RoadController : MonoBehaviour
{
    [Tooltip("The sphere to follow")]
    public Transform Sphere;

    [Header("Hill Feel")]
    [Tooltip("Smoothing time for grade-driven tilt (seconds)")]
    public float GradeSmoothTime = 1.5f;
    [Tooltip("Multiply elevation accumulation — 1 = realistic, higher = exaggerated visual")]
    public float ElevationScale = 1f;

    Material _mat;
    float    _uvOffset;
    float    _elevationY;
    float    _smoothedGrade;
    float    _gradeVel;

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
        if (BikeManager.Instance == null) return;

        // Scroll texture at current bike speed (speed in km/h, convert to units/sec feel)
        float speedKmh    = BikeManager.Instance.LastData.SpeedKmh;
        float scrollSpeed = speedKmh * 0.004f;   // tune: higher = faster scroll
        _uvOffset -= scrollSpeed * Time.deltaTime;
        _mat.mainTextureOffset = new Vector2(0f, _uvOffset);

        // Grade-driven tilt and elevation
        // The sphere is Z-frozen so it always sits at the road's center pivot —
        // rotating the plane doesn't shift the contact point, so no physics shake.
        float grade = RouteController.Instance != null ? RouteController.Instance.CurrentGrade : 0f;
        _smoothedGrade = Mathf.SmoothDamp(_smoothedGrade, grade, ref _gradeVel, GradeSmoothTime);

        float gradeAngle = Mathf.Atan(_smoothedGrade / 100f) * Mathf.Rad2Deg;
        float speedMs    = speedKmh / 3.6f;
        _elevationY += (_smoothedGrade / 100f) * speedMs * Time.deltaTime * ElevationScale;

        // Keep plane centred under sphere on Z, tilt to grade, raise/lower to elevation
        if (Sphere != null)
        {
            transform.position    = new Vector3(0f, _elevationY, Sphere.position.z);
            transform.eulerAngles = new Vector3(-gradeAngle, 0f, 0f);
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
