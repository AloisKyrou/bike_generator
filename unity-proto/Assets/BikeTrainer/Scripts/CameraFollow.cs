using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    [Tooltip("The sphere/object to follow")]
    public Transform Target;

    [Tooltip("Camera position relative to the target")]
    public Vector3 Offset = new Vector3(0f, 4f, -10f);

    [Tooltip("How quickly the camera catches up (lower = smoother)")]
    public float SmoothTime = 0.25f;

    Vector3 _velocity;

    void LateUpdate()
    {
        if (Target == null) return;

        Vector3 goal = Target.position + Offset;
        transform.position = Vector3.SmoothDamp(transform.position, goal, ref _velocity, SmoothTime);
        transform.LookAt(Target.position + Vector3.up);
    }
}
