import { useState } from "react";
import "./WeeklyMenu.css";

import heroImage from "../assets/weekly-menu-hero-v1.jpg";
import MenuFoodIcon from "../components/MenuFoodIcon";

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


function ForkKnifeAccentIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 10v18M12 10v10c0 5 3 8 6 8s6-3 6-8V10M18 28v26" />
      <path d="M42 10c6 0 9 8 9 17v8h-9V10ZM47 35v19" />
    </svg>
  );
}

const weeklyMeals = [
  {
    day: "MON",
    date: "10",
    title: "Chef's Choice",
    description: "A special selection prepared by our kitchen team.",
  },
  {
    day: "TUE",
    date: "11",
    title: "Classic Spaghetti & Meatballs",
    description: "Rich Italian-style tomato sauce, served with a seasoned vegetable.",
  },
  {
    day: "WED",
    date: "12",
    title: "Turkey & Cheese Sandwich",
    description: "Served with warm tomato soup.",
  },
  {
    day: "THU",
    date: "13",
    title: "Chili & Cornbread",
    description: "Hearty chili served with warm cornbread.",
  },
  {
    day: "FRI",
    date: "14",
    title: "Chicken Alfredo",
    description: "Creamy chicken Alfredo served with a vegetable and garlic roll.",
  },
];

function WeeklyMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="weekly-menu-page">
      <header className="weekly-menu-overlay-header">
        <a
          className="weekly-menu-back-button"
          href="/get-meals"
          aria-label="Return to Get Meals"
        >
          <BackIcon />
        </a>

        <button
          className="weekly-menu-menu-button"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {menuOpen && (
        <div className="weekly-menu-menu-panel">
          <nav aria-label="Get Meals navigation">
            <a href="/get-meals">Get Meals</a>
            <a href="/arrange-home-delivery">Arrange for Home Delivery</a>
            <a href="/weekly-menu">View This Week&apos;s Menu</a>
            <a href="/meal-delivery-faqs">Meal Delivery FAQs</a>
          </nav>
        </div>
      )}

      <main className="weekly-menu-main">
        <section className="weekly-menu-hero">
          <img
            src={heroImage}
            alt="Prepared Meals on Wheels meal trays ready for delivery"
          />
          <div className="weekly-menu-hero-shade" aria-hidden="true" />
        </section>

        <section className="weekly-menu-intro-section">
          <p className="weekly-menu-eyebrow">This week&apos;s</p>

          <div className="weekly-menu-heart-divider" aria-hidden="true">
            <span />
            <strong>♥</strong>
            <span />
          </div>

          <h1>Weekly Menu</h1>

          <p className="weekly-menu-intro">
            Delicious, nutritious meals made with care.
            See what&apos;s on the menu this week!
          </p>
        </section>

        <section className="weekly-menu-restaurant-section">
          <div className="weekly-menu-transition" aria-hidden="true">
            <span />
            <div className="weekly-menu-transition-icon">
              <ForkKnifeAccentIcon />
            </div>
            <span />
          </div>

          <p className="weekly-menu-tagline">
            Made with care. Delivered with a smile.
          </p>

          <div className="weekly-menu-card">
            <header className="weekly-menu-card-header">
              <p className="weekly-menu-card-eyebrow">This Week&apos;s Selections</p>
              <h2>August 10 – 14, 2026</h2>
            </header>

            <div className="weekly-menu-meals">
              {weeklyMeals.map((meal) => (
                <article className="weekly-menu-meal-row" key={meal.day}>
                  <div className="weekly-menu-date-badge">
                    <span>{meal.day}</span>
                    <strong>{meal.date}</strong>
                  </div>

                  <MenuFoodIcon
                    mealTitle={meal.title}
                    className="weekly-menu-meal-icon"
                  />

                  <div className="weekly-menu-meal-copy">
                    <h3>{meal.title}</h3>
                    <p>{meal.description}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="weekly-menu-included">
              <p>Included Daily</p>
              <div className="weekly-menu-included-items">
                <span>🍎 Fruit or Salad</span>
                <strong aria-hidden="true">•</strong>
                <span>🍰 Dessert</span>
              </div>
            </div>

            <footer className="weekly-menu-info-panel">
              <div>
                <span className="weekly-menu-info-symbol" aria-hidden="true">ⓘ</span>
                <p><strong>Please Note:</strong> Menu is subject to change.</p>
              </div>
              <div>
                <span className="weekly-menu-info-symbol" aria-hidden="true">◷</span>
                <p><strong>Delivery Time:</strong> 11:00 AM – 1:00 PM.</p>
              </div>
              <div>
                <span className="weekly-menu-info-symbol" aria-hidden="true">♡</span>
                <p><strong>Diabetic meals</strong> available upon request.</p>
              </div>
            </footer>
          </div>
        </section>
      </main>

      <nav className="weekly-menu-bottom-nav" aria-label="Main navigation">
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

export default WeeklyMenu;
