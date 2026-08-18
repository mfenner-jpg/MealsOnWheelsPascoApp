import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MealApplication.css";
import welcomeHouse from "../assets/meal-application-welcome-house.png";

const INITIAL_FORM = {
  clientName: "",
  dob: "",
  address: "",
  mobileHomeParkSubdivision: "",
  city: "",
  state: "FL",
  zipCode: "",
  primaryPhone: "",
  email: "",
  emergencyContact: "",
  relationship: "",
  emergencyPhone: "",
  emergencyEmail: "",
  diabetic: "",
  allergicNuts: "",
  allergicSeafood: "",
  veteran: "",
  ownPet: "",
  pets: [],
  medicalRestrictions: "",
  additionalMealService: "",
  additionalPeople: "",
  member1: {
    name: "",
    dob: "",
    diabetic: "",
    allergicNuts: "",
    allergicSeafood: "",
    veteran: "",
    medicalRestrictions: "",
  },
  member2: {
    name: "",
    dob: "",
    diabetic: "",
    allergicNuts: "",
    allergicSeafood: "",
    veteran: "",
    medicalRestrictions: "",
  },
  captchaAnswer: "",
  signatureData: "",
};

function MealApplication() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaResponseField, setCaptchaResponseField] =
    useState("captcha_response");
  const [captchaState, setCaptchaState] = useState(null);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const steps = useMemo(() => {
    const items = [
      { id: "welcome", label: "Welcome" },
      { id: "name", label: "Name" },
      { id: "dob", label: "DOB" },
      { id: "address", label: "Address" },
      { id: "phone", label: "Phone" },
      { id: "email", label: "Email" },
      { id: "emergency", label: "Emergency" },
      { id: "health", label: "Health" },
      { id: "pet", label: "Pet" },
    ];

    if (form.ownPet === "Yes") {
      items.push({ id: "petType", label: "Pet Type" });
    }

    items.push(
      { id: "medical", label: "Medical" },
      { id: "additional", label: "Household" }
    );

    if (form.additionalMealService === "Yes") {
      items.push({ id: "additionalCount", label: "Count" });

      if (form.additionalPeople === "1" || form.additionalPeople === "2") {
        items.push({ id: "member1", label: "Member 1" });
      }

      if (form.additionalPeople === "2") {
        items.push({ id: "member2", label: "Member 2" });
      }
    }

    items.push(
      { id: "verification", label: "Verification" },
      { id: "signature", label: "Signature" },
      { id: "review", label: "Review" }
    );

    return items;
  }, [form.ownPet, form.additionalMealService, form.additionalPeople]);

  const current = steps[step] || steps[0];
  const progress = Math.max(4, Math.round(((step + 1) / steps.length) * 100));

  const loadSecurityQuestion = async () => {
    setSecurityLoading(true);
    setError("");

    setCaptchaQuestion("");
    setCaptchaResponseField("captcha_response");
    setCaptchaState(null);

    try {
      const response = await fetch(
        "/.netlify/functions/meal-registration-test",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (
        response.ok &&
        data.ok &&
        data.stage === "meal-application-ready"
      ) {
        setCaptchaQuestion(data.captcha?.question || "");
        setCaptchaState(data.state || null);

        setCaptchaResponseField(
          data.captcha?.responseField || "captcha_response"
        );

        setError("");
      } else {
        setError(
          data.message ||
            `The security service returned HTTP ${response.status}.`
        );
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The security question could not be loaded."
      );
    } finally {
      setSecurityLoading(false);
    }
  };

  useEffect(() => {
    if (
      current.id === "verification" &&
      !captchaState &&
      !securityLoading
    ) {
      loadSecurityQuestion();
    }
    // Intentionally trigger when the user reaches the verification step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const updateMember = (memberKey, field, value) => {
    setForm((prev) => ({
      ...prev,
      [memberKey]: {
        ...prev[memberKey],
        [field]: value,
      },
    }));
    setError("");
  };

  const togglePet = (pet) => {
    setForm((prev) => {
      const exists = prev.pets.includes(pet);

      return {
        ...prev,
        pets: exists
          ? prev.pets.filter((item) => item !== pet)
          : [...prev.pets, pet],
      };
    });

    setError("");
  };

  const validateCurrentStep = () => {
    const id = current.id;

    if (id === "name" && !form.clientName.trim()) {
      return "Please enter the client’s full name.";
    }

    if (id === "dob" && !form.dob.trim()) {
      return "Please enter the client’s date of birth.";
    }

    if (
      id === "address" &&
      (!form.address.trim() ||
        !form.city.trim() ||
        !form.state.trim() ||
        !form.zipCode.trim())
    ) {
      return "Please complete the required address fields.";
    }

    if (id === "phone" && !form.primaryPhone.trim()) {
      return "Please enter the primary contact phone number.";
    }

    if (id === "email" && !form.email.trim()) {
      return "Please enter an email address.";
    }

    if (
      id === "emergency" &&
      (!form.emergencyContact.trim() ||
        !form.relationship.trim() ||
        !form.emergencyPhone.trim() ||
        !form.emergencyEmail.trim())
    ) {
      return "Please complete the emergency contact information.";
    }

    if (
      id === "health" &&
      (!form.diabetic ||
        !form.allergicNuts ||
        !form.allergicSeafood ||
        !form.veteran)
    ) {
      return "Please answer all four questions.";
    }

    if (id === "pet" && !form.ownPet) {
      return "Please select Yes or No.";
    }

    if (id === "petType" && form.pets.length === 0) {
      return "Please select at least one pet.";
    }

    if (id === "additional" && !form.additionalMealService) {
      return "Please select Yes or No.";
    }

    if (
      id === "additionalCount" &&
      !["1", "2"].includes(form.additionalPeople)
    ) {
      return "Please select the number of additional household members.";
    }

    if (id === "member1") {
      const m = form.member1;

      if (
        !m.name.trim() ||
        !m.dob.trim() ||
        !m.diabetic ||
        !m.allergicNuts ||
        !m.allergicSeafood ||
        !m.veteran
      ) {
        return "Please complete the required information for Household Member #1.";
      }
    }

    if (id === "member2") {
      const m = form.member2;

      if (
        !m.name.trim() ||
        !m.dob.trim() ||
        !m.diabetic ||
        !m.allergicNuts ||
        !m.allergicSeafood ||
        !m.veteran
      ) {
        return "Please complete the required information for Household Member #2.";
      }
    }

    if (id === "verification") {
      if (securityLoading) {
        return "Please wait while the security question loads.";
      }

      if (!captchaQuestion || !captchaState) {
        return "Please load the security question before continuing.";
      }

      if (!form.captchaAnswer.trim()) {
        return "Please solve the math verification question.";
      }
    }

    if (id === "signature" && !form.signatureData) {
      return "Please provide a signature.";
    }

    return "";
  };

  const next = () => {
    const message = validateCurrentStep();

    if (message) {
      setError(message);
      return;
    }

    setError("");

    if (step < steps.length - 1) {
      setStep((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const back = () => {
    if (step > 0) {
      setStep((value) => value - 1);
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToReviewSection = (id) => {
    const index = steps.findIndex((item) => item.id === id);

    if (index >= 0) {
      setStep(index);
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    event.preventDefault();

    const rect = canvas.getBoundingClientRect();

    drawingRef.current = true;
    lastPointRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    canvas.setPointerCapture?.(event.pointerId);
  };

  const draw = (event) => {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const previous = lastPointRef.current;

    if (!previous) {
      lastPointRef.current = point;
      return;
    }

    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#13223a";

    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    if (!drawingRef.current) return;

    drawingRef.current = false;
    lastPointRef.current = null;

    const canvas = canvasRef.current;
    if (!canvas) return;

    update("signatureData", canvas.toDataURL("image/png"));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update("signatureData", "");
  };

  const submitApplication = async () => {
    if (submitting) return;

    if (!captchaState || !captchaQuestion) {
      setError(
        "The security verification is not ready. Please return to the verification step and load a fresh question."
      );
      return;
    }

    if (!form.signatureData) {
      setError("Please provide a signature before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        "/.netlify/functions/meal-registration-test",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            application: form,
            captchaResponse: form.captchaAnswer.trim(),
            captchaResponseField,
            signature: form.signatureData,
            state: captchaState,
          }),
        }
      );

      const data = await response.json();

      if (
        response.ok &&
        data.ok &&
        data.stage === "meal-application-submitted"
      ) {
        navigate(
          "/meal-application-confirmation",
          { replace: true }
        );
        return;
      }

      setError(
        data.message ||
          `The application service returned HTTP ${response.status}.`
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The application could not be submitted."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="meal-app">
      <section
        className={`meal-app__shell ${
          current.id === "welcome" ? "is-welcome" : ""
        }`}
      >
        {step > 0 && (
          <div className="meal-app__progress-wrap">
            <div className="meal-app__progress-row">
              <div
                className="meal-app__progress-heart"
                aria-hidden="true"
              >
                ♥
              </div>

              <div className="meal-app__progress-track">
                <div
                  className="meal-app__progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="meal-app__progress-count">
                {step + 1} of {steps.length}
              </div>
            </div>
          </div>
        )}

        <div className="meal-app__content">
          {current.id === "welcome" && (
            <QuestionFrame
              eyebrow="WELCOME"
              title="Let’s get started."
              text="We’ll walk through this together, one simple step at a time, so we can learn how best to support you."
            >
              <div
                className="meal-app__welcome-scene"
                aria-hidden="true"
              >
                <img
                  src={welcomeHouse}
                  alt=""
                  className="meal-app__welcome-art"
                />
              </div>

              <blockquote className="meal-app__welcome-quote">
                “Food is more than nourishment—it is comfort, independence,
                and connection.”
              </blockquote>
            </QuestionFrame>
          )}

          {current.id === "name" && (
            <QuestionFrame
              title="What is your full name?"
              text="Please enter your name as it appears on official documents."
            >
              <Field
                label="Full name"
                required
                value={form.clientName}
                placeholder="Enter your full name"
                onChange={(value) =>
                  update("clientName", value)
                }
              />
            </QuestionFrame>
          )}

          {current.id === "dob" && (
            <QuestionFrame
              title="What is your date of birth?"
              text="This helps us identify the correct client record."
            >
              <DateField
                label="Date of birth"
                required
                value={form.dob}
                onChange={(value) => update("dob", value)}
              />
            </QuestionFrame>
          )}

          {current.id === "address" && (
            <QuestionFrame
              title="What is your current address?"
              text="This helps our drivers know where meals should be delivered."
            >
              <Field
                label="Street address"
                required
                value={form.address}
                placeholder="123 Main Street"
                onChange={(value) => update("address", value)}
              />

              <Field
                label="Mobile Home Park / Subdivision"
                value={form.mobileHomeParkSubdivision}
                placeholder="If applicable"
                onChange={(value) =>
                  update("mobileHomeParkSubdivision", value)
                }
              />

              <div className="meal-app__field-row">
                <Field
                  label="City"
                  required
                  value={form.city}
                  placeholder="City"
                  onChange={(value) => update("city", value)}
                />

                <Field
                  label="State"
                  required
                  value={form.state}
                  placeholder="FL"
                  onChange={(value) => update("state", value)}
                />

                <Field
                  label="ZIP"
                  required
                  value={form.zipCode}
                  placeholder="33542"
                  inputMode="numeric"
                  onChange={(value) => update("zipCode", value)}
                />
              </div>
            </QuestionFrame>
          )}

          {current.id === "phone" && (
            <QuestionFrame
              title="What is your primary phone number?"
              text="We may call if we need to reach you about meal delivery."
            >
              <Field
                label="Primary phone"
                required
                type="tel"
                value={form.primaryPhone}
                placeholder="(813) 555-0100"
                onChange={(value) =>
                  update("primaryPhone", value)
                }
              />
            </QuestionFrame>
          )}

          {current.id === "email" && (
            <QuestionFrame
              title="What is your email address?"
              text="We use this for application and service updates."
            >
              <Field
                label="Email"
                required
                type="email"
                value={form.email}
                placeholder="name@example.com"
                onChange={(value) => update("email", value)}
              />
            </QuestionFrame>
          )}

          {current.id === "emergency" && (
            <QuestionFrame
              title="Who is your emergency contact?"
              text="In case we need to reach someone on your behalf."
            >
              <Field
                label="Emergency contact name"
                required
                value={form.emergencyContact}
                placeholder="Full name"
                onChange={(value) =>
                  update("emergencyContact", value)
                }
              />

              <Field
                label="Relationship"
                required
                value={form.relationship}
                placeholder="Relationship"
                onChange={(value) =>
                  update("relationship", value)
                }
              />

              <Field
                label="Phone number"
                required
                type="tel"
                value={form.emergencyPhone}
                placeholder="(813) 555-0101"
                onChange={(value) =>
                  update("emergencyPhone", value)
                }
              />

              <Field
                label="Email"
                required
                type="email"
                value={form.emergencyEmail}
                placeholder="name@example.com"
                onChange={(value) =>
                  update("emergencyEmail", value)
                }
              />
            </QuestionFrame>
          )}

          {current.id === "health" && (
            <QuestionFrame
              title="A few quick health questions."
              text="These help us plan your meals and service with care."
            >
              <YesNo
                label="Are you a diabetic?"
                value={form.diabetic}
                onChange={(value) =>
                  update("diabetic", value)
                }
              />

              <YesNo
                label="Are you allergic to nuts?"
                value={form.allergicNuts}
                onChange={(value) =>
                  update("allergicNuts", value)
                }
              />

              <YesNo
                label="Are you allergic to seafood?"
                value={form.allergicSeafood}
                onChange={(value) =>
                  update("allergicSeafood", value)
                }
              />

              <YesNo
                label="Are you a veteran?"
                value={form.veteran}
                onChange={(value) =>
                  update("veteran", value)
                }
              />
            </QuestionFrame>
          )}

          {current.id === "pet" && (
            <QuestionFrame
              title="Do you own a pet?"
              text="This helps our drivers be prepared when they visit."
            >
              <ChoiceCards
                value={form.ownPet}
                options={["Yes", "No"]}
                onChange={(value) => {
                  update("ownPet", value);

                  if (value === "No") {
                    update("pets", []);
                  }
                }}
              />
            </QuestionFrame>
          )}

          {current.id === "petType" && (
            <QuestionFrame
              title="What pet(s) do you own?"
              text="Select all that apply."
            >
              <CheckCard
                label="Dog"
                checked={form.pets.includes("Dog")}
                onChange={() => togglePet("Dog")}
              />

              <CheckCard
                label="Cat"
                checked={form.pets.includes("Cat")}
                onChange={() => togglePet("Cat")}
              />
            </QuestionFrame>
          )}

          {current.id === "medical" && (
            <QuestionFrame
              title="Anything else we should know?"
              text="Please tell us about any other medical restrictions or conditions that may help us serve you."
            >
              <label className="meal-app__label">
                Medical restrictions or conditions
              </label>

              <textarea
                className="meal-app__textarea"
                value={form.medicalRestrictions}
                placeholder="Optional"
                rows={6}
                onChange={(event) =>
                  update(
                    "medicalRestrictions",
                    event.target.value
                  )
                }
              />
            </QuestionFrame>
          )}

          {current.id === "additional" && (
            <QuestionFrame
              title="Is there anyone else in the home requesting additional meal service?"
              text="This may include a spouse or another household member."
            >
              <ChoiceCards
                value={form.additionalMealService}
                options={["Yes", "No"]}
                onChange={(value) => {
                  update("additionalMealService", value);

                  if (value === "No") {
                    update("additionalPeople", "");
                  }
                }}
              />
            </QuestionFrame>
          )}

          {current.id === "additionalCount" && (
            <QuestionFrame
              title="How many additional people require meal service?"
              text="Choose the number that applies to this household."
            >
              <ChoiceCards
                value={form.additionalPeople}
                options={["1", "2"]}
                onChange={(value) =>
                  update("additionalPeople", value)
                }
              />
            </QuestionFrame>
          )}

          {current.id === "member1" && (
            <MemberForm
              number={1}
              member={form.member1}
              update={(field, value) =>
                updateMember("member1", field, value)
              }
            />
          )}

          {current.id === "member2" && (
            <MemberForm
              number={2}
              member={form.member2}
              update={(field, value) =>
                updateMember("member2", field, value)
              }
            />
          )}

          {current.id === "verification" && (
            <QuestionFrame
              eyebrow="SECURITY CHECK"
              title="Please solve the math problem."
              text="This quick verification helps protect your application from spam."
            >
              <div className="meal-app__captcha">
                <div className="meal-app__captcha-question">
                  {securityLoading
                    ? "Loading security question…"
                    : captchaQuestion ||
                      "Security question unavailable"}
                </div>

                <Field
                  label="Your answer"
                  required
                  value={form.captchaAnswer}
                  placeholder="Enter your answer"
                  inputMode="numeric"
                  onChange={(value) =>
                    update("captchaAnswer", value)
                  }
                />
              </div>

              <p className="meal-app__note">
                This security question comes directly from the Meals on Wheels
                registration form.
              </p>

              {!securityLoading && !captchaQuestion && (
                <button
                  type="button"
                  className="meal-app__back-link"
                  onClick={loadSecurityQuestion}
                >
                  Try Again
                </button>
              )}
            </QuestionFrame>
          )}

          {current.id === "signature" && (
            <QuestionFrame
              eyebrow="FINAL STEP"
              title="Please provide your signature."
              text="Sign below using your finger, stylus, or mouse."
            >
              <div className="meal-app__signature-wrap">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={300}
                  className="meal-app__signature"
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerCancel={stopDrawing}
                  onPointerLeave={stopDrawing}
                />

                <button
                  type="button"
                  className="meal-app__clear"
                  onClick={clearSignature}
                >
                  Clear signature
                </button>
              </div>
            </QuestionFrame>
          )}

          {current.id === "review" && (
            <QuestionFrame
              eyebrow="REVIEW"
              title="Please review your application."
              text="Make sure everything looks right before submitting."
            >
              <ReviewCard
                title="Client Information"
                lines={[
                  form.clientName || "—",
                  form.dob || "—",
                  form.address || "—",
                  `${form.city || "—"}, ${form.state || "—"} ${
                    form.zipCode || ""
                  }`,
                  form.primaryPhone || "—",
                  form.email || "—",
                ]}
                onEdit={() => goToReviewSection("name")}
              />

              <ReviewCard
                title="Health & Household"
                lines={[
                  `Diabetic: ${form.diabetic || "—"}`,
                  `Nut allergy: ${form.allergicNuts || "—"}`,
                  `Seafood allergy: ${
                    form.allergicSeafood || "—"
                  }`,
                  `Veteran: ${form.veteran || "—"}`,
                  `Pet: ${form.ownPet || "—"}${
                    form.pets.length
                      ? ` — ${form.pets.join(", ")}`
                      : ""
                  }`,
                  `Additional meal service: ${
                    form.additionalMealService || "—"
                  }`,
                ]}
                onEdit={() => goToReviewSection("health")}
              />

              {form.additionalMealService === "Yes" && (
                <ReviewCard
                  title="Additional Household Members"
                  lines={[
                    form.member1.name || "Member #1 not entered",
                    ...(form.additionalPeople === "2"
                      ? [
                          form.member2.name ||
                            "Member #2 not entered",
                        ]
                      : []),
                  ]}
                  onEdit={() =>
                    goToReviewSection("member1")
                  }
                />
              )}

              <div className="meal-app__review-notice">
                <strong>
                  Your information is protected.
                </strong>

                <p>
                  When you submit, this application will be sent securely
                  to the existing Meals on Wheels Drupal registration workflow.
                </p>
              </div>
            </QuestionFrame>
          )}

          {error && (
            <div
              className="meal-app__error"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>

        <footer className="meal-app__footer">
          {current.id === "review" ? (
            <button
              type="button"
              className="meal-app__primary"
              onClick={submitApplication}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit Application"}
              {!submitting && <span>→</span>}
            </button>
          ) : (
            <button
              type="button"
              className="meal-app__primary"
              onClick={next}
            >
              {current.id === "welcome"
                ? "Start Application"
                : "Continue"}
              <span>→</span>
            </button>
          )}

          {step > 0 && (
            <button
              type="button"
              className="meal-app__back-link"
              onClick={back}
            >
              ← Back
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}

function QuestionFrame({
  eyebrow,
  title,
  text,
  children,
}) {
  return (
    <section className="meal-app__question">
      <div className="meal-app__question-mark">
        <span>♥</span>
        <div />
      </div>

      {eyebrow && (
        <div className="meal-app__eyebrow">
          {eyebrow}
        </div>
      )}

      <h1>{title}</h1>

      {text && (
        <p className="meal-app__intro">
          {text}
        </p>
      )}

      <div className="meal-app__answer">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  required = false,
  type = "text",
  value,
  placeholder,
  inputMode,
  onChange,
}) {
  return (
    <label className="meal-app__field">
      <span className="meal-app__label">
        {label}
        {required && (
          <span className="meal-app__required">
            {" "}*
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function DateField({
  label,
  required = false,
  value,
  onChange,
}) {
  const dateToDisplay = (isoDate) => {
    if (!isoDate) return "";

    const [year, month, day] = isoDate.split("-");

    if (!year || !month || !day) {
      return "";
    }

    return `${month}/${day}/${year}`;
  };

  return (
    <div className="meal-app__field">
      <span className="meal-app__label">
        {label}
        {required && (
          <span className="meal-app__required">
            {" "}*
          </span>
        )}
      </span>

      <div className="meal-app__date-control">
        <input
          className="meal-app__date-text"
          type="text"
          value={value}
          placeholder="MM/DD/YYYY"
          inputMode="numeric"
          autoComplete="bday"
          onChange={(event) =>
            onChange(event.target.value)
          }
        />

        <div
          className="meal-app__calendar-button"
          aria-hidden="true"
        >
          <CalendarPickerIcon />
        </div>

        <input
          className="meal-app__native-date-picker"
          type="date"
          aria-label="Choose date from calendar"
          onChange={(event) => {
            const displayValue =
              dateToDisplay(event.target.value);

            if (displayValue) {
              onChange(displayValue);
            }
          }}
        />
      </div>
    </div>
  );
}

function CalendarPickerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" />
      <path d="M7 2v4M17 2v4M3 9h18" />
    </svg>
  );
}

function YesNo({
  label,
  value,
  onChange,
}) {
  return (
    <div className="meal-app__yesno">
      <div className="meal-app__label">
        {label}
        <span className="meal-app__required">
          {" "}*
        </span>
      </div>

      <div className="meal-app__yesno-buttons">
        {["Yes", "No"].map((option) => (
          <button
            type="button"
            key={option}
            className={
              value === option
                ? "is-selected"
                : ""
            }
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChoiceCards({
  value,
  options,
  onChange,
}) {
  return (
    <div className="meal-app__choice-list">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          className={`meal-app__choice ${
            value === option
              ? "is-selected"
              : ""
          }`}
          onClick={() => onChange(option)}
        >
          <span>{option}</span>

          <span className="meal-app__choice-dot">
            {value === option ? "✓" : ""}
          </span>
        </button>
      ))}
    </div>
  );
}

function CheckCard({
  label,
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      className={`meal-app__choice ${
        checked ? "is-selected" : ""
      }`}
      onClick={onChange}
    >
      <span>{label}</span>

      <span className="meal-app__choice-dot">
        {checked ? "✓" : ""}
      </span>
    </button>
  );
}

function MemberForm({
  number,
  member,
  update,
}) {
  return (
    <QuestionFrame
      eyebrow="HOUSEHOLD MEMBER"
      title={`Additional Household Member #${number}`}
      text="Please provide the information below for this household member."
    >
      <Field
        label={`Client Name #${number}`}
        required
        value={member.name}
        placeholder="Full name"
        onChange={(value) =>
          update("name", value)
        }
      />

      <DateField
        label="Date of Birth"
        required
        value={member.dob}
        onChange={(value) =>
          update("dob", value)
        }
      />

      <YesNo
        label="Are you a diabetic?"
        value={member.diabetic}
        onChange={(value) =>
          update("diabetic", value)
        }
      />

      <YesNo
        label="Are you allergic to nuts?"
        value={member.allergicNuts}
        onChange={(value) =>
          update("allergicNuts", value)
        }
      />

      <YesNo
        label="Are you allergic to seafood?"
        value={member.allergicSeafood}
        onChange={(value) =>
          update("allergicSeafood", value)
        }
      />

      <YesNo
        label="Are you a veteran?"
        value={member.veteran}
        onChange={(value) =>
          update("veteran", value)
        }
      />

      <label className="meal-app__field">
        <span className="meal-app__label">
          Other medical restrictions or conditions
        </span>

        <textarea
          className="meal-app__textarea"
          value={member.medicalRestrictions}
          placeholder="Optional"
          rows={5}
          onChange={(event) =>
            update(
              "medicalRestrictions",
              event.target.value
            )
          }
        />
      </label>
    </QuestionFrame>
  );
}

function ReviewCard({
  title,
  lines,
  onEdit,
}) {
  return (
    <div className="meal-app__review-card">
      <div className="meal-app__review-heading">
        <strong>{title}</strong>

        <button
          type="button"
          onClick={onEdit}
        >
          Edit
        </button>
      </div>

      {lines.map((line, index) => (
        <div
          key={`${title}-${index}`}
          className="meal-app__review-line"
        >
          {line}
        </div>
      ))}
    </div>
  );
}

export default MealApplication;