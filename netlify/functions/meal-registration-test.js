export async function handler(event) {
  const DRUPAL_FORM_URL =
    "https://www.mealsonwheelspasco.org/webform/meal_delivery_registration";

  try {
    if (!event.httpMethod || event.httpMethod === "GET") {
      return await loadDrupalState();
    }

    if (event.httpMethod === "POST") {
      return await submitApplication(event);
    }

    return jsonResponse(405, {
      ok: false,
      message: "Method not allowed.",
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      stage: "meal-registration-submit",
      message:
        error instanceof Error
          ? error.message
          : "Unknown server-side error.",
    });
  }

  async function loadDrupalState() {
    const formResponse = await fetch(DRUPAL_FORM_URL, {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": "MOW-Pasco-App-Meal-Registration",
      },
      redirect: "follow",
    });

    const html = await formResponse.text();

    if (!formResponse.ok) {
      return jsonResponse(502, {
        ok: false,
        stage: "load-drupal-form",
        drupalStatus: formResponse.status,
        message:
          "The Meal Delivery Registration form could not be loaded.",
      });
    }

    const formBuildId = getInputValue(html, "form_build_id");
    const formToken = getInputValue(html, "form_token");
    const formId = getInputValue(html, "form_id");
    const captchaSid = getInputValue(html, "captcha_sid");
    const captchaToken = getInputValue(html, "captcha_token");

    const captchaResponseField =
      findInputNameById(html, "edit-captcha-response") ||
      "captcha_response";

    const captchaQuestion = extractMathQuestion(html);

    if (
      !formBuildId ||
      !formId ||
      !captchaSid ||
      !captchaToken ||
      !captchaQuestion
    ) {
      return jsonResponse(502, {
        ok: false,
        stage: "prepare-drupal-form",
        found: {
          form_build_id: Boolean(formBuildId),
          form_token: Boolean(formToken),
          form_id: Boolean(formId),
          captcha_sid: Boolean(captchaSid),
          captcha_token: Boolean(captchaToken),
          captcha_question: Boolean(captchaQuestion),
        },
        message:
          "Drupal loaded, but the application security values could not be prepared.",
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
    });
  }

  async function submitApplication(event) {
    let payload = {};

    try {
      payload = JSON.parse(event.body || "{}");
    } catch {
      return jsonResponse(400, {
        ok: false,
        stage: "read-application",
        message:
          "The application request was not valid JSON.",
      });
    }

    const {
      application,
      captchaResponse,
      captchaResponseField,
      signature,
      state,
    } = payload;

    if (!application) {
      return jsonResponse(400, {
        ok: false,
        stage: "validate-application",
        message:
          "Application information is missing.",
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
        stage: "validate-security",
        message:
          "CAPTCHA answer, signature, or Drupal form state is missing.",
      });
    }

    if (!signature.startsWith("data:image/png;base64,")) {
      return jsonResponse(400, {
        ok: false,
        stage: "validate-signature",
        message:
          "The signature is not in the expected PNG format.",
      });
    }

    const formData = new URLSearchParams();

    formData.set("client_name", clean(application.clientName));
    formData.set("dob", toDrupalDate(application.dob));
    formData.set("address", clean(application.address));
    formData.set(
      "mobile_home_park_subdivision",
      clean(application.mobileHomeParkSubdivision)
    );
    formData.set("city", clean(application.city));
    formData.set("state", clean(application.state));
    formData.set("zip_code", clean(application.zipCode));
    formData.set(
      "primary_contact_phone",
      clean(application.primaryPhone)
    );
    formData.set("email", clean(application.email));

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

    formData.set(
      "are_there_any_other_medical_restrictions_or_conditions_we_should_be_aware_of_",
      clean(application.medicalRestrictions)
    );

    formData.set(
      "would_anyone_else_in_your_home_like_to_be_included_in_this_meal_",
      clean(application.additionalMealService)
    );

    if (application.additionalMealService === "Yes") {
      formData.set(
        "number_of_additional_people_in_home_requiring_meal_service",
        clean(application.additionalPeople)
      );

      if (
        application.additionalPeople === "1" ||
        application.additionalPeople === "2"
      ) {
        const m1 = application.member1 || {};

        formData.set("client_name_add_1", clean(m1.name));
        formData.set("dob_add_1", toDrupalDate(m1.dob));
        formData.set("diabetic_add_1", clean(m1.diabetic));
        formData.set(
          "are_you_allergic_nuts_add_1",
          clean(m1.allergicNuts)
        );
        formData.set(
          "are_you_allergic_to_seafood_add_1",
          clean(m1.allergicSeafood)
        );
        formData.set(
          "are_you_a_veteran_",
          clean(m1.veteran)
        );
        formData.set(
          "medical_restrictions_or_conditions_we_should_add_1",
          clean(m1.medicalRestrictions)
        );
      }

      if (application.additionalPeople === "2") {
        const m2 = application.member2 || {};

        formData.set("client_name_add_2", clean(m2.name));
        formData.set("dob_add_2", toDrupalDate(m2.dob));
        formData.set(
          "are_you_a_diabetic_add_2",
          clean(m2.diabetic)
        );
        formData.set(
          "are_you_allergic_to_nuts_add_2",
          clean(m2.allergicNuts)
        );
        formData.set(
          "are_you_allergic_to_seafood_add_2",
          clean(m2.allergicSeafood)
        );
        formData.set(
          "are_you_a_veteran_2",
          clean(m2.veteran)
        );
        formData.set(
          "medical_restrictions_or_conditions_we_should_add_2",
          clean(m2.medicalRestrictions)
        );
      }
    }

    formData.set("captcha_sid", state.captchaSid);
    formData.set("captcha_token", state.captchaToken);
    formData.set(
      captchaResponseField || "captcha_response",
      String(captchaResponse).trim()
    );

    formData.set("signature", signature);

    formData.set("form_build_id", state.formBuildId);

    if (state.formToken) {
      formData.set("form_token", state.formToken);
    }

    formData.set("form_id", state.formId);
    formData.set("op", "Submit");

    const submitResponse =
      await fetch(DRUPAL_FORM_URL, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
          Accept: "text/html",
          "User-Agent":
            "MOW-Pasco-App-Meal-Registration",
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

    const diagnosticText =
      cleanHtml(responseText).slice(0, 5000);

    if (
      submitResponse.ok &&
      reachedConfirmation
    ) {
      return jsonResponse(200, {
        ok: true,
        stage: "meal-application-submitted",
        drupalStatus:
          submitResponse.status,
        finalUrl,
      });
    }

    return jsonResponse(422, {
      ok: false,
      stage: "meal-application-validation",
      drupalStatus:
        submitResponse.status,
      finalUrl,
      reachedConfirmation,
      diagnosticText,
      message:
        "Drupal received the application but did not accept it. Review diagnosticText for the remaining validation issue.",
    });
  }
}

function clean(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toDrupalDate(value) {
  const input = clean(value);

  if (!input) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const match =
    input.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

  if (!match) {
    return input;
  }

  const month = match[1].padStart(2, "0");
  const day = match[2].padStart(2, "0");
  const year = match[3];

  return `${year}-${month}-${day}`;
}

function getInputValue(html, name) {
  const escaped = escapeRegex(name);

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

function findInputNameById(html, id) {
  const escaped = escapeRegex(id);

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

function extractMathQuestion(html) {
  const text = cleanHtml(html);

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
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type":
        "application/json",
      "Cache-Control":
        "no-store",
    },
    body: JSON.stringify(data),
  };
}