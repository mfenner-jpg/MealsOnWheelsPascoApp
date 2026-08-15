export async function handler() {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/form/mow-app-connection-test";

  try {
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

    const finalUrl = submitResponse.url || "";

    const reachedConfirmation =
      finalUrl.includes("/confirmation");

    const accepted =
      submitResponse.ok && reachedConfirmation;

    return {
      statusCode: accepted ? 200 : 502,

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ok: accepted,

        stage: "submit-test-webform",

        drupalStatus: submitResponse.status,

        finalUrl,

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

        message: accepted
          ? "SUCCESS — Drupal accepted and stored the test submission."
          : "Netlify submitted the form, but Drupal did not redirect to the expected confirmation page.",
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