import { useState } from "react";

function DrupalConnectionTest() {
  const [status, setStatus] = useState("Ready to test.");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState(null);

  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaState, setCaptchaState] = useState(null);
  const [captchaResponseField, setCaptchaResponseField] =
    useState("captcha_response");

  const loadCaptcha = async () => {
    setStatus("Loading Math CAPTCHA...");
    setDetails("");
    setResult(null);

    setCaptchaQuestion("");
    setCaptchaAnswer("");
    setCaptchaState(null);

    try {
      const response = await fetch(
        "/.netlify/functions/meal-registration-test",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      setResult(data);

      if (response.ok && data.ok && data.stage === "captcha-ready") {
        setStatus("CAPTCHA READY");

        setCaptchaQuestion(data.captcha?.question || "");
        setCaptchaState(data.state || null);

        setCaptchaResponseField(
          data.captcha?.responseField || "captcha_response"
        );

        setDetails(
          "Drupal generated a fresh Math CAPTCHA. Enter the answer below, then submit it."
        );
      } else {
        setStatus("FAILED");

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
          : "The CAPTCHA challenge could not be loaded."
      );
    }
  };

  const submitCaptcha = async () => {
    if (!captchaState) {
      setStatus("CAPTCHA NOT LOADED");
      setDetails("Load a Math CAPTCHA challenge first.");
      return;
    }

    if (!captchaAnswer.trim()) {
      setStatus("ANSWER REQUIRED");
      setDetails("Enter the answer to the Math CAPTCHA.");
      return;
    }

    setStatus("Submitting CAPTCHA answer...");
    setDetails("");
    setResult(null);

    try {
      const response = await fetch(
        "/.netlify/functions/meal-registration-test",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            captchaResponse: captchaAnswer.trim(),
            captchaResponseField,
            state: captchaState,
          }),
        }
      );

      const data = await response.json();

      setResult(data);

      if (response.ok && data.ok && data.stage === "captcha-passed") {
        setStatus("CAPTCHA PASSED");

        setDetails(
          "Drupal accepted the Math CAPTCHA answer. Signature is now the remaining required field."
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
          : "The CAPTCHA answer could not be submitted."
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
          Drupal Math CAPTCHA Test
        </h1>

        <p
          style={{
            lineHeight: 1.6,
            color: "#444444",
          }}
        >
          This temporary test loads a fresh Math CAPTCHA from the real Meal
          Delivery Registration form. Enter the answer manually so we can
          confirm Drupal accepts it.
        </p>

        <button
          type="button"
          onClick={loadCaptcha}
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
          Load Math CAPTCHA
        </button>

        {captchaQuestion && (
          <div
            style={{
              marginTop: "24px",
              padding: "18px",
              borderRadius: "12px",
              background: "#fff7dd",
              border: "1px solid #e2c46d",
            }}
          >
            <div
              style={{
                color: "#073665",
                fontWeight: "800",
                marginBottom: "10px",
              }}
            >
              Math question
            </div>

            <div
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "26px",
                color: "#222222",
                marginBottom: "16px",
              }}
            >
              {captchaQuestion}
            </div>

            <label
              htmlFor="captcha-answer"
              style={{
                display: "block",
                fontWeight: "700",
                color: "#333333",
                marginBottom: "8px",
              }}
            >
              Your answer
            </label>

            <input
              id="captcha-answer"
              type="text"
              inputMode="numeric"
              value={captchaAnswer}
              onChange={(event) =>
                setCaptchaAnswer(event.target.value)
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #b8c2cc",
                fontSize: "18px",
              }}
            />

            <button
              type="button"
              onClick={submitCaptcha}
              style={{
                width: "100%",
                padding: "14px 18px",
                marginTop: "14px",
                border: "none",
                borderRadius: "10px",
                background: "#0b5a94",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Submit CAPTCHA Answer
            </button>
          </div>
        )}

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