using UnityEngine;
using TMPro;

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

        bike.OnConnected.AddListener(()    => UpdateStatus("Connected"));
        bike.OnDisconnected.AddListener(() => UpdateStatus("Disconnected"));
        bike.OnStateChanged.AddListener(s  => UpdateStatus(s.ToString()));
        bike.OnBikeData.AddListener(UpdateDisplay);

        UpdateStatus(bike.State.ToString());
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
        if (StatusText != null) StatusText.text = msg;
    }
}