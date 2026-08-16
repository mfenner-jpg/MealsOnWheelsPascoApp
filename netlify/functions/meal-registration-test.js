export async function handler() {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/webform/meal_delivery_registration";

  try {
    // -------------------------------------------------------
    // STEP 1 — Load Drupal form
    // -------------------------------------------------------

    const formResponse = await fetch(DRUPAL_FORM_URL, {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": "MOW-Pasco-App-Meal-Registration-Test",
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
    // STEP 2 — Read Drupal hidden fields
    // -------------------------------------------------------

    const getHiddenValue = (name) => {
      const escapedName = escapeRegex(name);

      const pattern = new RegExp(
        `name=["']${escapedName}["'][^>]*value=["']([^"']*)["']`,
        "i"
      );

      const reversePattern = new RegExp(
        `value=["']([^"']*)["'][^>]*name=["']${escapedName}["']`,
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

    if (!formBuildId || !formId) {
      return jsonResponse(502, {
        ok: false,
        stage: "prepare-meal-registration",

        hiddenFields: {
          form_build_id: Boolean(formBuildId),
          form_token: Boolean(formToken),
          form_id: Boolean(formId),
        },

        message:
          "Netlify reached the Meal Delivery Registration form, but required Drupal hidden values could not be read.",
      });
    }

    // -------------------------------------------------------
    // STEP 3 — Controlled test application
    // -------------------------------------------------------

    const formData =
      new URLSearchParams();

    // =======================================================
    // PRIMARY APPLICANT
    // =======================================================

    formData.set(
      "client_name",
      "MOW App Real Form Test"
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
      `mow-real-form-test-${Date.now()}@example.com`
    );

    // =======================================================
    // EMERGENCY CONTACT
    // =======================================================

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

    // =======================================================
    // PRIMARY APPLICANT HEALTH QUESTIONS
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

    // =======================================================
    // PET
    // =======================================================

    formData.set(
      "do_you_own_a_pet_2",
      "Yes"
    );

    formData.append(
      "what_pet_s_do_you_own_[Dog]",
      "Dog"
    );

    // =======================================================
    // OPTIONAL MEDICAL COMMENTS
    // =======================================================

    formData.set(
      "are_there_any_other_medical_restrictions_or_conditions_we_should_be_aware_of_",
      "MOW App integration test — no actual medical restrictions."
    );

    // =======================================================
    // ADDITIONAL HOUSEHOLD MEMBER
    //
    // THIS TEST CHANGES THE ANSWER TO YES
    // AND SELECTS 1 ADDITIONAL PERSON.
    // =======================================================

    formData.set(
      "would_anyone_else_in_your_home_like_to_be_included_in_this_meal_",
      "Yes"
    );

    formData.set(
      "number_of_additional_people_in_home_requiring_meal_service",
      "1"
    );

    // -------------------------------------------------------
    // ADDITIONAL HOUSEHOLD MEMBER #1
    // -------------------------------------------------------

    formData.set(
      "client_name_add_1",
      "MOW Test Household Member One"
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

    /*
     * Drupal's Build screen showed the first additional
     * member veteran key as "are_you_a_veteran_".
     */
    formData.set(
      "are_you_a_veteran_",
      "No"
    );

    formData.set(
      "medical_restrictions_or_conditions_we_should_add_1",
      "No additional medical restrictions for test household member."
    );

    // =======================================================
    // DRUPAL HIDDEN FIELDS
    // =======================================================

    formData.set(
      "form_build_id",
      formBuildId
    );

    if (formToken) {
      formData.set(
        "form_token",
        formToken
      );
    }

    formData.set(
      "form_id",
      formId
    );

    formData.set(
      "op",
      "Submit"
    );

    // -------------------------------------------------------
    // STEP 4 — Submit to Drupal
    // -------------------------------------------------------

    const submitResponse =
      await fetch(DRUPAL_FORM_URL, {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",

          Accept: "text/html",

          "User-Agent":
            "MOW-Pasco-App-Meal-Registration-Test",
        },

        body: formData.toString(),

        redirect: "follow",
      });

    const responseText =
      await submitResponse.text();

    const finalUrl =
      submitResponse.url || "";

    const reachedConfirmation =
      finalUrl.includes("/confirmation");

    const lowerResponse =
      responseText.toLowerCase();

    const validationIndicators = [
      "form-item--error",
      "messages--error",
      "alert-danger",
      "error-message",
      "is required",
      "required field",
    ];

    const validationDetected =
      validationIndicators.some(
        (indicator) =>
          lowerResponse.includes(indicator)
      );

    // -------------------------------------------------------
    // SUCCESS
    // -------------------------------------------------------

    if (
      submitResponse.ok &&
      reachedConfirmation
    ) {
      return jsonResponse(200, {
        ok: true,

        stage:
          "meal-registration-one-household-member",

        drupalStatus:
          submitResponse.status,

        finalUrl,

        message:
          "SUCCESS — Drupal accepted the Meal Delivery Registration test with one additional household member.",
      });
    }

    // -------------------------------------------------------
    // DIAGNOSTIC
    // -------------------------------------------------------

    const diagnosticText =
      cleanHtml(responseText).slice(
        0,
        4500
      );

    return jsonResponse(422, {
      ok: false,

      stage:
        "meal-registration-one-household-member-test",

      drupalStatus:
        submitResponse.status,

      finalUrl,

      reachedConfirmation,

      validationDetected,

      testScenario: {
        pet: "Yes",
        petType: "Dog",
        additionalMealService: "Yes",
        additionalPeople: "1",
      },

      memberOneAttempted: {
        client_name_add_1: true,
        dob_add_1: true,
        diabetic_add_1: true,
        are_you_allergic_nuts_add_1: true,
        are_you_allergic_to_seafood_add_1: true,
        are_you_a_veteran_: true,
        medical_restrictions_or_conditions_we_should_add_1:
          true,
      },

      diagnosticText,

      message:
        "Drupal received the one-additional-household-member test. Review diagnosticText for any remaining household-member validation errors. CAPTCHA and Signature are intentionally not included yet.",
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,

      stage:
        "meal-registration-one-household-member-test",

      message:
        error instanceof Error
          ? error.message
          : "Unknown server-side error.",
    });
  }
}


// ---------------------------------------------------------
// Clean Drupal HTML for readable diagnostics
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
// Escape text used inside RegExp
// ---------------------------------------------------------

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}


// ---------------------------------------------------------
// Standard JSON response
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