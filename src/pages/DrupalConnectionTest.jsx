import { useEffect, useRef, useState } from "react";

function DrupalConnectionTest() {
  const [status, setStatus] = useState("Ready to test.");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState(null);

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

    if (!canvas) {
      return;
    }

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
  // Get pointer position
  // -------------------------------------------------------

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  // -------------------------------------------------------
  // Start drawing
  // -------------------------------------------------------

  const startDrawing = (event) => {
    event.preventDefault();

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.setPointerCapture?.(event.pointerId);

    drawingRef.current = true;
    lastPointRef.current = getPoint(event);
  };

  // -------------------------------------------------------
  // Draw
  // -------------------------------------------------------

  const draw = (event) => {
    if (!drawingRef.current) {
      return;
    }

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

  // -------------------------------------------------------
  // Stop drawing
  // -------------------------------------------------------

  const stopDrawing = (event) => {
    if (!drawingRef.current) {
      return;
    }

    event.preventDefault();

    drawingRef.current = false;
    lastPointRef.current = null;
  };

  // -------------------------------------------------------
  // Clear signature
  // -------------------------------------------------------

  const clearSignature = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    setHasSignature(false);
    setSignatureData("");
    setResult(null);

    setStatus("Signature cleared.");
    setDetails("");
  };

  // -------------------------------------------------------
  // Convert signature to PNG Data URL
  // -------------------------------------------------------

  const captureSignature = () => {
    const canvas = canvasRef.current;

    if (!canvas || !hasSignature) {
      setStatus("SIGNATURE REQUIRED");
      setDetails(
        "Draw a signature in the box before testing it."
      );
      return;
    }

    const dataUrl =
      canvas.toDataURL("image/png");

    setSignatureData(dataUrl);

    const prefixCorrect =
      dataUrl.startsWith(
        "data:image/png;base64,"
      );

    const approximateBytes =
      Math.round(
        (dataUrl.length * 3) / 4
      );

    const diagnostic = {
      ok: prefixCorrect,
      stage: "signature-data-url-test",
      signatureCreated: true,
      prefixCorrect,
      beginsWith:
        dataUrl.slice(0, 30),
      dataUrlCharacters:
        dataUrl.length,
      approximateBytes,
      under500KB:
        approximateBytes < 500 * 1024,
      message: prefixCorrect
        ? "Signature successfully converted to a PNG data URL."
        : "Signature was created, but the expected PNG data URL prefix was not found.",
    };

    setResult(diagnostic);

    if (
      prefixCorrect &&
      approximateBytes < 500 * 1024
    ) {
      setStatus("SIGNATURE FORMAT PASSED");

      setDetails(
        "The test signature was successfully converted to the PNG data format Drupal expects."
      );
    } else {
      setStatus("SIGNATURE FORMAT ISSUE");

      setDetails(
        "The signature was created, but its format or size needs adjustment."
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
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.10)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            color: "#073665",
            fontFamily:
              'Georgia, "Times New Roman", serif',
            fontSize: "28px",
          }}
        >
          Drupal Signature Test
        </h1>

        <p
          style={{
            lineHeight: 1.6,
            color: "#444444",
          }}
        >
          Draw a temporary signature below. This test
          only checks whether the app can create the PNG
          signature format required by Drupal. Nothing is
          submitted to the Meal Delivery Registration form
          during this test.
        </p>

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
            Signature
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
            Sign above using your mouse, finger, or stylus.
          </div>
        </div>

        <button
          type="button"
          onClick={clearSignature}
          style={{
            width: "100%",
            padding: "12px 18px",
            marginTop: "18px",
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
          onClick={captureSignature}
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
          Test Signature Format
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
              marginTop: "16px",
              fontSize: "12px",
              color: "#666666",
              wordBreak: "break-word",
            }}
          >
            Signature data created successfully.
          </div>
        )}
      </div>
    </div>
  );
}

export default DrupalConnectionTest;