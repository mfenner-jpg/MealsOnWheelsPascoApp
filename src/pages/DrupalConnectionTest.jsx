export async function handler() {
  const drupalFormUrl =
    "https://www.mealsonwheelspasco.org/form/mow-app-connection-test";

  const testSubmission = {
    name: "Netlify Test",
    email: "mowapptest@example.com",
    telephone: "813-555-0100",
  };

  try {
    const getResponse = await fetch(drupalFormUrl, {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": "MOW-App-Drupal-Submission-Test/1.0",
      },
      redirect: "follow",
    });

    const html = await getResponse.text();

    if (!getResponse.ok) {
      return jsonResponse(502, {
        ok: false,
        stage: "load-form",
        message: `Drupal returned HTTP ${getResponse.status} while loading the test form.`,
      });
    }

    const getHiddenValue = (name) => {
      const firstPattern = new RegExp(
        `<input[^>]*name=["']${name}["'][^>]*value=["']([^"']*)["'][^>]*>`,
        "i"
      );

      const secondPattern = new RegExp(
        `<input[^>]*value=["']([^"']*)["'][^>]*name=["']${name}["'][^>]*>`,
        "i"
      );

      const match = html.match(firstPattern) || html.match(secondPattern);

      return match ? match[1] : null;
    };

    const formBuildId = getHiddenValue("form_build_id");
    const formToken = getHiddenValue("form_token");
    const formId = getHiddenValue("form_id");

    if (!formBuildId || !formId) {
      return jsonResponse(422, {
        ok: false,
        stage: "read-form",
        message:
          "Drupal loaded, but the required form_build_id or form_id value was not found.",
        hiddenFields: {
          form_build_id: Boolean(formBuildId),
          form_token: Boolean(formToken),
          form_id: Boolean(formId),
        },
      });
    }

    const cookieHeader = getCookieHeader(getResponse.headers);

    const formData = new URLSearchParams();

    formData.set("name", testSubmission.name);
    formData.set("email", testSubmission.email);
    formData.set("telephone", testSubmission.telephone);
    formData.set("form_build_id", formBuildId);
    formData.set("form_id", formId);
    formData.set("op", "Submit");

    if (formToken) {
      formData.set("form_token", formToken);
    }

    const postHeaders = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "text/html",
      "User-Agent": "MOW-App-Drupal-Submission-Test/1.0",
      Referer: drupalFormUrl,
    };

    if (cookieHeader) {
      postHeaders.Cookie = cookieHeader;
    }

    const postResponse = await fetch(drupalFormUrl, {
      method: "POST",
      headers: postHeaders,
      body: formData.toString(),
      redirect: "follow",
    });

    const resultHtml = await postResponse.text();

    const looksLikeValidationError =
      /form-item--error|messages--error|alert-danger|error-message/i.test(
        resultHtml
      );

    const stillShowsBlankTestForm =
      /name=["']name["'][^>]*value=["']["']/i.test(resultHtml) &&
      /name=["']email["'][^>]*value=["']["']/i.test(resultHtml);

    const likelyAccepted =
      postResponse.ok &&
      !looksLikeValidationError &&
      !stillShowsBlankTestForm;

    return jsonResponse(likelyAccepted ? 200 : 422, {
      ok: likelyAccepted,
      stage: "submit-test-webform",
      drupalStatus: postResponse.status,
      finalUrl: postResponse.url,
      hiddenFields: {
        form_build_id: true,
        form_token: Boolean(formToken),
        form_id: true,
      },
      submitted: testSubmission,
      message: likelyAccepted
        ? "TEST SUBMISSION SENT — check Drupal Results for the Netlify Test record."
        : "Drupal received the POST, but the response did not clearly confirm a successful submission. Check Drupal Results before we change anything else.",
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      stage: "submit-test-webform",
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
}

function getCookieHeader(headers) {
  if (typeof headers.getSetCookie === "function") {
    const cookies = headers.getSetCookie();

    if (cookies.length) {
      return cookies
        .map((cookie) => cookie.split(";")[0])
        .filter(Boolean)
        .join("; ");
    }
  }

  const singleCookie = headers.get("set-cookie");

  if (!singleCookie) {
    return "";
  }

  return singleCookie.split(";")[0];
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