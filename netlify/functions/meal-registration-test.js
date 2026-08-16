export async function handler() {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/webform/meal_delivery_registration";

  try {
    const formResponse = await fetch(DRUPAL_FORM_URL, {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": "MOW-Pasco-App-Captcha-Diagnostic",
      },
      redirect: "follow",
    });

    const html = await formResponse.text();

    if (!formResponse.ok) {
      return jsonResponse(502, {
        ok: false,
        stage: "load-meal-registration-form",
        drupalStatus: formResponse.status,
        message: "Could not load the Drupal Meal Delivery Registration form.",
      });
    }

    // Find input elements that appear related to CAPTCHA.
    const inputTags =
      html.match(/<input\b[^>]*>/gi) || [];

    const captchaInputs = inputTags
      .map((tag) => ({
        type: getAttribute(tag, "type"),
        name: getAttribute(tag, "name"),
        value: getAttribute(tag, "value"),
        id: getAttribute(tag, "id"),
      }))
      .filter((item) => {
        const combined =
          `${item.name} ${item.id} ${item.type}`.toLowerCase();

        return (
          combined.includes("captcha") ||
          combined.includes("math")
        );
      });

    // Grab readable text around the words "Math question".
    const cleanText = cleanHtml(html);

    const lowerText =
      cleanText.toLowerCase();

    const mathPosition =
      lowerText.indexOf("math question");

    let captchaText = "";

    if (mathPosition !== -1) {
      captchaText =
        cleanText.slice(
          Math.max(0, mathPosition - 150),
          mathPosition + 500
        );
    }

    // Also inspect all hidden fields containing captcha-related names.
    const hiddenCaptchaFields =
      inputTags
        .map((tag) => ({
          type: getAttribute(tag, "type"),
          name: getAttribute(tag, "name"),
          value: getAttribute(tag, "value"),
          id: getAttribute(tag, "id"),
        }))
        .filter((item) => {
          const combined =
            `${item.name} ${item.id}`.toLowerCase();

          return (
            item.type === "hidden" &&
            combined.includes("captcha")
          );
        });

    return jsonResponse(200, {
      ok: true,

      stage: "math-captcha-inspection",

      drupalStatus:
        formResponse.status,

      captchaText,

      captchaInputs,

      hiddenCaptchaFields,

      message:
        "Inspection complete. No form was submitted. Use these results to identify the Drupal Math CAPTCHA challenge and response field.",
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,

      stage: "math-captcha-inspection",

      message:
        error instanceof Error
          ? error.message
          : "Unknown server-side error.",
    });
  }
}

function getAttribute(tag, attributeName) {
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

function decodeHtml(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

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