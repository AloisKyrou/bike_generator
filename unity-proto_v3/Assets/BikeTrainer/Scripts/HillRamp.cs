using UnityEngine;

/// The simplest possible hill: three Plane segments (ramp up, summit, ramp down)
/// placed at a fixed world Z ahead of the sphere's spawn.
/// Sphere rolls up via Rigidbody + gravity — no scripted Y control needed.
///
/// Setup: Create Empty → Add HillRamp. Done.
/// Make sure the sphere's Plane collider and these ramp colliders are on the same layer
/// so Rigidbody physics sees them.
public class HillRamp : MonoBehaviour
{
    [Header("Position")]
    [Tooltip("World Z where the ramp starts")]
    public float StartZ = 60f;

    [Header("Ramp Shape")]
    [Tooltip("Grade of the climb in degrees (not %, actual angle). 8-15 feels like a real hill.")]
    public float AngleDegrees = 12f;

    [Tooltip("Length of the uphill ramp in world units")]
    public float RampLength = 80f;

    [Tooltip("Length of the flat summit")]
    public float SummitLength = 30f;

    [Tooltip("Length of the downhill")]
    public float DescentLength = 60f;

    [Tooltip("Descent angle (degrees, usually less steep than climb)")]
    public float DescentAngleDegrees = 8f;

    [Header("Width")]
    public float RoadWidth = 12f;

    void Start()
    {
        // How high does the ramp take us?
        float riseHeight = Mathf.Sin(AngleDegrees * Mathf.Deg2Rad) * RampLength;

        // ── Uphill ramp ───────────────────────────────────────────────────────
        float rampCentreZ = StartZ + RampLength * 0.5f * Mathf.Cos(AngleDegrees * Mathf.Deg2Rad);
        float rampCentreY = riseHeight * 0.5f;
        MakePlane("Ramp_Up", rampCentreX: 0, rampCentreY, rampCentreZ,
                  rotX: -AngleDegrees, length: RampLength);

        // ── Summit flat ───────────────────────────────────────────────────────
        float summitStartZ = StartZ + RampLength * Mathf.Cos(AngleDegrees * Mathf.Deg2Rad);
        float summitCentreZ = summitStartZ + SummitLength * 0.5f;
        MakePlane("Summit", 0, riseHeight, summitCentreZ, 0f, SummitLength);

        // ── Downhill ──────────────────────────────────────────────────────────
        float descentStartZ  = summitStartZ + SummitLength;
        float descentCentreZ = descentStartZ + DescentLength * 0.5f * Mathf.Cos(DescentAngleDegrees * Mathf.Deg2Rad);
        float descentCentreY = riseHeight - DescentLength * 0.5f * Mathf.Sin(DescentAngleDegrees * Mathf.Deg2Rad);
        MakePlane("Ramp_Down", 0, descentCentreY, descentCentreZ,
                  DescentAngleDegrees, DescentLength);
    }

    // Creates one Plane segment, rotated and positioned correctly.
    // rotX > 0 = front edge lower (descent). rotX < 0 = front edge higher (ascent).
    void MakePlane(string label, float rampCentreX, float y, float z, float rotX, float length)
    {
        var go = GameObject.CreatePrimitive(PrimitiveType.Plane);
        go.name = label;
        go.transform.SetParent(transform);

        // Unity Plane is 10×10 units by default — scale to desired dimensions
        go.transform.localScale    = new Vector3(RoadWidth / 10f, 1f, length / 10f);
        go.transform.position      = new Vector3(rampCentreX, y, z);
        go.transform.eulerAngles   = new Vector3(rotX, 0f, 0f);

        // Dark asphalt material
        var mat = new Material(Shader.Find("Standard"));
        mat.color = new Color(0.15f, 0.15f, 0.15f);
        mat.SetFloat("_Smoothness", 0.05f);
        go.GetComponent<Renderer>().material = mat;
    }
}
