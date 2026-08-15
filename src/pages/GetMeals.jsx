import { useState } from "react";
import "./GetMeals.css";

import heroImage from "../assets/get-meals-hero-v2.png";
import applyCardImage from "../assets/get-meals-apply-card.jpg";
import weeklyMenuCardImage from "../assets/get-meals-weekly-menu-card.jpg";
import faqCardImage from "../assets/get-meals-faq-card.jpg";
import helpHeartImage from "../assets/help-heart.png";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M10 7l-5 5 5 5" />
    </svg>
  );
}

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
      <path d="M6 6l12 12M18 6 6 18" />
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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M14 7l5 5-5 5" />
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

function GetMeals() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="get-meals-page">
      <header className="get-meals-overlay-header">
        <a
          className="get-meals-back-button"
          href="/"
          aria-label="Return to Home"
        >
          <BackIcon />
        </a>

        <button
          className="get-meals-menu-button"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {menuOpen && (
        <div className="get-meals-menu-panel">
          <nav aria-label="Get Meals navigation">
            <a href="/get-meals">Get Meals</a>
            <a href="/arrange-home-delivery">Arrange for Home Delivery</a>
            <a href="/weekly-menu">View This Week&apos;s Menu</a>
            <a href="/meal-delivery-faqs">Meal Delivery FAQs</a>
          </nav>
        </div>
      )}

      <main className="get-meals-main">
        <section className="get-meals-hero">
          <img
            src={heroImage}
            alt="Meals on Wheels volunteer delivering meals to an older adult"
          />
          <div className="get-meals-hero-shade" aria-hidden="true" />
        </section>

        <section className="get-meals-floating-card">
          <p className="get-meals-eyebrow">Meals Delivered With Care</p>

          <h1>
            Get Meals
            <br />
            Delivered
          </h1>

          <div className="get-meals-heart-divider" aria-hidden="true">
            <span />
            <strong>♥</strong>
            <span />
          </div>

          <p className="get-meals-intro">
            Nutritious meals, a friendly visit, and peace of mind—delivered
            directly to your home.
          </p>

          <a className="get-meals-primary-button" href="/arrange-home-delivery">
            <span>Get Started</span>
            <ArrowIcon />
          </a>
        </section>

        <section className="get-meals-actions-section">
          <p className="get-meals-section-heading">
            Choose how you&apos;d like to get started
          </p>

          <div className="get-meals-action-list">
            <a
              className="get-meals-action-card card-home-delivery"
              href="/arrange-home-delivery"
              aria-label="Arrange Home Delivery"
            >
              <div className="get-meals-action-image">
                <img src={applyCardImage} alt="Arrange for home delivery" />
              </div>

              <div className="get-meals-action-content">
                <span className="get-meals-status-pill status-popular">
                  Most Popular
                </span>
                <h2>1. Arrange Home Delivery</h2>
                <p>
                  Apply to begin receiving nutritious meals delivered to your home.
                </p>
                <span className="get-meals-action-cta">
                  Start Application
                  <ArrowIcon />
                </span>
              </div>
            </a>

            <a
              className="get-meals-action-card card-weekly-menu"
              href="/weekly-menu"
              aria-label="View this week's menu"
            >
              <div className="get-meals-action-image">
                <img src={weeklyMenuCardImage} alt="Weekly Meals on Wheels menu" />
              </div>

              <div className="get-meals-action-content">
                <span className="get-meals-status-pill status-updated">
                  This Week&apos;s Menu
                </span>
                <h2>2. Weekly Menu</h2>
                <p>
                  See what&apos;s being served this week and plan your meals ahead.
                </p>
                <span className="get-meals-action-cta">
                  See This Week&apos;s Meals
                  <ArrowIcon />
                </span>
              </div>
            </a>

            <a
              className="get-meals-action-card card-faq"
              href="/meal-delivery-faqs"
              aria-label="Browse Meal Delivery FAQs"
            >
              <div className="get-meals-action-image">
                <img
                  src={faqCardImage}
                  alt="Meal delivery frequently asked questions"
                />
              </div>

              <div className="get-meals-action-content">
                <span className="get-meals-status-pill status-questions">
                  Common Questions
                </span>
                <h2>3. Meal Delivery FAQs</h2>
                <p>
                  Find answers to common questions about meals, delivery, and service.
                </p>
                <span className="get-meals-action-cta">
                  Browse Questions
                  <ArrowIcon />
                </span>
              </div>
            </a>
          </div>

          <aside className="get-meals-help-strip">
            <div className="get-meals-help-icon" aria-hidden="true">
              <img src={helpHeartImage} alt="" />
            </div>

            <div className="get-meals-help-copy">
              <h2>Need help deciding?</h2>
              <p>
                Not sure which option is right for you? Our team is happy to help.
              </p>
            </div>

            <a className="get-meals-call-button" href="tel:+18137827859">
              <span>Call Us</span>
              <PhoneIcon />
            </a>
          </aside>
        </section>
      </main>

      <nav className="get-meals-bottom-nav" aria-label="Main navigation">
        <a className="bottom-nav-item" href="/">
          <HomeIcon />
          <span>Home</span>
        </a>

        <a className="bottom-nav-item active" href="/get-meals">
          <MealIcon />
          <span>Meals</span>
        </a>

        <a className="bottom-nav-item" href="/food-pantry">
          <PantryIcon />
          <span>Pantry</span>
        </a>

        <a className="bottom-nav-item" href="/events">
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

export default GetMeals;