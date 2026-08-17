import { useState } from "react";
import "./ArrangeHomeDelivery.css";

import heroImage from "../assets/arrange-home-delivery-hero-v3.jpg";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M10 7l-5 5 5 5" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v11h14V10M9 21v-7h6v7" />
    </svg>
  );
}

function MealIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10" />
      <path d="M16 3c3 0 4 4 4 8v3h-4V3ZM18 14v7" />
    </svg>
  );
}

function PantryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8h14l1 13H4L5 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16v15H4zM8 3v6M16 3v6M4 11h16" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 5h6M9 3h6v4H9z" />
      <path d="M6 5h12v16H6z" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h3l1 5-2 1a14 14 0 0 0 6 6l1-2 5 1v3c0 2-1 3-3 3C10 20 4 14 4 6c0-2 1-3 3-3Z" />
    </svg>
  );
}

function BowlIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11h16c0 5-3 8-8 8s-8-3-8-8Z" />
      <path d="M7 19v2h10v-2" />
      <path d="M8 8c0-2 2-2 2-4M12 8c0-2 2-2 2-4M16 8c0-2 2-2 2-4" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 2.8 20h18.4L12 3Z" />
      <path d="M12 9v5M12 17.2v.2" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 16-1 5 5-1L19 9l-4-4L4 16Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

function ArrangeHomeDelivery() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="arrange-delivery-page">
      <header className="arrange-delivery-overlay-header">
        <a
          className="arrange-delivery-back-button"
          href="/get-meals"
          aria-label="Return to Get Meals"
        >
          <BackIcon />
        </a>

        <button
          className="arrange-delivery-menu-button"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {menuOpen && (
        <div className="arrange-delivery-menu-panel">
          <nav aria-label="Get Meals navigation">
            <a href="/get-meals">Get Meals</a>
            <a href="/arrange-home-delivery">
              Arrange for Home Delivery
            </a>
            <a href="/weekly-menu">View This Week&apos;s Menu</a>
            <a href="/meal-delivery-faqs">
              Meal Delivery FAQs
            </a>
          </nav>
        </div>
      )}

      <main className="arrange-delivery-main">
        <section className="arrange-delivery-hero">
          <img
            src={heroImage}
            alt="Meals on Wheels volunteer delivering meals to an older adult at home"
          />
          <div
            className="arrange-delivery-hero-shade"
            aria-hidden="true"
          />
        </section>

        <section className="arrange-delivery-intro-section">
          <p className="arrange-delivery-eyebrow">
            Getting started
          </p>

          <h1>Arrange for Home Delivery</h1>

          <div
            className="arrange-delivery-heart-divider"
            aria-hidden="true"
          >
            <span />
            <strong>♥</strong>
            <span />
          </div>

          <p className="arrange-delivery-intro">
            At Meals on Wheels Pasco, we bring nutritious meals,
            a friendly face, and a daily wellness check directly
            to seniors at home—because every delivery is about
            more than food.
          </p>
        </section>

        <section className="arrange-delivery-body">
          <div className="arrange-delivery-section-heading">
            <span />
            <h2>How It Works</h2>
            <span />
          </div>

          <div className="arrange-delivery-steps">
            <article className="arrange-delivery-step">
              <div className="arrange-delivery-step-icon">
                <ClipboardIcon />
              </div>

              <div className="arrange-delivery-step-number">
                1
              </div>

              <h3>Submit Your Form</h3>

              <p>
                Tell us a little about yourself and your needs.
              </p>
            </article>

            <div
              className="arrange-delivery-step-connector"
              aria-hidden="true"
            />

            <article className="arrange-delivery-step">
              <div className="arrange-delivery-step-icon">
                <PhoneIcon />
              </div>

              <div className="arrange-delivery-step-number">
                2
              </div>

              <h3>We&apos;ll Be in Touch</h3>

              <p>
                We&apos;ll review your information and contact
                you within 3 business days.
              </p>
            </article>

            <div
              className="arrange-delivery-step-connector"
              aria-hidden="true"
            />

            <article className="arrange-delivery-step">
              <div className="arrange-delivery-step-icon">
                <BowlIcon />
              </div>

              <div className="arrange-delivery-step-number">
                3
              </div>

              <h3>Meals Begin</h3>

              <p>
                Once approved, we&apos;ll start delivering meals
                to your door.
              </p>
            </article>
          </div>

          <div className="arrange-delivery-alert-stack">
            <aside className="arrange-delivery-alert arrange-delivery-alert-important">
              <div
                className="arrange-delivery-alert-icon"
                aria-hidden="true"
              >
                <WarningIcon />
              </div>

              <div className="arrange-delivery-alert-content">
                <h2>
                  Important — Please Read Before Applying
                </h2>

                <p>
                  This form is for our Meals on Wheels
                  home-delivery program only.
                </p>
              </div>
            </aside>

            <aside className="arrange-delivery-alert arrange-delivery-alert-pantry">
              <div
                className="arrange-delivery-alert-icon"
                aria-hidden="true"
              >
                <WarningIcon />
              </div>

              <div className="arrange-delivery-alert-content">
                <h2>
                  Looking for Food Pantry Assistance?
                </h2>

                <p>
                  If you are looking for food pantry assistance,
                  please visit our{" "}
                  <a
                    href="https://www.mealsonwheelspasco.org/feeding-you-love-food-pantry-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Feeding You With Love Food Pantry
                  </a>{" "}
                  page.
                </p>
              </div>
            </aside>
          </div>

          <a
            className="arrange-delivery-application-button"
            href="/meal-application"
          >
            <PencilIcon />
            <span>
              Start Meal Delivery Application
            </span>
          </a>
        </section>
      </main>

      <nav
        className="arrange-delivery-bottom-nav"
        aria-label="Main navigation"
      >
        <a
          className="bottom-nav-item"
          href="/"
        >
          <HomeIcon />
          <span>Home</span>
        </a>

        <a
          className="bottom-nav-item active"
          href="/get-meals"
        >
          <MealIcon />
          <span>Meals</span>
        </a>

        <a
          className="bottom-nav-item"
          href="/food-pantry"
        >
          <PantryIcon />
          <span>Pantry</span>
        </a>

        <a
          className="bottom-nav-item"
          href="/events"
        >
          <CalendarIcon />
          <span>Events</span>
        </a>

        <button
          className="bottom-nav-item bottom-nav-button"
          type="button"
          onClick={() => setMenuOpen(true)}
        >
          <MoreIcon />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}

export default ArrangeHomeDelivery;