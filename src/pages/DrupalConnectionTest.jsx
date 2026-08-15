import { useState } from "react";

function DrupalConnectionTest() {
  const [status, setStatus] = useState("Ready to test.");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState(null);

  const testDrupalConnection = async () => {
    setStatus("Testing Netlify to Drupal...");
    setDetails("");
    setResult(null);

    try {
      const response = await fetch("/.netlify/functions/drupal-test", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      setResult(data);

      if (response.ok && data.ok) {
        setStatus("SUCCESS");

        setDetails(
          data.message ||
            "The Netlify server-side Drupal test completed successfully."
        );
      } else {
        setStatus("PARTIAL / BLOCKED");

        setDetails(
          data.message ||
            `The Netlify function returned HTTP ${response.status}.`
        );
      }
    } catch (error) {
      setStatus("FAILED");

      setDetails(
        error instanceof Error
          ? error.message
          : "The test could not be completed."
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        background: "#f6f4ef",
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "520px",
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
            color: "#073665",
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "28px",
          }}
        >
          Drupal Connection Test
        </h1>

        <p
          style={{
            lineHeight: 1.6,
            color: "#444444",
          }}
        >
          This test uses a Netlify server-side function to communicate with
          the temporary MOW App Connection Test form.
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
            background: "#0b5a94",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          Test Netlify to Drupal
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
              color: "#073665",
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
                color: "#444444",
              }}
            >
              {details}
            </p>
          )}
        </div>

        {result && (
          <pre
            style={{
              marginTop: "16px",
              padding: "14px",
              overflowX: "auto",
              borderRadius: "10px",
              background: "#042847",
              color: "#ffffff",
              fontSize: "12px",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default DrupalConnectionTest;