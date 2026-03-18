using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    [Tooltip("The sphere/object to follow")]
    public Transform Target;

    [Tooltip("Camera position relative to the target")]
    public Vector3 Offset = new Vector3(0f, 4f, -10f);

    [Tooltip("How quickly the camera catches up (lower = smoother)")]
    public float SmoothTime = 0.25f;

    [Header("Grade Feel")]
    [Tooltip("Degrees of camera pitch per grade % — makes camera tilt up on climbs")]
    public float GradePitchScale = 1.5f;
    [Tooltip("Camera drops by this many units per grade % on climbs")]
    public float GradeLowerScale = 0.2f;
    [Tooltip("Smoothing on grade-driven camera adjustments")]
    public float GradeSmoothTime = 0.8f;

    Vector3 _velocity;
    float   _pitchTilt, _pitchVel;
    float   _yAdj,      _yAdjVel;

    void LateUpdate()
    {
        if (Target == null) return;

        float grade = RouteController.Instance != null ? RouteController.Instance.CurrentGrade : 0f;

        _yAdj      = Mathf.SmoothDamp(_yAdj,      -grade * GradeLowerScale, ref _yAdjVel,  GradeSmoothTime);
        _pitchTilt = Mathf.SmoothDamp(_pitchTilt,  grade * GradePitchScale, ref _pitchVel, GradeSmoothTime);

        Vector3 goal = Target.position + Offset + new Vector3(0f, _yAdj, 0f);
        transform.position = Vector3.SmoothDamp(transform.position, goal, ref _velocity, SmoothTime);
        transform.LookAt(Target.position + Vector3.up);
        transform.Rotate(-_pitchTilt, 0f, 0f, Space.Self);
    }
}
