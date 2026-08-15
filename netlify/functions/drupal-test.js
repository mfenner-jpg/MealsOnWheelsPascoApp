export async function handler() {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/form/mow-app-connection-test";

  try {
    // STEP 1: Load the Drupal Webform page.
    const formResponse = await fetch(DRUPAL_FORM_URL, {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": "MOW-Pasco-App-Netlify-Test",
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
          stage: "load-test-webform",
          drupalStatus: formResponse.status,
          message: "Netlify could not load the Drupal test Webform.",
        }),
      };
    }

    // STEP 2: Read Drupal's hidden form values.
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

    // Drupal may legitimately omit form_token on some forms.
    if (!formBuildId || !formId) {
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ok: false,
          stage: "prepare-test-submission",
          hiddenFields: {
            form_build_id: Boolean(formBuildId),
            form_token: Boolean(formToken),
            form_id: Boolean(formId),
          },
          message:
            "Netlify reached Drupal, but required hidden form values could not be read.",
        }),
      };
    }

    // STEP 3: Create a harmless temporary test submission.
    const formData = new URLSearchParams();

    formData.set("name", "MOW App Connection Test");
    formData.set(
      "email",
      `mow-app-test-${Date.now()}@example.com`
    );
    formData.set("telephone", "813-555-0100");

    formData.set("form_build_id", formBuildId);

    if (formToken) {
      formData.set("form_token", formToken);
    }

    formData.set("form_id", formId);
    formData.set("op", "Submit");

    // STEP 4: Submit the form back to Drupal.
    const submitResponse = await fetch(DRUPAL_FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html",
        "User-Agent": "MOW-Pasco-App-Netlify-Test",
      },
      body: formData.toString(),
      redirect: "follow",
    });

    const responseText = await submitResponse.text();

    const lowerResponse = responseText.toLowerCase();

    const possibleDrupalError =
      lowerResponse.includes("error") ||
      lowerResponse.includes("required field") ||
      lowerResponse.includes("is required");

    return {
      statusCode: submitResponse.ok && !possibleDrupalError ? 200 : 502,

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ok: submitResponse.ok && !possibleDrupalError,

        stage: "submit-test-webform",

        drupalStatus: submitResponse.status,

        finalUrl: submitResponse.url,

        hiddenFields: {
          form_build_id: true,
          form_token: Boolean(formToken),
          form_id: true,
        },

        submittedFields: {
          name: true,
          email: true,
          telephone: true,
        },

        possibleDrupalError,

        message:
          submitResponse.ok && !possibleDrupalError
            ? "Netlify submitted the temporary test form to Drupal."
            : "Netlify attempted the Drupal submission, but Drupal may have rejected it.",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ok: false,

        stage: "submit-test-webform",

        message:
          error instanceof Error
            ? error.message
            : "Unknown server-side error.",
      }),
    };
  }
}