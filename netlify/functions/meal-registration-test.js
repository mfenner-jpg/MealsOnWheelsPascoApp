export async function handler() {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/webform/meal_delivery_registration";

  try {
    // -------------------------------------------------------
    // STEP 1
    // Load the real Meal Delivery Registration form
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
      return {
        statusCode: 502,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ok: false,

          stage: "load-meal-registration-form",

          drupalStatus: formResponse.status,

          message:
            "Netlify could not load the Meal Delivery Registration form from Drupal.",
        }),
      };
    }

    // -------------------------------------------------------
    // STEP 2
    // Read Drupal hidden Webform values
    // -------------------------------------------------------

    const getHiddenValue = (name) => {
      const pattern = new RegExp(
        `name=["']${name}["'][^>]*value=["']([^"']*)["']`,
        "i"
      );

      const reversePattern = new RegExp(
        `value=["']([^"']*)["'][^>]*name=["']${name}["']`,
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
      return {
        statusCode: 502,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ok: false,

          stage: "prepare-meal-registration",

          hiddenFields: {
            form_build_id: Boolean(formBuildId),
            form_token: Boolean(formToken),
            form_id: Boolean(formId),
          },

          message:
            "Netlify reached the Meal Delivery Registration form, but required Drupal hidden values could not be read.",
        }),
      };
    }

    // -------------------------------------------------------
    // STEP 3
    // Create controlled test application
    // -------------------------------------------------------

    const formData =
      new URLSearchParams();

    // Primary applicant information

    formData.set(
      "client_name",
      "MOW App Real Form Test"
    );

    formData.set(
      "dob",
      "01/15/1945"
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

    // -------------------------------------------------------
    // Emergency contact
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // Required health / household questions
    //
    // For this controlled test we are selecting NO.
    // These correspond to the field keys shown in Drupal.
    // -------------------------------------------------------

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

    formData.set(
      "do_you_own_a_pet_",
      "No"
    );

    // -------------------------------------------------------
    // Drupal hidden fields
    // -------------------------------------------------------

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
    // STEP 4
    // Submit controlled test to Drupal
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

    // -------------------------------------------------------
    // STEP 5
    // Determine Drupal result
    // -------------------------------------------------------

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
      return {
        statusCode: 200,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ok: true,

          stage:
            "meal-registration-submission",

          drupalStatus:
            submitResponse.status,

          finalUrl,

          hiddenFields: {
            form_build_id: true,
            form_token:
              Boolean(formToken),
            form_id: true,
          },

          message:
            "SUCCESS — Drupal accepted the Meal Delivery Registration test submission.",
        }),
      };
    }

    // -------------------------------------------------------
    // EXPECTED VALIDATION RESPONSE
    // -------------------------------------------------------

    return {
      statusCode: 422,

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ok: false,

        stage:
          "meal-registration-validation",

        drupalStatus:
          submitResponse.status,

        finalUrl,

        reachedConfirmation,

        validationDetected,

        hiddenFields: {
          form_build_id: true,
          form_token:
            Boolean(formToken),
          form_id: true,
        },

        fieldsAttempted: {
          client_name: true,
          dob: true,
          address: true,
          mobile_home_park_subdivision:
            true,
          city: true,
          state: true,
          zip_code: true,
          primary_contact_phone:
            true,
          email: true,

          emergency_contact: true,
          relationship: true,
          home_mobile_phone_: true,
          email_ec: true,

          are_you_a_diabetic_: true,
          are_you_allergic_to_nuts_: true,
          are_you_allergic_to_seafood_: true,
          are_you_a_veteran_1: true,
          do_you_own_a_pet_: true,
        },

        message:
          "Drupal received the Meal Delivery Registration test request. The five required Yes/No questions are now included. Remaining required or conditional fields still need to be mapped before Drupal can accept the complete application.",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        ok: false,

        stage:
          "meal-registration-test",

        message:
          error instanceof Error
            ? error.message
            : "Unknown server-side error.",
      }),
    };
  }
}