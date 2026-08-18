export async function handler(event) {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/webform/meal_delivery_registration";

  try {
    // =======================================================
    // GET — load fresh Drupal form + CAPTCHA
    // =======================================================

    if (!event.httpMethod || event.httpMethod === "GET") {
      const formResponse = await fetch(DRUPAL_FORM_URL, {
        method: "GET",
        headers: {
          Accept: "text/html",
          "User-Agent": "MOW-Pasco-App-Final-Conditional-Test",
        },
        redirect: "follow",
      });

      const html = await formResponse.text();

      if (!formResponse.ok) {
        return jsonResponse(502, {
          ok: false,
          stage: "load-final-conditional-test",
          drupalStatus: formResponse.status,
          message:
            "Netlify could not load the Meal Delivery Registration form.",
        });
      }

      const formBuildId =
        getInputValue(html, "form_build_id");

      const formToken =
        getInputValue(html, "form_token");

      const formId =
        getInputValue(html, "form_id");

      const captchaSid =
        getInputValue(html, "captcha_sid");

      const captchaToken =
        getInputValue(html, "captcha_token");

      const captchaResponseField =
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
          stage: "prepare-final-conditional-test",

          found: {
            form_build_id: Boolean(formBuildId),
            form_token: Boolean(formToken),
            form_id: Boolean(formId),
            captcha_sid: Boolean(captchaSid),
            captcha_token: Boolean(captchaToken),
            captcha_question: Boolean(captchaQuestion),
          },

          message:
            "Drupal loaded, but one or more values required for the final conditional test could not be read.",
        });
      }

      return jsonResponse(200, {
        ok: true,

        stage: "final-conditional-test-ready",

        captcha: {
          question: captchaQuestion,
          responseField: captchaResponseField,
        },

        state: {
          formBuildId,
          formToken,
          formId,
          captchaSid,
          captchaToken,
        },

        message:
          "Final conditional test is ready. Answer the CAPTCHA and provide a signature before submitting.",
      });
    }

    // =======================================================
    // POST — submit complete TEST record with 2 members
    // =======================================================

    if (event.httpMethod === "POST") {
      let requestData = {};

      try {
        requestData =
          JSON.parse(event.body || "{}");
      } catch {
        return jsonResponse(400, {
          ok: false,
          stage: "read-final-conditional-request",
          message:
            "The final conditional test request was not valid JSON.",
        });
      }

      const {
        captchaResponse,
        captchaResponseField,
        signature,
        state,
      } = requestData;

      if (
        !captchaResponse ||
        !signature ||
        !state?.formBuildId ||
        !state?.formId ||
        !state?.captchaSid ||
        !state?.captchaToken
      ) {
        return jsonResponse(400, {
          ok: false,
          stage: "validate-final-conditional-input",
          message:
            "CAPTCHA answer, signature, or Drupal form state is missing.",
        });
      }

      if (
        !signature.startsWith(
          "data:image/png;base64,"
        )
      ) {
        return jsonResponse(400, {
          ok: false,
          stage: "validate-final-conditional-signature",
          message:
            "The signature is not in the PNG data URL format Drupal expects.",
        });
      }

      const formData =
        new URLSearchParams();

      // =====================================================
      // PRIMARY CLIENT — TEST
      // =======================================================

      formData.set(
        "client_name",
        "TEST - MOW APP CONDITIONAL"
      );

      formData.set(
        "dob",
        "1945-01-15"
      );

      formData.set(
        "address",
        "123 TEST STREET"
      );

      formData.set(
        "mobile_home_park_subdivision",
        "TEST COMMUNITY"
      );

      formData.set(
        "city",
        "TEST CITY"
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
        `mow-app-conditional-test-${Date.now()}@example.com`
      );

      // =====================================================
      // EMERGENCY CONTACT — TEST
      // =======================================================

      formData.set(
        "emergency_contact",
        "TEST EMERGENCY CONTACT"
      );

      formData.set(
        "relationship",
        "TEST FRIEND"
      );

      formData.set(
        "home_mobile_phone_",
        "813-555-0101"
      );

      formData.set(
        "email_ec",
        "test-emergency-contact@example.com"
      );

      // =====================================================
      // PRIMARY HEALTH QUESTIONS
      // =======================================================

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
      // PET CONDITIONAL BRANCH
      // =======================================================

      formData.set(
        "do_you_own_a_pet_2",
        "Yes"
      );

      formData.append(
        "what_pet_s_do_you_own_[Dog]",
        "Dog"
      );

      // =====================================================
      // PRIMARY MEDICAL COMMENTS
      // =======================================================

      formData.set(
        "are_there_any_other_medical_restrictions_or_conditions_we_should_be_aware_of_",
        "TEST SUBMISSION - FINAL CONDITIONAL INTEGRATION TEST."
      );

      // =====================================================
      // ADDITIONAL HOUSEHOLD MEMBER CONTROL
      // =======================================================

      formData.set(
        "would_anyone_else_in_your_home_like_to_be_included_in_this_meal_",
        "Yes"
      );

      formData.set(
        "number_of_additional_people_in_home_requiring_meal_service",
        "2"
      );

      // =====================================================
      // HOUSEHOLD MEMBER #1 — TEST
      // =======================================================

      formData.set(
        "client_name_add_1",
        "TEST HOUSEHOLD MEMBER 1"
      );

      formData.set(
        "dob_add_1",
        "1948-02-20"
      );

      formData.set(
        "diabetic_add_1",
        "No"
      );

      formData.set(
        "are_you_allergic_nuts_add_1",
        "No"
      );

      formData.set(
        "are_you_allergic_to_seafood_add_1",
        "No"
      );

      formData.set(
        "are_you_a_veteran_",
        "No"
      );

      formData.set(
        "medical_restrictions_or_conditions_we_should_add_1",
        "TEST HOUSEHOLD MEMBER 1 - NO ACTUAL MEDICAL RESTRICTIONS."
      );

      // =====================================================
      // HOUSEHOLD MEMBER #2 — TEST
      // =======================================================

      formData.set(
        "client_name_add_2",
        "TEST HOUSEHOLD MEMBER 2"
      );

      formData.set(
        "dob_add_2",
        "1950-03-25"
      );

      formData.set(
        "are_you_a_diabetic_add_2",
        "No"
      );

      formData.set(
        "are_you_allergic_to_nuts_add_2",
        "No"
      );

      formData.set(
        "are_you_allergic_to_seafood_add_2",
        "No"
      );

      formData.set(
        "are_you_a_veteran_2",
        "No"
      );

      formData.set(
        "medical_restrictions_or_conditions_we_should_add_2",
        "TEST HOUSEHOLD MEMBER 2 - NO ACTUAL MEDICAL RESTRICTIONS."
      );

      // =====================================================
      // CAPTCHA
      // =======================================================

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
      // SIGNATURE
      // =======================================================

      formData.set(
        "signature",
        signature
      );

      // =====================================================
      // DRUPAL FORM STATE
      // =======================================================

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
      // SUBMIT
      // =======================================================

      const submitResponse =
        await fetch(DRUPAL_FORM_URL, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",

            Accept: "text/html",

            "User-Agent":
              "MOW-Pasco-App-Final-Conditional-Test",
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
          6000
        );

      const reachedConfirmation =
        finalUrl.includes("/confirmation");

      // =====================================================
      // SUCCESS
      // =======================================================

      if (
        submitResponse.ok &&
        reachedConfirmation
      ) {
        return jsonResponse(200, {
          ok: true,

          stage:
            "final-conditional-test-passed",

          drupalStatus:
            submitResponse.status,

          finalUrl,

          recordExpected:
            true,

          testClientName:
            "TEST - MOW APP CONDITIONAL",

          additionalMembers:
            2,

          message:
            "SUCCESS — Drupal accepted the final conditional TEST with two additional household members.",
        });
      }

      // =====================================================
      // DIAGNOSTIC
      // =======================================================

      return jsonResponse(422, {
        ok: false,

        stage:
          "final-conditional-test",

        drupalStatus:
          submitResponse.status,

        finalUrl,

        reachedConfirmation,

        diagnosticText,

        message:
          "Drupal processed the final conditional TEST but did not reach confirmation. Review diagnosticText for the remaining validation issue.",
      });
    }

    return jsonResponse(405, {
      ok: false,
      message: "Method not allowed.",
    });

  } catch (error) {
    return jsonResponse(500, {
      ok: false,

      stage:
        "final-conditional-test",

      message:
        error instanceof Error
          ? error.message
          : "Unknown server-side error.",
    });
  }
}


// =========================================================
// Read input value by NAME
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
// Find input NAME by HTML ID
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
// Extract Math CAPTCHA
// =========================================================

function extractMathQuestion(
  html
) {
  const text =
    cleanHtml(html);

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
// Decode basic HTML entities
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
// JSON response helper
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