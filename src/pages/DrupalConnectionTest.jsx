import { useState } from "react";

function DrupalConnectionTest() {
  const [status, setStatus] = useState("Ready to test.");
  const [details, setDetails] = useState("");

  const testDrupalConnection = async () => {
    setStatus("Testing connection...");
    setDetails("");

    try {
      const response = await fetch(
        "https://www.mealsonwheelspasco.org/form/mow-app-connection-test",
        {
          method: "GET",
          headers: {
            Accept: "text/html",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Drupal responded with HTTP ${response.status} ${response.statusText}`
        );
      }

      const html = await response.text();

      const hasFormBuildId = html.includes('name="form_build_id"');
      const hasFormToken = html.includes('name="form_token"');
      const hasFormId = html.includes('name="form_id"');

      if (hasFormBuildId && hasFormToken && hasFormId) {
        setStatus("SUCCESS — Drupal form reached");
        setDetails(
          "The app successfully downloaded the Drupal Webform and found form_build_id, form_token, and form_id."
        );
      } else {
        setStatus("PARTIAL SUCCESS — Drupal reached");
        setDetails(
          "The app reached Drupal, but one or more required hidden form values were not found."
        );
      }
    } catch (error) {
      setStatus("BLOCKED — connection failed");
      setDetails(error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        background: "#f6f4ef",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "28px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            color: "#173b68",
            fontSize: "28px",
          }}
        >
          Drupal Connection Test
        </h1>

        <p
          style={{
            lineHeight: 1.6,
            color: "#444",
          }}
        >
          This test only attempts to read the temporary MOW App Connection Test
          form. It will not submit or change anything.
        </p>

        <button
          type="button"
          onClick={testDrupalConnection}
          style={{
            width: "100%",
            padding: "14px 18px",
            marginTop: "12px",
            border: "none",
            borderRadius: "10px",
            background: "#1f5f9e",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Test Drupal Connection
        </button>

        <div
          style={{
            marginTop: "24px",
            padding: "18px",
            borderRadius: "12px",
            background: "#f2f5f8",
          }}
        >
          <strong
            style={{
              display: "block",
              color: "#173b68",
              marginBottom: "8px",
            }}
          >
            {status}
          </strong>

          {details && (
            <p
              style={{
                margin: 0,
                lineHeight: 1.5,
                color: "#444",
                wordBreak: "break-word",
              }}
            >
              {details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DrupalConnectionTest;