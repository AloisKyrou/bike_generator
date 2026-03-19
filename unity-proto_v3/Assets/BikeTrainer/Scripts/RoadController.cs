using UnityEngine;

/// Attach to the Plane GameObject.
///
/// Two responsibilities:
///   1. Parent Plane — renderer hidden, MeshCollider kept for sphere physics.
///      Tilts and elevates each frame to match the current grade so the sphere
///      rolls/sits correctly.
///   2. "RoadRibbon" sibling GO — a single procedural mesh whose vertices are
///      positioned by integrating upcoming route grades, giving a live preview
///      of the hill or descent ahead.
public class RoadController : MonoBehaviour
{
    [Tooltip("The sphere to follow")]
    public Transform Sphere;

    [Header("Road Ribbon")]
    [Tooltip("Segments rendered behind the rider")]
    public int   BackSegments = 8;
    [Tooltip("Segments rendered ahead — these show the upcoming climb/descent")]
    public int   ForwardSegments = 32;
    [Tooltip("World-unit length of each segment (≈ metres at default scene scale)")]
    public float SegmentWorldLength = 4f;
    [Tooltip("Road width in world units")]
    public float RoadWidth = 5f;
    [Tooltip("How many route-metres each forward segment represents when sampling grades")]
    public float LookaheadMetresPerSegment = 20f;
    [Tooltip("Multiply grade height — 1 = physically accurate, >1 = exaggerated hills")]
    public float GradeVerticalScale = 1f;
    [Tooltip("How many texture tiles appear over the full ribbon length")]
    public float VTilesOverRibbon = 8f;

    [Header("Physics Plane Smoothing")]
    [Tooltip("Smoothing time for the physics plane grade tilt (seconds)")]
    public float GradeSmoothTime = 1.5f;

    // ── internal state ────────────────────────────────────────────────────────
    Material  _mat;
    float     _uvOffset;
    float     _elevationY;    // accumulated road elevation under rider
    float     _smoothedGrade;
    float     _gradeVel;

    Mesh      _ribbonMesh;
    Vector3[] _verts;         // pre-allocated, reused every frame (no GC allocs)
    Vector2[] _uvs;
    float[]   _ys;            // per-slice heights, pre-allocated

    // ── texture constants ─────────────────────────────────────────────────────
    const int   TEX_W     = 256;
    const int   TEX_H     = 512;
    const float ASPHALT_V = 0.18f;
    const int   LINE_W    = 8;
    const int   DASH_ON   = 80;
    const int   DASH_OFF  = 80;

    const float MIN_FORWARD_VISUAL_LENGTH = 120f;
    const float MIN_TOTAL_VISUAL_LENGTH   = 160f;

    void Start()
    {
        _mat = BuildRoadMaterial();

        EnsureReasonableRibbonLength();

        // ── physics plane: hide renderer, keep MeshCollider ───────────────────
        var rend = GetComponent<Renderer>();
        if (rend != null) rend.enabled = false;

        // ── visual ribbon: sibling GO at scene root ───────────────────────────
        var ribbonGO = new GameObject("RoadRibbon");

        _ribbonMesh = new Mesh { name = "RoadRibbon" };
        ribbonGO.AddComponent<MeshFilter>().mesh = _ribbonMesh;

        var mr = ribbonGO.AddComponent<MeshRenderer>();
        mr.material          = _mat;
        mr.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
        mr.receiveShadows    = false;

        // ── pre-allocate per-frame arrays ─────────────────────────────────────
        int totalSegs = BackSegments + ForwardSegments;
        int slices    = totalSegs + 1;

        _verts = new Vector3[slices * 2];
        _uvs   = new Vector2[slices * 2];
        _ys    = new float  [slices];

        // Triangles: topology is fixed, only vertex positions change each frame.
        // Winding (clockwise from above) → normal points upward.
        //   lb = i*2        rb = i*2+1
        //   lt = (i+1)*2    rt = (i+1)*2+1
        var tris = new int[totalSegs * 6];
        for (int i = 0; i < totalSegs; i++)
        {
            int lb = i * 2,         rb = i * 2 + 1;
            int lt = (i + 1) * 2,   rt = (i + 1) * 2 + 1;
            int t  = i * 6;
            tris[t]     = lb; tris[t + 1] = lt; tris[t + 2] = rb;
            tris[t + 3] = rb; tris[t + 4] = lt; tris[t + 5] = rt;
        }

        _ribbonMesh.vertices  = _verts;
        _ribbonMesh.uv        = _uvs;
        _ribbonMesh.triangles = tris;
    }

    void EnsureReasonableRibbonLength()
    {
        BackSegments       = Mathf.Max(4, BackSegments);
        ForwardSegments    = Mathf.Max(8, ForwardSegments);
        SegmentWorldLength = Mathf.Max(0.5f, SegmentWorldLength);

        float forwardLen = ForwardSegments * SegmentWorldLength;
        if (forwardLen < MIN_FORWARD_VISUAL_LENGTH)
            ForwardSegments = Mathf.CeilToInt(MIN_FORWARD_VISUAL_LENGTH / SegmentWorldLength);

        float totalLen = (BackSegments + ForwardSegments) * SegmentWorldLength;
        if (totalLen < MIN_TOTAL_VISUAL_LENGTH)
        {
            int neededSegs = Mathf.CeilToInt(MIN_TOTAL_VISUAL_LENGTH / SegmentWorldLength);
            BackSegments = Mathf.Max(4, neededSegs - ForwardSegments);
        }
    }

    void Update()
    {
        if (BikeManager.Instance == null) return;

        float speedKmh = BikeManager.Instance.LastData.SpeedKmh;
        float speedMs  = speedKmh / 3.6f;

        // Scroll texture toward the rider so the road feels like moving backward under the bike.
        _uvOffset += speedKmh * 0.004f * Time.deltaTime;

        // Smooth grade for physics plane (avoids jarring tilt changes)
        float grade = RouteController.Instance != null ? RouteController.Instance.CurrentGrade : 0f;
        _smoothedGrade = Mathf.SmoothDamp(_smoothedGrade, grade, ref _gradeVel, GradeSmoothTime);

        // Integrate elevation under the rider
        _elevationY += (_smoothedGrade / 100f) * speedMs * Time.deltaTime * GradeVerticalScale;

        // Reposition and tilt the hidden physics plane
        if (Sphere != null)
        {
            float gradeAngle      = Mathf.Atan(_smoothedGrade / 100f) * Mathf.Rad2Deg;
            transform.position    = new Vector3(0f, _elevationY, Sphere.position.z);
            transform.eulerAngles = new Vector3(-gradeAngle, 0f, 0f);
        }

        RebuildRibbon();
    }

    void RebuildRibbon()
    {
        if (_ribbonMesh == null || Sphere == null) return;

        float currentDist = RouteController.Instance != null
            ? RouteController.Instance.CurrentDistanceM : 0f;

        float halfW     = RoadWidth * 0.5f;
        float baseZ     = Sphere.position.z;
        int   totalSegs = BackSegments + ForwardSegments;
        int   slices    = totalSegs + 1;
        float vPerSlice = VTilesOverRibbon / totalSegs;

        // ── compute Y for every slice ─────────────────────────────────────────
        //   Slice [BackSegments]     = rider position = _elevationY
        //   Forward slices [Back+1 … end]: integrate sampled future grades
        //   Backward slices [0 … Back-1]: back-project using current smoothed grade

        _ys[BackSegments] = _elevationY;

        float yFwd = _elevationY;
        for (int i = BackSegments + 1; i < slices; i++)
        {
            float dist = currentDist + (i - BackSegments) * LookaheadMetresPerSegment;
            float g    = RouteController.Instance != null
                ? RouteController.Instance.SampleGrade(dist) : 0f;
            yFwd  += (g / 100f) * SegmentWorldLength * GradeVerticalScale;
            _ys[i] = yFwd;
        }

        float yBack = _elevationY;
        for (int i = BackSegments - 1; i >= 0; i--)
        {
            yBack  -= (_smoothedGrade / 100f) * SegmentWorldLength * GradeVerticalScale;
            _ys[i]  = yBack;
        }

        // ── fill vertex + UV arrays ───────────────────────────────────────────
        //   U : 0 = left edge → 1 = right edge  (center dash sits at U = 0.5)
        //   V : increases toward front + scrolling offset applied here
        for (int i = 0; i < slices; i++)
        {
            float z = baseZ + (i - BackSegments) * SegmentWorldLength;
            float v = i * vPerSlice + _uvOffset;

            _verts[i * 2]     = new Vector3(-halfW, _ys[i], z);
            _verts[i * 2 + 1] = new Vector3( halfW, _ys[i], z);
            _uvs  [i * 2]     = new Vector2(0f, v);
            _uvs  [i * 2 + 1] = new Vector2(1f, v);
        }

        _ribbonMesh.vertices = _verts;
        _ribbonMesh.uv       = _uvs;
        _ribbonMesh.RecalculateNormals();
        _ribbonMesh.RecalculateBounds();
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
                float edgeFade = 1f - Mathf.Pow(Mathf.Abs((x - centerX) / (float)centerX), 3f) * 0.35f;
                var   c        = new Color(ASPHALT_V * edgeFade, ASPHALT_V * edgeFade, ASPHALT_V * edgeFade);

                // White dashed centre line
                if (Mathf.Abs(x - centerX) <= LINE_W / 2 && dashOn)
                    c = new Color(0.95f, 0.95f, 0.95f);

                tex.SetPixel(x, y, c);
            }
        }
        tex.Apply();

        var mat = new Material(Shader.Find("Standard"));
        mat.mainTexture      = tex;
        mat.mainTextureScale = new Vector2(1f, 1f); // tiling handled per-vertex via UVs
        mat.SetFloat("_Smoothness", 0.05f);
        mat.SetFloat("_Metallic",   0f);
        return mat;
    }
}
