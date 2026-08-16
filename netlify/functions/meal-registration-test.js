export async function handler() {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/webform/meal_delivery_registration";

  try {
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

    const getHiddenValue = (name) => {
      const pattern = new RegExp(
        `name=["']${name}["'][^>]*value=["']([^"']*)["']`,
        "i"
      );

      const reversePattern = new RegExp(
        `value=["']([^"']*)["'][^>]*name=["']${name}["']`,
        "i"
      );

      const match = html.match(pattern) || html.match(reversePattern);

      return match ? match[1] : "";
    };

    const formBuildId = getHiddenValue("form_build_id");
    const formToken = getHiddenValue("form_token");
    const formId = getHiddenValue("form_id");

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

    const formData = new URLSearchParams();

    formData.set("client_name", "MOW App Real Form Test");
    formData.set("dob", "01/15/1945");
    formData.set("address", "123 Test Street");
    formData.set("mobile_home_park_subdivision", "Test Community");
    formData.set("city", "Zephyrhills");
    formData.set("state", "Florida");
    formData.set("zip_code", "33542");
    formData.set("primary_contact_phone", "813-555-0100");

    formData.set(
      "email",
      `mow-real-form-test-${Date.now()}@example.com`
    );

    formData.set(
      "emergency_contact",
      "Test Emergency Contact"
    );

    formData.set("relationship", "Friend");
    formData.set("home_mobile_phone_", "813-555-0101");
    formData.set("email_ec", "emergency-test@example.com");

    formData.set("are_you_a_diabetic_", "No");
    formData.set("are_you_allergic_to_nuts_", "No");
    formData.set("are_you_allergic_to_seafood_", "No");
    formData.set("are_you_a_veteran_1", "No");
    formData.set("do_you_own_a_pet_", "No");

    formData.set("form_build_id", formBuildId);

    if (formToken) {
      formData.set("form_token", formToken);
    }

    formData.set("form_id", formId);
    formData.set("op", "Submit");

    const submitResponse = await fetch(DRUPAL_FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html",
        "User-Agent": "MOW-Pasco-App-Meal-Registration-Test",
      },
      body: formData.toString(),
      redirect: "follow",
    });

    const responseText = await submitResponse.text();
    const finalUrl = submitResponse.url || "";

    const reachedConfirmation =
      finalUrl.includes("/confirmation");

    const lowerResponse = responseText.toLowerCase();

    const validationIndicators = [
      "form-item--error",
      "messages--error",
      "alert-danger",
      "error-message",
      "is required",
      "required field",
    ];

    const validationDetected =
      validationIndicators.some((indicator) =>
        lowerResponse.includes(indicator)
      );

    if (submitResponse.ok && reachedConfirmation) {
      return jsonResponse(200, {
        ok: true,
        stage: "meal-registration-submission",
        drupalStatus: submitResponse.status,
        finalUrl,
        message:
          "SUCCESS — Drupal accepted the Meal Delivery Registration test submission.",
      });
    }

    // Extract useful human-readable text from Drupal's response.
    const diagnosticText = cleanHtml(responseText).slice(0, 2500);

    return jsonResponse(422, {
      ok: false,
      stage: "meal-registration-diagnostic",
      drupalStatus: submitResponse.status,
      finalUrl,
      reachedConfirmation,
      validationDetected,

      hiddenFields: {
        form_build_id: true,
        form_token: Boolean(formToken),
        form_id: true,
      },

      fieldsAttempted: {
        client_name: true,
        dob: true,
        address: true,
        mobile_home_park_subdivision: true,
        city: true,
        state: true,
        zip_code: true,
        primary_contact_phone: true,
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

      diagnosticText,

      message:
        "Drupal rejected the test request. The diagnosticText field contains a cleaned excerpt of Drupal's response so we can identify the cause.",
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      stage: "meal-registration-test",
      message:
        error instanceof Error
          ? error.message
          : "Unknown server-side error.",
    });
  }
}

function cleanHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(data),
  };
}