export async function handler() {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/webform/meal_delivery_registration";

  try {
    // -------------------------------------------------------
    // STEP 1
    // Load the real Meal Delivery Registration form.
    //
    // IMPORTANT:
    // This diagnostic version DOES NOT submit anything.
    // It only reads the form HTML so we can determine the
    // actual option values Drupal expects.
    // -------------------------------------------------------

    const formResponse = await fetch(DRUPAL_FORM_URL, {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": "MOW-Pasco-App-Meal-Registration-Diagnostic",
      },
      redirect: "follow",
    });

    const html = await formResponse.text();

    if (!formResponse.ok) {
      return jsonResponse(502, {
        ok: false,
        stage: "load-meal-registration-form",
        drupalStatus: formResponse.status,
        message:
          "Netlify could not load the Meal Delivery Registration form from Drupal.",
      });
    }

    // -------------------------------------------------------
    // STEP 2
    // Read Drupal's hidden form values.
    // -------------------------------------------------------

    const getHiddenValue = (name) => {
      const pattern = new RegExp(
        `name=["']${escapeRegex(name)}["'][^>]*value=["']([^"']*)["']`,
        "i"
      );

      const reversePattern = new RegExp(
        `value=["']([^"']*)["'][^>]*name=["']${escapeRegex(name)}["']`,
        "i"
      );

      const match =
        html.match(pattern) ||
        html.match(reversePattern);

      return match ? match[1] : "";
    };

    const formBuildId =
      getHiddenValue("form_build_id");

    const formToken =
      getHiddenValue("form_token");

    const formId =
      getHiddenValue("form_id");

    // -------------------------------------------------------
    // STEP 3
    // Inspect the actual HTML input values Drupal generated
    // for the five questions that caused the server error.
    //
    // We are NOT guessing Yes/No values anymore.
    // -------------------------------------------------------

    const fieldsToInspect = [
      "are_you_a_diabetic_",
      "are_you_allergic_to_nuts_",
      "are_you_allergic_to_seafood_",
      "are_you_a_veteran_1",
      "do_you_own_a_pet_",
    ];

    const fieldDefinitions = {};

    for (const fieldName of fieldsToInspect) {
      fieldDefinitions[fieldName] =
        inspectFieldInputs(html, fieldName);
    }

    // -------------------------------------------------------
    // STEP 4
    // Also inspect the additional-meal-service field because
    // it will be the next required conditional field.
    // -------------------------------------------------------

    const additionalMealField =
      "would_anyone_else_in_your_home_like_to_be_included_in_this_meal_";

    fieldDefinitions[additionalMealField] =
      inspectFieldInputs(
        html,
        additionalMealField
      );

    // -------------------------------------------------------
    // STEP 5
    // Return diagnostics only.
    //
    // NO POST REQUEST IS MADE.
    // NO DRUPAL SUBMISSION IS CREATED.
    // -------------------------------------------------------

    return jsonResponse(200, {
      ok: true,

      stage:
        "meal-registration-option-inspection",

      drupalStatus:
        formResponse.status,

      formUrl:
        formResponse.url,

      hiddenFields: {
        form_build_id:
          Boolean(formBuildId),

        form_token:
          Boolean(formToken),

        form_id:
          Boolean(formId),
      },

      formId,

      fieldDefinitions,

      message:
        "Diagnostic complete. No form was submitted. Review fieldDefinitions to see the exact values Drupal expects for each Yes/No field.",
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,

      stage:
        "meal-registration-option-inspection",

      message:
        error instanceof Error
          ? error.message
          : "Unknown server-side error.",
    });
  }
}


// ---------------------------------------------------------
// Finds all HTML <input> elements belonging to one Drupal
// field and returns their actual type/value combinations.
// ---------------------------------------------------------

function inspectFieldInputs(html, fieldName) {
  const escapedName =
    escapeRegex(fieldName);

  const inputPattern =
    new RegExp(
      `<input\\b[^>]*name=["']${escapedName}(?:\\[\\])?["'][^>]*>`,
      "gi"
    );

  const matches =
    html.match(inputPattern) || [];

  return matches.map((tag) => {
    return {
      type:
        getAttribute(tag, "type") ||
        "text",

      name:
        getAttribute(tag, "name") ||
        "",

      value:
        getAttribute(tag, "value") ||
        "",

      checked:
        /\schecked(?:=["'][^"']*["'])?/i.test(
          tag
        ),
    };
  });
}


// ---------------------------------------------------------
// Extract an HTML attribute from a tag.
// ---------------------------------------------------------

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


// ---------------------------------------------------------
// Minimal HTML entity decoding for diagnostic values.
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
// Escape text before putting it into a RegExp.
// ---------------------------------------------------------

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}


// ---------------------------------------------------------
// Standard JSON response helper.
// ---------------------------------------------------------

function jsonResponse(statusCode, data) {
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