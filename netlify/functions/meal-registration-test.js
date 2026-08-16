export async function handler(event) {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/webform/meal_delivery_registration";

  try {
    // =======================================================
    // GET = LOAD A FRESH CAPTCHA CHALLENGE
    // =======================================================

    if (!event.httpMethod || event.httpMethod === "GET") {
      const formResponse = await fetch(DRUPAL_FORM_URL, {
        method: "GET",
        headers: {
          Accept: "text/html",
          "User-Agent": "MOW-Pasco-App-Captcha-Test",
        },
        redirect: "follow",
      });

      const html = await formResponse.text();

      if (!formResponse.ok) {
        return jsonResponse(502, {
          ok: false,
          stage: "load-captcha",
          drupalStatus: formResponse.status,
          message:
            "Netlify could not load the Meal Delivery Registration form.",
        });
      }

      // -----------------------------------------------------
      // Drupal hidden Webform values
      // -----------------------------------------------------

      const formBuildId =
        getInputValue(html, "form_build_id");

      const formToken =
        getInputValue(html, "form_token");

      const formId =
        getInputValue(html, "form_id");

      // -----------------------------------------------------
      // CAPTCHA values
      // -----------------------------------------------------

      const captchaSid =
        getInputValue(html, "captcha_sid");

      const captchaToken =
        getInputValue(html, "captcha_token");

      const captchaResponseName =
        findInputNameById(
          html,
          "edit-captcha-response"
        ) || "captcha_response";

      const captchaQuestion =
        extractMathQuestion(html);

      if (
        !formBuildId ||
        !formId ||
        !captchaSid ||
        !captchaToken ||
        !captchaQuestion
      ) {
        return jsonResponse(502, {
          ok: false,

          stage: "read-captcha",

          found: {
            form_build_id:
              Boolean(formBuildId),

            form_token:
              Boolean(formToken),

            form_id:
              Boolean(formId),

            captcha_sid:
              Boolean(captchaSid),

            captcha_token:
              Boolean(captchaToken),

            captcha_question:
              Boolean(captchaQuestion),
          },

          message:
            "Drupal loaded, but one or more CAPTCHA values could not be read.",
        });
      }

      // -----------------------------------------------------
      // IMPORTANT:
      // We return the challenge and Drupal's hidden form
      // values, but WE DO NOT calculate the answer.
      //
      // The user must answer the math question.
      // -----------------------------------------------------

      return jsonResponse(200, {
        ok: true,

        stage:
          "captcha-ready",

        captcha: {
          question:
            captchaQuestion,

          responseField:
            captchaResponseName,
        },

        state: {
          formBuildId,
          formToken,
          formId,
          captchaSid,
          captchaToken,
        },

        message:
          "CAPTCHA challenge loaded. Enter the answer manually, then submit it for testing.",
      });
    }

    // =======================================================
    // POST = SUBMIT USER-PROVIDED CAPTCHA ANSWER
    // =======================================================

    if (event.httpMethod === "POST") {
      let requestData = {};

      try {
        requestData =
          JSON.parse(event.body || "{}");
      } catch {
        return jsonResponse(400, {
          ok: false,
          stage: "read-test-request",
          message:
            "The CAPTCHA test request was not valid JSON.",
        });
      }

      const {
        captchaResponse,
        captchaResponseField,
        state,
      } = requestData;

      if (
        !captchaResponse ||
        !state?.formBuildId ||
        !state?.formId ||
        !state?.captchaSid ||
        !state?.captchaToken
      ) {
        return jsonResponse(400, {
          ok: false,

          stage:
            "captcha-test-input",

          message:
            "CAPTCHA answer or Drupal CAPTCHA state is missing.",
        });
      }

      const formData =
        new URLSearchParams();

      // =====================================================
      // PRIMARY APPLICANT
      // =====================================================

      formData.set(
        "client_name",
        "MOW App CAPTCHA Test"
      );

      formData.set(
        "dob",
        "1945-01-15"
      );

      formData.set(
        "address",
        "123 Test Street"
      );

      formData.set(
        "mobile_home_park_subdivision",
        "Test Community"
      );

      formData.set(
        "city",
        "Zephyrhills"
      );

      formData.set(
        "state",
        "Florida"
      );

      formData.set(
        "zip_code",
        "33542"
      );

      formData.set(
        "primary_contact_phone",
        "813-555-0100"
      );

      formData.set(
        "email",
        `mow-captcha-test-${Date.now()}@example.com`
      );

      // =====================================================
      // EMERGENCY CONTACT
      // =====================================================

      formData.set(
        "emergency_contact",
        "Test Emergency Contact"
      );

      formData.set(
        "relationship",
        "Friend"
      );

      formData.set(
        "home_mobile_phone_",
        "813-555-0101"
      );

      formData.set(
        "email_ec",
        "emergency-test@example.com"
      );

      // =====================================================
      // PRIMARY HEALTH QUESTIONS
      // =====================================================

      formData.set(
        "are_you_a_diabetic_",
        "No"
      );

      formData.set(
        "are_you_allergic_to_nuts_",
        "No"
      );

      formData.set(
        "are_you_allergic_to_seafood_",
        "No"
      );

      formData.set(
        "are_you_a_veteran_1",
        "No"
      );

      // =====================================================
      // PET
      // =====================================================

      formData.set(
        "do_you_own_a_pet_2",
        "Yes"
      );

      formData.append(
        "what_pet_s_do_you_own_[Dog]",
        "Dog"
      );

      // =====================================================
      // OPTIONAL MEDICAL COMMENTS
      // =====================================================

      formData.set(
        "are_there_any_other_medical_restrictions_or_conditions_we_should_be_aware_of_",
        "MOW App CAPTCHA integration test."
      );

      // =====================================================
      // ADDITIONAL HOUSEHOLD MEMBERS
      //
      // Use NO for this CAPTCHA-specific test.
      // Those branches have already been tested separately.
      // =====================================================

      formData.set(
        "would_anyone_else_in_your_home_like_to_be_included_in_this_meal_",
        "No"
      );

      // =====================================================
      // CAPTCHA
      // =====================================================

      formData.set(
        "captcha_sid",
        state.captchaSid
      );

      formData.set(
        "captcha_token",
        state.captchaToken
      );

      formData.set(
        captchaResponseField ||
          "captcha_response",
        String(captchaResponse).trim()
      );

      // =====================================================
      // DRUPAL WEBFORM STATE
      // =====================================================

      formData.set(
        "form_build_id",
        state.formBuildId
      );

      if (state.formToken) {
        formData.set(
          "form_token",
          state.formToken
        );
      }

      formData.set(
        "form_id",
        state.formId
      );

      formData.set(
        "op",
        "Submit"
      );

      // =====================================================
      // SUBMIT TO DRUPAL
      // =====================================================

      const submitResponse =
        await fetch(DRUPAL_FORM_URL, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",

            Accept:
              "text/html",

            "User-Agent":
              "MOW-Pasco-App-Captcha-Test",
          },

          body:
            formData.toString(),

          redirect:
            "follow",
        });

      const responseText =
        await submitResponse.text();

      const finalUrl =
        submitResponse.url || "";

      const diagnosticText =
        cleanHtml(responseText).slice(
          0,
          4500
        );

      const lowerDiagnostic =
        diagnosticText.toLowerCase();

      // -----------------------------------------------------
      // Check specifically for CAPTCHA validation errors.
      // -----------------------------------------------------

      const captchaFailed =
        lowerDiagnostic.includes(
          "math question field is required"
        ) ||
        lowerDiagnostic.includes(
          "captcha"
        ) &&
        (
          lowerDiagnostic.includes(
            "incorrect"
          ) ||
          lowerDiagnostic.includes(
            "invalid"
          ) ||
          lowerDiagnostic.includes(
            "wrong"
          )
        );

      const signatureRequired =
        lowerDiagnostic.includes(
          "signature field is required"
        );

      // -----------------------------------------------------
      // For this test, SUCCESS means CAPTCHA passed.
      //
      // Signature is intentionally still missing.
      // -----------------------------------------------------

      if (
        !captchaFailed &&
        signatureRequired
      ) {
        return jsonResponse(200, {
          ok: true,

          stage:
            "captcha-passed",

          drupalStatus:
            submitResponse.status,

          finalUrl,

          captchaPassed:
            true,

          signatureStillRequired:
            true,

          diagnosticText,

          message:
            "SUCCESS — Drupal accepted the Math CAPTCHA answer. Signature is now the remaining required field.",
        });
      }

      return jsonResponse(422, {
        ok: false,

        stage:
          "captcha-submission-test",

        drupalStatus:
          submitResponse.status,

        finalUrl,

        captchaPassed:
          !captchaFailed,

        signatureStillRequired:
          signatureRequired,

        diagnosticText,

        message:
          captchaFailed
            ? "Drupal did not accept the CAPTCHA response."
            : "Drupal processed the CAPTCHA test. Review diagnosticText for the remaining validation issue.",
      });
    }

    // =======================================================
    // Unsupported method
    // =======================================================

    return jsonResponse(405, {
      ok: false,
      message:
        "Method not allowed.",
    });

  } catch (error) {
    return jsonResponse(500, {
      ok: false,

      stage:
        "captcha-test",

      message:
        error instanceof Error
          ? error.message
          : "Unknown server-side error.",
    });
  }
}


// =========================================================
// Read value from an input by NAME
// =========================================================

function getInputValue(
  html,
  name
) {
  const escaped =
    escapeRegex(name);

  const normal =
    new RegExp(
      `<input\\b[^>]*name=["']${escaped}["'][^>]*value=["']([^"']*)["'][^>]*>`,
      "i"
    );

  const reversed =
    new RegExp(
      `<input\\b[^>]*value=["']([^"']*)["'][^>]*name=["']${escaped}["'][^>]*>`,
      "i"
    );

  const match =
    html.match(normal) ||
    html.match(reversed);

  return match
    ? decodeHtml(match[1])
    : "";
}


// =========================================================
// Find input NAME from its HTML ID
// =========================================================

function findInputNameById(
  html,
  id
) {
  const escaped =
    escapeRegex(id);

  const tagPattern =
    new RegExp(
      `<input\\b[^>]*id=["']${escaped}["'][^>]*>`,
      "i"
    );

  const tag =
    html.match(tagPattern)?.[0];

  if (!tag) {
    return "";
  }

  const nameMatch =
    tag.match(
      /name=["']([^"']+)["']/i
    );

  return nameMatch
    ? decodeHtml(nameMatch[1])
    : "";
}


// =========================================================
// Extract the human-readable Math CAPTCHA challenge
// =========================================================

function extractMathQuestion(
  html
) {
  const text =
    cleanHtml(html);

  /*
   * Drupal output resembles:
   *
   * Math question 3 + 1 =
   * Solve this simple math problem...
   */

  const match =
    text.match(
      /Math question\s+([^=]{1,40}=)/i
    );

  if (!match) {
    return "";
  }

  return match[1]
    .replace(/\s+/g, " ")
    .trim();
}


// =========================================================
// Clean Drupal HTML
// =========================================================

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


// =========================================================
// Decode small set of HTML entities
// =========================================================

function decodeHtml(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}


// =========================================================
// Escape RegExp input
// =========================================================

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}


// =========================================================
// Standard JSON response
// =========================================================

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