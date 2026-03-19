using UnityEngine;
using TMPro;
using UnityEngine.UI;

public class BikeDemo : MonoBehaviour
{
    public TMP_Text PowerText;
    public TMP_Text SpeedText;
    public TMP_Text CadenceText;
    public TMP_Text StatusText;
    public TMP_Text GradeText;

    void Start()
    {
        var bike = BikeManager.Instance;
        if (bike == null) { Debug.LogError("[Demo] No BikeManager in scene!"); return; }

        ConfigureStatusLayout();

        bike.OnConnected.AddListener(()    => UpdateStatus("Connected"));
        bike.OnDisconnected.AddListener(() => UpdateStatus("Disconnected"));
        bike.OnStateChanged.AddListener(s  => UpdateStatus(s.ToString()));
        bike.OnBikeData.AddListener(UpdateDisplay);

        UpdateStatus(bike.State.ToString());
    }

    void ConfigureStatusLayout()
    {
        if (StatusText == null) return;

        // Let status wrap and keep it readable for short error strings.
        StatusText.textWrappingMode = TextWrappingModes.Normal;
        StatusText.enableAutoSizing   = true;
        StatusText.fontSizeMax        = 36f;
        StatusText.fontSizeMin        = 20f;

        // Ensure VerticalLayoutGroup uses a larger preferred height for status row.
        var layout = StatusText.GetComponent<LayoutElement>();
        if (layout == null) layout = StatusText.gameObject.AddComponent<LayoutElement>();
        layout.minHeight       = 50f;
        layout.preferredHeight = 72f;
        layout.flexibleHeight  = 0f;
    }

    public void OnConnectButton()    => BikeManager.Instance.Connect();
    public void OnDisconnectButton() => BikeManager.Instance.Disconnect();

    void UpdateDisplay(BikeData d)
    {
        if (PowerText   != null) PowerText.text   = d.PowerWatts + " W";
        if (SpeedText   != null) SpeedText.text   = d.SpeedKmh.ToString("F1") + " km/h";
        if (CadenceText != null) CadenceText.text = d.CadenceRpm.ToString("F0") + " rpm";
    }

    public void UpdateGrade(float grade)
    {
        if (GradeText == null) return;
        string sign = grade >= 0f ? "+" : "";
        GradeText.text = $"{sign}{grade:F1}%";
        // Color: green = downhill, white = flat, red = steep
        GradeText.color = grade > 4f  ? new Color(1f, 0.3f, 0.3f) :
                          grade < -1f ? new Color(0.3f, 1f, 0.5f) :
                                        Color.white;
    }

    void UpdateStatus(string msg)
    {
        if (StatusText != null)
        {
            // Show error message if in error state
            if (BikeManager.Instance != null && BikeManager.Instance.State == BikeManager.ConnectionState.Error)
            {
                StatusText.text = $"ERROR: {BikeManager.Instance.ErrorMessage}";
                StatusText.color = new Color(1f, 0.3f, 0.3f);  // Red
            }
            else
            {
                StatusText.text = msg;
                StatusText.color = Color.white;  // Normal white
            }

            // Rebuild layout so status height updates immediately after text change.
            var parent = StatusText.transform.parent as RectTransform;
            if (parent != null)
                LayoutRebuilder.ForceRebuildLayoutImmediate(parent);
        }
    }
}