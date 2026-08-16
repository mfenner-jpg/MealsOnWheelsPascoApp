import { useEffect, useRef, useState } from "react";

function DrupalConnectionTest() {
  const [status, setStatus] = useState("Ready to begin.");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState(null);

  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaState, setCaptchaState] = useState(null);
  const [captchaResponseField, setCaptchaResponseField] =
    useState("captcha_response");

  const [signatureData, setSignatureData] = useState("");
  const [hasSignature, setHasSignature] = useState(false);

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  // -------------------------------------------------------
  // Prepare signature canvas
  // -------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);

      const ctx = canvas.getContext("2d");

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#111111";
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // -------------------------------------------------------
  // Signature drawing helpers
  // -------------------------------------------------------

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();

    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.setPointerCapture?.(event.pointerId);

    drawingRef.current = true;
    lastPointRef.current = getPoint(event);
  };

  const draw = (event) => {
    if (!drawingRef.current) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const currentPoint = getPoint(event);
    const previousPoint = lastPointRef.current;

    if (!previousPoint) {
      lastPointRef.current = currentPoint;
      return;
    }

    ctx.beginPath();
    ctx.moveTo(previousPoint.x, previousPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPointRef.current = currentPoint;

    if (!hasSignature) {
      setHasSignature(true);
    }
  };

  const stopDrawing = (event) => {
    if (!drawingRef.current) return;

    event.preventDefault();

    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setHasSignature(false);
    setSignatureData("");
    setStatus("Signature cleared.");
    setDetails("");
    setResult(null);
  };

  // -------------------------------------------------------
  // Load fresh Drupal form + CAPTCHA
  // -------------------------------------------------------

  const loadTest = async () => {
    setStatus("Loading Drupal test...");
    setDetails("");
    setResult(null);

    setCaptchaQuestion("");
    setCaptchaAnswer("");
    setCaptchaState(null);
    setSignatureData("");

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

      if (
        response.ok &&
        data.ok &&
        data.stage === "final-conditional-test-ready"
      ) {
        setCaptchaQuestion(data.captcha?.question || "");
        setCaptchaState(data.state || null);

        setCaptchaResponseField(
          data.captcha?.responseField || "captcha_response"
        );

        setStatus("TEST READY");

        setDetails(
          "Drupal loaded successfully. Answer the Math CAPTCHA, draw a test signature, then submit the TEST registration."
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
          : "The Drupal test could not be loaded."
      );
    }
  };

  // -------------------------------------------------------
  // Submit complete TEST registration
  // -------------------------------------------------------

  const submitFullTest = async () => {
    if (!captchaState) {
      setStatus("TEST NOT LOADED");
      setDetails("Click Load Full TEST first.");
      return;
    }

    if (!captchaAnswer.trim()) {
      setStatus("CAPTCHA ANSWER REQUIRED");
      setDetails("Enter the answer to the Math CAPTCHA.");
      return;
    }

    if (!hasSignature) {
      setStatus("SIGNATURE REQUIRED");
      setDetails("Draw a test signature before submitting.");
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      setStatus("SIGNATURE ERROR");
      setDetails("The signature canvas is unavailable.");
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");

    setSignatureData(dataUrl);

    setStatus("Submitting TEST registration...");
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
            signature: dataUrl,
            state: captchaState,
          }),
        }
      );

      const data = await response.json();

      setResult(data);

      if (
        response.ok &&
        data.ok &&
        data.stage === "final-conditional-test-passed"
      ) {
        setStatus("FULL TEST PASSED");

        setDetails(
          "Drupal accepted the complete TEST Meal Delivery Registration. A clearly marked TEST record should now exist in Drupal."
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
          : "The TEST registration could not be submitted."
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
          Full Drupal Registration Test
        </h1>

        <p
          style={{
            lineHeight: 1.6,
            color: "#444444",
          }}
        >
          This test submits one clearly marked TEST registration to the real
          Meal Delivery Registration form.
        </p>

        <div
          style={{
            padding: "14px",
            borderRadius: "10px",
            background: "#fff7dd",
            border: "1px solid #e2c46d",
            color: "#5b4810",
            lineHeight: 1.5,
          }}
        >
          Drupal client name will be:
          <br />
          <strong>TEST - MOW APP INTEGRATION</strong>
        </div>

        <button
          type="button"
          onClick={loadTest}
          style={{
            width: "100%",
            padding: "14px 18px",
            marginTop: "20px",
            border: "none",
            borderRadius: "10px",
            background: "#0b5a94",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          Load Full TEST
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
          </div>
        )}

        <div
          style={{
            marginTop: "24px",
          }}
        >
          <div
            style={{
              fontWeight: "800",
              color: "#073665",
              marginBottom: "8px",
            }}
          >
            TEST Signature
          </div>

          <div
            style={{
              border: "1px solid #b8c2cc",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#ffffff",
            }}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              onPointerLeave={stopDrawing}
              style={{
                display: "block",
                width: "100%",
                height: "220px",
                touchAction: "none",
                cursor: "crosshair",
              }}
            />
          </div>

          <div
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: "#666666",
            }}
          >
            Draw any test signature above.
          </div>
        </div>

        <button
          type="button"
          onClick={clearSignature}
          style={{
            width: "100%",
            padding: "12px 18px",
            marginTop: "14px",
            border: "1px solid #b8c2cc",
            borderRadius: "10px",
            background: "#ffffff",
            color: "#073665",
            fontSize: "15px",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          Clear Signature
        </button>

        <button
          type="button"
          onClick={submitFullTest}
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
          Submit TEST Registration
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

        {signatureData && (
          <div
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "#777777",
            }}
          >
            TEST signature data created.
          </div>
        )}
      </div>
    </div>
  );
}

export default DrupalConnectionTest;