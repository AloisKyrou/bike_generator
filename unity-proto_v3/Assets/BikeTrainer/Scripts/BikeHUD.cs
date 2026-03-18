using UnityEngine;

/// Attach to any GameObject (e.g. BikeManager or a new empty "HUD").
/// Draws power / speed / cadence + connection state directly on screen — no Canvas needed.
public class BikeHUD : MonoBehaviour
{
    [Tooltip("Screen position of the HUD box (top-left corner, pixels from top-left of screen)")]
    public Vector2 Position = new Vector2(20f, 20f);

    [Tooltip("Font size for the main data values")]
    public int FontSize = 28;

    GUIStyle _boxStyle;
    GUIStyle _valueStyle;
    GUIStyle _labelStyle;
    bool     _stylesReady;

    void OnGUI()
    {
        EnsureStyles();

        var data  = BikeManager.Instance.LastData;
        var state = BikeManager.Instance.State;

        float boxW = 220f;
        float boxH = 155f;
        var rect = new Rect(Position.x, Position.y, boxW, boxH);

        // Semi-transparent dark background
        GUI.Box(rect, GUIContent.none, _boxStyle);

        float x  = rect.x + 16f;
        float y  = rect.y + 12f;
        float lh = FontSize + 10f;  // line height

        // Connection state pill
        string stateLabel = state == BikeManager.ConnectionState.Connected ? "● LIVE" : $"○ {state}";
        Color  stateColor = state == BikeManager.ConnectionState.Connected
            ? new Color(0.2f, 1f, 0.4f)
            : new Color(1f, 0.6f, 0.2f);

        _labelStyle.normal.textColor = stateColor;
        _labelStyle.fontSize = FontSize - 6;
        GUI.Label(new Rect(x, y, boxW, lh), stateLabel, _labelStyle);
        y += lh - 4f;

        // Data rows
        DrawRow(ref y, x, boxW, lh, "⚡", $"{data.PowerWatts}", "W");
        DrawRow(ref y, x, boxW, lh, "🚀", $"{data.SpeedKmh:F1}", "km/h");
        DrawRow(ref y, x, boxW, lh, "↻", $"{data.CadenceRpm:F0}", "rpm");
    }

    void DrawRow(ref float y, float x, float boxW, float lh, string icon, string value, string unit)
    {
        _labelStyle.normal.textColor = new Color(0.7f, 0.7f, 0.7f);
        _labelStyle.fontSize = FontSize - 2;
        GUI.Label(new Rect(x, y, 28f, lh), icon, _labelStyle);

        _valueStyle.fontSize = FontSize;
        GUI.Label(new Rect(x + 28f, y, 90f, lh), value, _valueStyle);

        _labelStyle.normal.textColor = new Color(0.55f, 0.55f, 0.55f);
        _labelStyle.fontSize = FontSize - 6;
        GUI.Label(new Rect(x + 120f, y + 6f, 60f, lh), unit, _labelStyle);

        y += lh;
    }

    void EnsureStyles()
    {
        if (_stylesReady) return;

        // Background box (semi-transparent black)
        _boxStyle = new GUIStyle(GUI.skin.box);
        var bgTex = new Texture2D(1, 1);
        bgTex.SetPixel(0, 0, new Color(0f, 0f, 0f, 0.55f));
        bgTex.Apply();
        _boxStyle.normal.background = bgTex;

        // Value text (white, bold)
        _valueStyle = new GUIStyle(GUI.skin.label)
        {
            fontSize  = FontSize,
            fontStyle = FontStyle.Bold,
        };
        _valueStyle.normal.textColor = Color.white;

        // Label/unit text (grey)
        _labelStyle = new GUIStyle(GUI.skin.label)
        {
            fontSize = FontSize - 2,
        };
        _labelStyle.normal.textColor = new Color(0.65f, 0.65f, 0.65f);

        _stylesReady = true;
    }
}
