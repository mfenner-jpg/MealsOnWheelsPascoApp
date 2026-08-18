export async function handler(event) {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/webform/meal_delivery_registration";

  try {
    // =======================================================
    // GET — load fresh Drupal form + CAPTCHA
    // This is the same proven loading flow used by the
    // successful final conditional Drupal test.
    // =======================================================

    if (!event.httpMethod || event.httpMethod === "GET") {
      const formResponse = await fetch(DRUPAL_FORM_URL, {
        method: "GET",
        headers: {
          Accept: "text/html",
          "User-Agent": "MOW-Pasco-App-Meal-Application",
        },
        redirect: "follow",
      });

      const html = await formResponse.text();

      if (!formResponse.ok) {
        return jsonResponse(502, {
          ok: false,
          stage: "load-meal-application",
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
          stage: "prepare-meal-application",

          found: {
            form_build_id: Boolean(formBuildId),
            form_token: Boolean(formToken),
            form_id: Boolean(formId),
            captcha_sid: Boolean(captchaSid),
            captcha_token: Boolean(captchaToken),
            captcha_question: Boolean(captchaQuestion),
          },

          message:
            "Drupal loaded, but one or more values required for the Meal Application could not be read.",
        });
      }

      return jsonResponse(200, {
        ok: true,

        stage: "meal-application-ready",

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
          "Meal Application is ready. Answer the CAPTCHA and provide a signature before submitting.",
      });
    }

    // =======================================================
    // POST — submit the REAL Meal Application
    // Uses the same proven Drupal submission flow as the
    // successful conditional test, but replaces hard-coded
    // TEST values with the values entered in the app.
    // =======================================================

    if (event.httpMethod === "POST") {
      let requestData = {};

      try {
        requestData =
          JSON.parse(event.body || "{}");
      } catch {
        return jsonResponse(400, {
          ok: false,
          stage: "read-meal-application-request",
          message:
            "The Meal Application request was not valid JSON.",
        });
      }

      const {
        application,
        captchaResponse,
        captchaResponseField,
        signature,
        state,
      } = requestData;

      if (!application) {
        return jsonResponse(400, {
          ok: false,
          stage: "validate-meal-application",
          message:
            "The application information is missing.",
        });
      }

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
          stage: "validate-meal-application-input",
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
          stage: "validate-meal-application-signature",
          message:
            "The signature is not in the PNG data URL format Drupal expects.",
        });
      }

      const formData =
        new URLSearchParams();

      // =====================================================
      // PRIMARY CLIENT
      // =======================================================

      formData.set(
        "client_name",
        clean(application.clientName)
      );

      formData.set(
        "dob",
        toDrupalDate(application.dob)
      );

      formData.set(
        "address",
        clean(application.address)
      );

      formData.set(
        "mobile_home_park_subdivision",
        clean(
          application.mobileHomeParkSubdivision
        )
      );

      formData.set(
        "city",
        clean(application.city)
      );

      formData.set(
        "state",
        normalizeState(application.state)
      );

      formData.set(
        "zip_code",
        clean(application.zipCode)
      );

      formData.set(
        "primary_contact_phone",
        clean(application.primaryPhone)
      );

      formData.set(
        "email",
        clean(application.email)
      );

      // =====================================================
      // EMERGENCY CONTACT
      // =======================================================

      formData.set(
        "emergency_contact",
        clean(application.emergencyContact)
      );

      formData.set(
        "relationship",
        clean(application.relationship)
      );

      formData.set(
        "home_mobile_phone_",
        clean(application.emergencyPhone)
      );

      formData.set(
        "email_ec",
        clean(application.emergencyEmail)
      );

      // =====================================================
      // PRIMARY HEALTH QUESTIONS
      // =======================================================

      formData.set(
        "are_you_a_diabetic_",
        clean(application.diabetic)
      );

      formData.set(
        "are_you_allergic_to_nuts_",
        clean(application.allergicNuts)
      );

      formData.set(
        "are_you_allergic_to_seafood_",
        clean(application.allergicSeafood)
      );

      formData.set(
        "are_you_a_veteran_1",
        clean(application.veteran)
      );

      // =====================================================
      // PET CONDITIONAL BRANCH
      // =======================================================

      formData.set(
        "do_you_own_a_pet_2",
        clean(application.ownPet)
      );

      if (
        application.ownPet === "Yes" &&
        Array.isArray(application.pets)
      ) {
        for (const pet of application.pets) {
          if (pet === "Dog" || pet === "Cat") {
            formData.append(
              `what_pet_s_do_you_own_[${pet}]`,
              pet
            );
          }
        }
      }

      // =====================================================
      // PRIMARY MEDICAL COMMENTS
      // =======================================================

      formData.set(
        "are_there_any_other_medical_restrictions_or_conditions_we_should_be_aware_of_",
        clean(application.medicalRestrictions)
      );

      // =====================================================
      // ADDITIONAL HOUSEHOLD MEMBER CONTROL
      // =======================================================

      formData.set(
        "would_anyone_else_in_your_home_like_to_be_included_in_this_meal_",
        clean(application.additionalMealService)
      );

      if (
        application.additionalMealService === "Yes"
      ) {
        formData.set(
          "number_of_additional_people_in_home_requiring_meal_service",
          clean(application.additionalPeople)
        );

        // ===================================================
        // HOUSEHOLD MEMBER #1
        // ===================================================

        if (
          application.additionalPeople === "1" ||
          application.additionalPeople === "2"
        ) {
          const member1 =
            application.member1 || {};

          formData.set(
            "client_name_add_1",
            clean(member1.name)
          );

          formData.set(
            "dob_add_1",
            toDrupalDate(member1.dob)
          );

          formData.set(
            "diabetic_add_1",
            clean(member1.diabetic)
          );

          formData.set(
            "are_you_allergic_nuts_add_1",
            clean(member1.allergicNuts)
          );

          formData.set(
            "are_you_allergic_to_seafood_add_1",
            clean(member1.allergicSeafood)
          );

          formData.set(
            "are_you_a_veteran_",
            clean(member1.veteran)
          );

          formData.set(
            "medical_restrictions_or_conditions_we_should_add_1",
            clean(member1.medicalRestrictions)
          );
        }

        // ===================================================
        // HOUSEHOLD MEMBER #2
        // ===================================================

        if (
          application.additionalPeople === "2"
        ) {
          const member2 =
            application.member2 || {};

          formData.set(
            "client_name_add_2",
            clean(member2.name)
          );

          formData.set(
            "dob_add_2",
            toDrupalDate(member2.dob)
          );

          formData.set(
            "are_you_a_diabetic_add_2",
            clean(member2.diabetic)
          );

          formData.set(
            "are_you_allergic_to_nuts_add_2",
            clean(member2.allergicNuts)
          );

          formData.set(
            "are_you_allergic_to_seafood_add_2",
            clean(member2.allergicSeafood)
          );

          formData.set(
            "are_you_a_veteran_2",
            clean(member2.veteran)
          );

          formData.set(
            "medical_restrictions_or_conditions_we_should_add_2",
            clean(member2.medicalRestrictions)
          );
        }
      }

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
      // SUBMIT — same proven Drupal POST pattern
      // =======================================================

      const submitResponse =
        await fetch(DRUPAL_FORM_URL, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",

            Accept: "text/html",

            "User-Agent":
              "MOW-Pasco-App-Meal-Application",
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
            "meal-application-submitted",

          drupalStatus:
            submitResponse.status,

          finalUrl,

          recordExpected:
            true,

          message:
            "SUCCESS — Drupal accepted the Meal Delivery Application.",
        });
      }

      // =====================================================
      // DIAGNOSTIC
      // =======================================================

      return jsonResponse(422, {
        ok: false,

        stage:
          "meal-application-validation",

        drupalStatus:
          submitResponse.status,

        finalUrl,

        reachedConfirmation,

        diagnosticText,

        message:
          "Drupal processed the Meal Application but did not reach confirmation. Review diagnosticText for the remaining validation issue.",
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
        "meal-application",

      message:
        error instanceof Error
          ? error.message
          : "Unknown server-side error.",
    });
  }
}


// =========================================================
// Normalize simple string values
// =========================================================

function clean(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}


// =========================================================
// Convert app MM/DD/YYYY date to Drupal YYYY-MM-DD
// =========================================================

function toDrupalDate(value) {
  const input =
    clean(value);

  if (!input) {
    return "";
  }

  // Already in Drupal/HTML date format.
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(input)
  ) {
    return input;
  }

  const match =
    input.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

  if (!match) {
    return input;
  }

  const month =
    match[1].padStart(2, "0");

  const day =
    match[2].padStart(2, "0");

  const year =
    match[3];

  return `${year}-${month}-${day}`;
}


// =========================================================
// Drupal test proved the state field accepts "Florida".
// Keep the app display as FL but translate it for Drupal.
// =========================================================

function normalizeState(value) {
  const state =
    clean(value);

  if (
    state.toUpperCase() === "FL"
  ) {
    return "Florida";
  }

  return state;
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