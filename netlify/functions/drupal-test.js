export async function handler() {
  const drupalFormUrl =
    "https://www.mealsonwheelspasco.org/form/mow-app-connection-test";

  try {
    const response = await fetch(drupalFormUrl, {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": "MOW-App-Drupal-Connection-Test/1.0",
      },
    });

    const html = await response.text();

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ok: false,
          stage: "fetch-drupal-form",
          status: response.status,
          message: `Drupal returned HTTP ${response.status}.`,
        }),
      };
    }

    const getHiddenValue = (name) => {
      const pattern = new RegExp(
        `<input[^>]*name=["']${name}["'][^>]*value=["']([^"']*)["'][^>]*>`,
        "i"
      );

      const reversePattern = new RegExp(
        `<input[^>]*value=["']([^"']*)["'][^>]*name=["']${name}["'][^>]*>`,
        "i"
      );

      const match = html.match(pattern) || html.match(reversePattern);

      return match ? match[1] : null;
    };

    const formBuildId = getHiddenValue("form_build_id");
    const formToken = getHiddenValue("form_token");
    const formId = getHiddenValue("form_id");

    const hasNameField = /name=["']name["']/i.test(html);
    const hasEmailField = /name=["']email["']/i.test(html);
    const hasTelephoneField = /name=["']telephone["']/i.test(html);

    const hiddenFieldsFound = Boolean(
      formBuildId &&
      formToken &&
      formId
    );

    const testFieldsFound =
      hasNameField &&
      hasEmailField &&
      hasTelephoneField;

    return {
      statusCode:
        hiddenFieldsFound && testFieldsFound ? 200 : 422,

      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },

      body: JSON.stringify({
        ok: hiddenFieldsFound && testFieldsFound,

        stage: "server-side-drupal-fetch",

        drupalStatus: response.status,

        hiddenFields: {
          form_build_id: Boolean(formBuildId),
          form_token: Boolean(formToken),
          form_id: Boolean(formId),
        },

        testFields: {
          name: hasNameField,
          email: hasEmailField,
          telephone: hasTelephoneField,
        },

        formId,

        message:
          hiddenFieldsFound && testFieldsFound
            ? "SUCCESS — Netlify reached Drupal and found the required Webform fields."
            : "Netlify reached Drupal, but one or more expected Webform fields were not found.",
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
        stage: "server-side-drupal-fetch",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      }),
    };
  }
}