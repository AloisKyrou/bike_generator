using System;
using UnityEngine;

/// Attach to any GameObject.
/// Plays a scripted hill route: tracks distance from bike speed,
/// interpolates grade between waypoints, sends SetGrade to the ESP32.
public class RouteController : MonoBehaviour
{
    [Serializable]
    public struct RoutePoint
    {
        [Tooltip("Distance from start in metres")]
        public float DistanceM;
        [Tooltip("Road grade at this point, in % (-20 to +20)")]
        public float GradePercent;
    }

    [Header("Route")]
    [Tooltip("List of (distance, grade) waypoints. Must be sorted by distance.")]
    public RoutePoint[] Route = DefaultRoute();

    [Tooltip("Loop back to the start when the route ends")]
    public bool Loop = true;

    [Header("References")]
    public BikeDemo HUD;

    [Tooltip("Re-send grade to ESP32 every N seconds even if unchanged (prevents ESP32 state reset)")]
    public float KeepAliveInterval = 2f;

    float _distanceM;
    float _currentGrade;
    float _lastSentGrade = float.MaxValue;
    float _timeSinceLastSend;

    // How far grade must change before sending a new command (avoids spamming BLE)
    const float GRADE_SEND_THRESHOLD = 0.5f;

    void Start()
    {
        // Reset ESP32 to flat immediately — clears any stale grade from previous session
        if (BikeManager.Instance != null)
            BikeManager.Instance.SetGrade(0f);
    }

    void Update()
    {
        if (BikeManager.Instance == null) return;

        // Accumulate distance from speed (km/h → m/s → metres)
        float speedMs = BikeManager.Instance.LastData.SpeedKmh / 3.6f;
        _distanceM += speedMs * Time.deltaTime;

        float routeLength = Route[Route.Length - 1].DistanceM;

        // Loop
        if (Loop && _distanceM > routeLength)
            _distanceM -= routeLength;

        float grade = SampleGrade(_distanceM);

        _timeSinceLastSend += Time.deltaTime;

        // Send when grade changes meaningfully OR keepalive interval elapsed
        bool gradeChanged = Mathf.Abs(grade - _lastSentGrade) >= GRADE_SEND_THRESHOLD;
        bool keepAlive    = _timeSinceLastSend >= KeepAliveInterval;

        if (gradeChanged || keepAlive)
        {
            BikeManager.Instance.SetGrade(grade);
            _lastSentGrade    = grade;
            _timeSinceLastSend = 0f;
        }

        _currentGrade = grade;
        HUD?.UpdateGrade(grade);
    }

    float SampleGrade(float dist)
    {
        if (Route == null || Route.Length == 0) return 0f;
        if (dist <= Route[0].DistanceM)         return Route[0].GradePercent;

        for (int i = 1; i < Route.Length; i++)
        {
            if (dist <= Route[i].DistanceM)
            {
                float t = Mathf.InverseLerp(Route[i - 1].DistanceM, Route[i].DistanceM, dist);
                return Mathf.Lerp(Route[i - 1].GradePercent, Route[i].GradePercent, t);
            }
        }

        return Route[Route.Length - 1].GradePercent;
    }

    // Sample Zwift-style rolling course (~3 km loop)
    static RoutePoint[] DefaultRoute() => new RoutePoint[]
    {
        new RoutePoint { DistanceM =    0, GradePercent =  0f  },  // flat start
        new RoutePoint { DistanceM =  200, GradePercent =  2f  },  // gentle rise
        new RoutePoint { DistanceM =  500, GradePercent =  5f  },  // climbing
        new RoutePoint { DistanceM =  700, GradePercent =  8f  },  // steep!
        new RoutePoint { DistanceM =  900, GradePercent =  5f  },  // easing
        new RoutePoint { DistanceM = 1100, GradePercent =  0f  },  // summit / flat
        new RoutePoint { DistanceM = 1300, GradePercent = -3f  },  // descent
        new RoutePoint { DistanceM = 1600, GradePercent = -6f  },  // fast descent
        new RoutePoint { DistanceM = 1900, GradePercent = -2f  },  // levelling off
        new RoutePoint { DistanceM = 2100, GradePercent =  0f  },  // flat valley
        new RoutePoint { DistanceM = 2400, GradePercent =  3f  },  // another climb
        new RoutePoint { DistanceM = 2700, GradePercent =  6f  },
        new RoutePoint { DistanceM = 3000, GradePercent =  0f  },  // back to flat → loops
    };

    // Draw a grade profile preview in Scene view (white = flat, red = up, green = down)
    void OnDrawGizmos()
    {
        if (Route == null || Route.Length < 2) return;
        float scale    = 0.005f;   // metres per unit displayed
        float vScale   = 0.15f;    // vertical exaggeration
        Vector3 origin = transform.position;

        for (int i = 1; i < Route.Length; i++)
        {
            var a = origin + new Vector3(Route[i-1].DistanceM * scale, Route[i-1].GradePercent * vScale, 0);
            var b = origin + new Vector3(Route[i  ].DistanceM * scale, Route[i  ].GradePercent * vScale, 0);
            Gizmos.color = Route[i].GradePercent > 0 ? Color.red :
                           Route[i].GradePercent < 0 ? Color.green : Color.white;
            Gizmos.DrawLine(a, b);
        }
    }
}
