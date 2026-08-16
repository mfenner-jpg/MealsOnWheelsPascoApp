export async function handler() {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/form/meal_delivery_registration";

  try {
    // -------------------------------------------------------
    // STEP 1
    // Load the real Meal Delivery Registration form from Drupal
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
    // Read Drupal's hidden Webform values
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
    // Build a CONTROLLED TEST submission.
    //
    // We are intentionally submitting only the standard
    // contact/application fields at this stage.
    //
    // We are NOT yet trying to bypass or fake:
    // - Signature
    // - CAPTCHA
    // - Medical questions
    // - Pet questions
    // - Additional household members
    //
    // Drupal is expected to validate anything still required.
    // -------------------------------------------------------

    const formData =
      new URLSearchParams();

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
    // Send the controlled test to Drupal
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
    // Determine what Drupal did
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
    // Successful real-form submission
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
    // Expected outcome for this first test:
    // Drupal receives the fields but rejects the incomplete
    // application because required fields are still missing.
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
        },

        message:
          "Drupal received the Meal Delivery Registration test request but did not accept the incomplete application. This is expected while required medical, conditional, CAPTCHA, and signature fields are not yet included.",
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