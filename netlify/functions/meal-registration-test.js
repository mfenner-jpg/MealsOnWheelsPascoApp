export async function handler() {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/webform/meal_delivery_registration";

  try {
    const formResponse = await fetch(DRUPAL_FORM_URL, {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": "MOW-Pasco-App-Signature-Diagnostic",
      },
      redirect: "follow",
    });

    const html = await formResponse.text();

    if (!formResponse.ok) {
      return jsonResponse(502, {
        ok: false,
        stage: "load-signature-diagnostic",
        drupalStatus: formResponse.status,
        message:
          "Netlify could not load the Meal Delivery Registration form.",
      });
    }

    // -------------------------------------------------------
    // Inspect input / textarea / canvas elements related
    // to the Drupal Signature element.
    // -------------------------------------------------------

    const inputTags =
      html.match(/<input\b[^>]*>/gi) || [];

    const textareaTags =
      html.match(/<textarea\b[^>]*>[\s\S]*?<\/textarea>/gi) || [];

    const canvasTags =
      html.match(/<canvas\b[^>]*>/gi) || [];

    const signatureInputs = inputTags
      .map((tag) => ({
        tagType: "input",
        type: getAttribute(tag, "type"),
        name: getAttribute(tag, "name"),
        value: getAttribute(tag, "value"),
        id: getAttribute(tag, "id"),
        className: getAttribute(tag, "class"),
      }))
      .filter((item) => {
        const combined =
          `${item.name} ${item.id} ${item.className}`.toLowerCase();

        return combined.includes("signature");
      });

    const signatureTextareas = textareaTags
      .map((tag) => ({
        tagType: "textarea",
        name: getAttribute(tag, "name"),
        id: getAttribute(tag, "id"),
        className: getAttribute(tag, "class"),
        value: getTextareaValue(tag),
      }))
      .filter((item) => {
        const combined =
          `${item.name} ${item.id} ${item.className}`.toLowerCase();

        return combined.includes("signature");
      });

    const signatureCanvases = canvasTags
      .map((tag) => ({
        tagType: "canvas",
        id: getAttribute(tag, "id"),
        className: getAttribute(tag, "class"),
        width: getAttribute(tag, "width"),
        height: getAttribute(tag, "height"),
      }))
      .filter((item) => {
        const combined =
          `${item.id} ${item.className}`.toLowerCase();

        return combined.includes("signature");
      });

    // -------------------------------------------------------
    // Capture readable text around "Signature"
    // -------------------------------------------------------

    const cleanText =
      cleanHtml(html);

    const lowerText =
      cleanText.toLowerCase();

    const signaturePosition =
      lowerText.lastIndexOf("signature");

    let signatureText = "";

    if (signaturePosition !== -1) {
      signatureText =
        cleanText.slice(
          Math.max(0, signaturePosition - 250),
          signaturePosition + 700
        );
    }

    // -------------------------------------------------------
    // Return inspection only.
    // -------------------------------------------------------

    return jsonResponse(200, {
      ok: true,

      stage:
        "signature-inspection",

      drupalStatus:
        formResponse.status,

      signatureText,

      signatureInputs,

      signatureTextareas,

      signatureCanvases,

      message:
        "Signature inspection complete. No form was submitted. Review the signature fields to determine exactly what Drupal expects.",
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,

      stage:
        "signature-inspection",

      message:
        error instanceof Error
          ? error.message
          : "Unknown server-side error.",
    });
  }
}


// ---------------------------------------------------------
// Read a normal HTML attribute
// ---------------------------------------------------------

function getAttribute(
  tag,
  attributeName
) {
  const pattern =
    new RegExp(
      `${escapeRegex(attributeName)}=["']([^"']*)["']`,
      "i"
    );

  const match =
    tag.match(pattern);

  return match
    ? decodeHtml(match[1])
    : "";
}


// ---------------------------------------------------------
// Read textarea contents
// ---------------------------------------------------------

function getTextareaValue(tag) {
  const match =
    tag.match(
      /<textarea\b[^>]*>([\s\S]*?)<\/textarea>/i
    );

  return match
    ? decodeHtml(match[1].trim())
    : "";
}


// ---------------------------------------------------------
// Clean Drupal HTML for readable diagnostic text
// ---------------------------------------------------------

function cleanHtml(html) {
  return html
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<[^>]+>/g,
      " "
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}


// ---------------------------------------------------------
// Decode basic HTML entities
// ---------------------------------------------------------

function decodeHtml(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}


// ---------------------------------------------------------
// Escape RegExp input
// ---------------------------------------------------------

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}


// ---------------------------------------------------------
// Standard JSON response helper
// ---------------------------------------------------------

function jsonResponse(
  statusCode,
  data
) {
  return {
    statusCode,

    headers: {
      "Content-Type":
        "application/json",

      "Cache-Control":
        "no-store",
    },

    body:
      JSON.stringify(data),
  };
}