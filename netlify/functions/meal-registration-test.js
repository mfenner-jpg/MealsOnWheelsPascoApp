export async function handler() {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/webform/meal_delivery_registration";

  try {
    // -------------------------------------------------------
    // STEP 1 — Load the real Drupal form
    // -------------------------------------------------------

    const formResponse = await fetch(DRUPAL_FORM_URL, {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": "MOW-Pasco-App-Signature-Format-Diagnostic",
      },
      redirect: "follow",
    });

    const html = await formResponse.text();

    if (!formResponse.ok) {
      return jsonResponse(502, {
        ok: false,
        stage: "load-signature-format-diagnostic",
        drupalStatus: formResponse.status,
        message:
          "Netlify could not load the Meal Delivery Registration form.",
      });
    }

    // -------------------------------------------------------
    // STEP 2 — Find the hidden signature input
    // -------------------------------------------------------

    const signatureTag =
      findInputTagByName(html, "signature");

    const signatureField = signatureTag
      ? {
          type: getAttribute(signatureTag, "type"),
          name: getAttribute(signatureTag, "name"),
          value: getAttribute(signatureTag, "value"),
          id: getAttribute(signatureTag, "id"),
          className: getAttribute(signatureTag, "class"),
          dataAttributes: getDataAttributes(signatureTag),
        }
      : null;

    // -------------------------------------------------------
    // STEP 3 — Find inline script blocks that mention
    // signature / webform-signature / SignaturePad
    // -------------------------------------------------------

    const scriptBlocks =
      html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];

    const signatureScripts = scriptBlocks
      .map((script) => cleanScriptTag(script))
      .filter((script) => {
        const lower = script.toLowerCase();

        return (
          lower.includes("signature") ||
          lower.includes("webform-signature") ||
          lower.includes("signaturepad") ||
          lower.includes("signature_pad")
        );
      })
      .map((script) => script.slice(0, 5000));

    // -------------------------------------------------------
    // STEP 4 — Find JS/CSS asset references related to
    // signature functionality
    // -------------------------------------------------------

    const externalScriptTags =
      html.match(/<script\b[^>]*src=["'][^"']+["'][^>]*><\/script>/gi) || [];

    const signatureScriptUrls = externalScriptTags
      .map((tag) => getAttribute(tag, "src"))
      .filter((src) => {
        const lower = src.toLowerCase();

        return (
          lower.includes("signature") ||
          lower.includes("webform")
        );
      });

    const linkTags =
      html.match(/<link\b[^>]*href=["'][^"']+["'][^>]*>/gi) || [];

    const signatureStyleUrls = linkTags
      .map((tag) => getAttribute(tag, "href"))
      .filter((href) => {
        const lower = href.toLowerCase();

        return (
          lower.includes("signature") ||
          lower.includes("webform")
        );
      });

    // -------------------------------------------------------
    // STEP 5 — Search raw HTML around the signature field
    // -------------------------------------------------------

    const signatureHtmlContext =
      extractContext(
        html,
        'name="signature"',
        1800
      ) ||
      extractContext(
        html,
        "webform-signature",
        1800
      );

    // -------------------------------------------------------
    // STEP 6 — Look for likely serialized value formats
    // mentioned in the page
    // -------------------------------------------------------

    const formatHints = [];

    const lowerHtml = html.toLowerCase();

    const hints = [
      "data:image/png;base64",
      "data:image/jpeg;base64",
      "data:image/svg+xml",
      "todataurl",
      "toDataURL",
      "json.stringify",
      "signaturepad",
      "signature_pad",
      "webform-signature",
    ];

    for (const hint of hints) {
      if (lowerHtml.includes(hint.toLowerCase())) {
        formatHints.push(hint);
      }
    }

    // -------------------------------------------------------
    // STEP 7 — Return inspection only
    // -------------------------------------------------------

    return jsonResponse(200, {
      ok: true,

      stage: "signature-value-format-inspection",

      drupalStatus: formResponse.status,

      signatureField,

      formatHints,

      signatureHtmlContext,

      signatureScripts,

      signatureScriptUrls,

      signatureStyleUrls,

      message:
        "Signature value-format inspection complete. No form was submitted. Review the signature field, format hints, and signature-related scripts to determine what Drupal expects.",
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,

      stage: "signature-value-format-inspection",

      message:
        error instanceof Error
          ? error.message
          : "Unknown server-side error.",
    });
  }
}


// ---------------------------------------------------------
// Find an input tag by NAME
// ---------------------------------------------------------

function findInputTagByName(
  html,
  name
) {
  const escaped =
    escapeRegex(name);

  const pattern =
    new RegExp(
      `<input\\b[^>]*name=["']${escaped}["'][^>]*>`,
      "i"
    );

  return html.match(pattern)?.[0] || "";
}


// ---------------------------------------------------------
// Extract normal HTML attribute
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
// Extract data-* attributes from an HTML tag
// ---------------------------------------------------------

function getDataAttributes(tag) {
  const result = {};

  const matches =
    tag.matchAll(
      /\s(data-[a-z0-9_-]+)=["']([^"']*)["']/gi
    );

  for (const match of matches) {
    result[match[1]] =
      decodeHtml(match[2]);
  }

  return result;
}


// ---------------------------------------------------------
// Remove <script> wrapper but preserve JS text
// ---------------------------------------------------------

function cleanScriptTag(script) {
  return script
    .replace(
      /^<script\b[^>]*>/i,
      ""
    )
    .replace(
      /<\/script>$/i,
      ""
    )
    .trim();
}


// ---------------------------------------------------------
// Extract raw HTML context around a search phrase
// ---------------------------------------------------------

function extractContext(
  html,
  searchText,
  radius
) {
  const lowerHtml =
    html.toLowerCase();

  const lowerSearch =
    searchText.toLowerCase();

  const position =
    lowerHtml.indexOf(lowerSearch);

  if (position === -1) {
    return "";
  }

  return html.slice(
    Math.max(0, position - radius),
    Math.min(
      html.length,
      position + searchText.length + radius
    )
  );
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