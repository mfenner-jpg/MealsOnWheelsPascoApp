import "./MealApplicationConfirmation.css";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4 10-10" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v11h14V10M9 21v-7h6v7" />
    </svg>
  );
}

function MealApplicationConfirmation() {
  return (
    <main className="meal-confirmation">
      <section className="meal-confirmation__shell">
        <div className="meal-confirmation__content">
          <div
            className="meal-confirmation__success-icon"
            aria-hidden="true"
          >
            <CheckIcon />
          </div>

          <div className="meal-confirmation__eyebrow">
            APPLICATION SUBMITTED
          </div>

          <h1>Thank you. We received your application.</h1>

          <p className="meal-confirmation__intro">
            A member of our Meals on Wheels Pasco team will review your
            information and contact you within 3 business days.
          </p>

          <div className="meal-confirmation__divider" aria-hidden="true">
            <span />
            <strong>♥</strong>
            <span />
          </div>

          <div className="meal-confirmation__card">
            <h2>What happens next?</h2>

            <div className="meal-confirmation__step">
              <div className="meal-confirmation__step-number">1</div>
              <div>
                <strong>We review your application</strong>
                <p>
                  Our team will review the information you submitted.
                </p>
              </div>
            </div>

            <div className="meal-confirmation__step">
              <div className="meal-confirmation__step-number">2</div>
              <div>
                <strong>We’ll contact you</strong>
                <p>
                  Someone from our team will reach out within 3 business
                  days to discuss the next steps.
                </p>
              </div>
            </div>

            <div className="meal-confirmation__step">
              <div className="meal-confirmation__step-number">3</div>
              <div>
                <strong>We’ll help you get started</strong>
                <p>
                  Once everything is confirmed, we’ll let you know when
                  meal delivery can begin.
                </p>
              </div>
            </div>
          </div>

          <div className="meal-confirmation__note">
            <strong>Need help while you wait?</strong>
            <p>
              Call us at <a href="tel:18137827859">813-782-7859</a>
              <br />
              Monday–Friday · 8:00 AM–1:00 PM
            </p>
          </div>

          <blockquote className="meal-confirmation__quote">
            “Food is more than nourishment—it is comfort, independence,
            and connection.”
          </blockquote>
        </div>

        <footer className="meal-confirmation__footer">
          <a
            className="meal-confirmation__primary"
            href="/get-meals"
          >
            <HomeIcon />
            <span>Return to Get Meals</span>
          </a>

          <a
            className="meal-confirmation__secondary"
            href="/"
          >
            Back to Home
          </a>
        </footer>
      </section>
    </main>
  );
}

export default MealApplicationConfirmation;