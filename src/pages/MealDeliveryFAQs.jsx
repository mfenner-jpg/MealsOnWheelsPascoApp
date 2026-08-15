import { useState } from "react";
import "./MealDeliveryFAQs.css";

import heroImage from "../assets/meal-delivery-faq-hero-v1.jpg";

import faqMealArt from "../assets/faq-the-meal.png";
import faqEligibilityArt from "../assets/faq-eligibility.png";
import faqDietaryArt from "../assets/faq-dietary-scheduling.png";
import faqDeliveryTeamArt from "../assets/faq-delivery-team.png";
import faqSafetyArt from "../assets/faq-safety-wellness.png";
import faqExtraServicesArt from "../assets/faq-extra-services.png";

import quickNoWaitingArt from "../assets/faq-quick-no-waiting-list.png";
import quickEasyStartArt from "../assets/faq-quick-easy-start.png";
import quickWellnessArt from "../assets/faq-quick-wellness-checks.png";
import faqReadyToBeginArt from "../assets/faq-ready-to-begin.png";

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

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.6 2.6L16.5 9" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </svg>
  );
}

function PlateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 15h14M7 15a5 5 0 0 1 10 0M4 19h16" />
      <path d="M12 7V5" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20c0-4 2.7-7 6-7s6 3 6 7" />
    </svg>
  );
}

function CalendarSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6h14v13H5zM8 3v5M16 3v5M5 10h14" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 11l2-5h10l2 5" />
      <path d="M4 11h16v7H4z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.8 2.9 8 7 10 4.1-2 7-5.2 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    </svg>
  );
}

function ChevronIcon({ open = false }) {
  return (
    <svg
      className={open ? "is-open" : ""}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
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

const faqCategories = [
  {
    id: "meal",
    title: "The Meal",
    description: "Learn about our meals and how they are prepared.",
    image: faqMealArt,
    questions: [
      {
        question: 'What is a “Meals on Wheels” meal?',
        answer:
          "Enjoy a complete, wholesome meal delivered with care. Your delivery includes a hot entrée, a refreshing salad or a piece of fruit, and a satisfying dessert.",
      },
      {
        question: "How are the meals prepared?",
        answer:
          "Our wholesome meals are cooked and assembled with care by our dedicated team of volunteers utilizing the best ingredients from weekly community donations.",
      },
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility & Getting Started",
    description: "See if you’re eligible and how to get started.",
    image: faqEligibilityArt,
    questions: [
      {
        question: "Who is eligible to receive a meal delivery?",
        answer:
          "Services are available to Pasco County residents who are homebound — meaning they have difficulty leaving their home and are challenged to prepare their own meals. This includes seniors, those with disabilities, and individuals who are malnourished, have just left the hospital, or are otherwise unable to cook.",
      },
      {
        question: "How soon can I get started?",
        answer:
          "There is currently no waiting list. After you submit your registration, our team will contact you within 3 business days. When availability allows, meal service may begin sooner.",
      },
      {
        question: "What is the delivery service area?",
        answer:
          "East Pasco Meals on Wheels primarily serves the eastern part of the county, including Zephyrhills, Dade City, and outlying areas. Call 813-782-7859 to check delivery availability in your area.",
      },
      {
        question: "How do I apply to receive meals?",
        answer:
          "Applying is simple. Use the Start Application button below to complete the online registration form, or call 813-782-7859 to speak with an associate.",
      },
    ],
  },
  {
    id: "dietary",
    title: "Dietary & Scheduling",
    description: "Dietary needs, waitlists and delivery times.",
    image: faqDietaryArt,
    questions: [
      {
        question: "Can you meet my dietary needs?",
        answer:
          "While we cannot accommodate personal preferences, we support medically necessary diets including Diabetic, Heart Healthy, and Diverticulitis menus.",
      },
      {
        question: "Is there a waiting list?",
        answer:
          "There is no waiting list at this time; however, based on future demand, new applicants may be subject to one.",
      },
      {
        question: "When are meals delivered?",
        answer:
          "We begin packing at 10:00 AM. Deliveries generally arrive between 11:00 AM and 12:30 PM. Times vary by location and route, and minor delays can occasionally occur.",
      },
    ],
  },
  {
    id: "team",
    title: "Your Delivery Team",
    description: "Who delivers your meals and how often.",
    image: faqDeliveryTeamArt,
    questions: [
      {
        question: "Who delivers the meals?",
        answer:
          "Your meal is delivered by dedicated, trained, and background-checked volunteers who donate their own time, vehicle, and gas. They are the heart and soul of our ability to serve over 600 meals weekly.",
      },
      {
        question: "How many meals are delivered weekly?",
        answer:
          "We currently deliver over 600 nutritious meals weekly — more than 36,000 meals per year.",
      },
    ],
  },
  {
    id: "safety",
    title: "Safety & Wellness",
    description: "Wellness checks and safety information.",
    image: faqSafetyArt,
    questions: [
      {
        question: "Why do you ask for an emergency contact?",
        answer:
          "Your safety is our top priority. If our delivery staff arrives and you do not answer the door, we will call your designated emergency contact to confirm your well-being.",
      },
      {
        question: "What is a wellness check?",
        answer:
          "Our service includes a daily safety check. Volunteers report any concerns to our office. If you don’t answer, we call you, then your emergency contact, and if needed, request a police wellness check. Please keep your client information and emergency contact numbers current at all times.",
      },
      {
        question: "Can the driver bring my meals inside?",
        answer:
          "Yes. Our volunteers are happy to bring your meal directly inside — to your table or refrigerator. Just let your driver know what works best for you.",
      },
      {
        question: "What if I don’t make it to the door in time?",
        answer:
          "The driver will knock several times and attempt to call you. If there’s no answer, a “Sorry we missed you” note is left. Meals will not be left unattended outside. You may leave a clean, sanitized cooler outside and the driver will place your meal inside it.",
      },
      {
        question: "Do you deliver on holidays or in bad weather?",
        answer:
          "We are closed on six holidays: New Year’s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, and Christmas. We use a modified schedule so you still receive your meals. Thanksgiving and Christmas meals are delivered on the holiday itself, or the preceding Friday if Christmas falls on a weekend. Other holiday meals are delivered the day before the holiday. If weather is hazardous, delivery may be canceled for the day and staff will call recipients.",
      },
    ],
  },
  {
    id: "extras",
    title: "Extra Services",
    description: "Additional services that may be included.",
    image: faqExtraServicesArt,
    questions: [
      {
        question: "Are there extra services included?",
        answer:
          "Upon request and based on availability, supplies may include incontinence supplies, underwear, and pet food. Clients may also receive a complimentary birthday cake near their special day and holiday gift bags during seasonal holidays.",
      },
    ],
  },
];

function MealDeliveryFAQs() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleCategory = (categoryId) => {
    setOpenCategory((current) => (current === categoryId ? null : categoryId));
    setOpenQuestion(null);
  };

  const toggleQuestion = (questionId) => {
    setOpenQuestion((current) => (current === questionId ? null : questionId));
  };

  return (
    <div className="meal-faq-page">
      <header className="meal-faq-overlay-header">
        <a
          className="meal-faq-back-button"
          href="/get-meals"
          aria-label="Return to Get Meals"
        >
          <BackIcon />
        </a>

        <button
          className="meal-faq-menu-button"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {menuOpen && (
        <div className="meal-faq-menu-panel">
          <nav aria-label="Get Meals navigation">
            <a href="/get-meals">Get Meals</a>
            <a href="/arrange-home-delivery">Arrange for Home Delivery</a>
            <a href="/weekly-menu">View This Week&apos;s Menu</a>
            <a href="/meal-delivery-faqs">Meal Delivery FAQs</a>
          </nav>
        </div>
      )}

      <main className="meal-faq-main">
        {/* Existing approved Option G hero/frame */}
        <section className="meal-faq-hero">
          <img
            src={heroImage}
            alt="Meals on Wheels volunteer delivering a meal to an older adult at home"
          />

          <div className="meal-faq-hero-shade" aria-hidden="true" />

          <div className="meal-faq-hero-copy">
            <h1>Meal Delivery FAQs</h1>

            <div className="meal-faq-heart-divider" aria-hidden="true">
              <span />
              <strong>♥</strong>
              <span />
            </div>

            <p>
              Answers to common questions about our meals, delivery, and services.
            </p>
          </div>
        </section>

        {/* Existing quick-facts frame retained; timing language clarified */}
        <section className="meal-faq-quick-facts" aria-label="Quick facts">
          <article className="meal-faq-fact">
            <div className="meal-faq-fact-art" aria-hidden="true">
              <img src={quickNoWaitingArt} alt="" />
            </div>
            <h2>No Waiting List</h2>
            <p>Start when you need us.</p>
          </article>

          <article className="meal-faq-fact">
            <div className="meal-faq-fact-art" aria-hidden="true">
              <img src={quickEasyStartArt} alt="" />
            </div>
            <h2>Easy to Get Started</h2>
            <p>We&apos;ll guide you through the process.</p>
          </article>

          <article className="meal-faq-fact">
            <div className="meal-faq-fact-art" aria-hidden="true">
              <img src={quickWellnessArt} alt="" />
            </div>
            <h2>Wellness Checks</h2>
            <p>A friendly visit with every delivery.</p>
          </article>
        </section>

        {/* Approved Option B body */}
        <section className="meal-faq-body">
          <div className="meal-faq-section-heading">
            <p className="meal-faq-section-label">Common Questions</p>
            <h2>Browse by Category</h2>
            <p>Tap a category to view questions and answers.</p>
          </div>

          <div className="meal-faq-category-list">
            {faqCategories.map((category) => {
              const categoryOpen = openCategory === category.id;

              return (
                <article
                  className={`meal-faq-category-card ${
                    categoryOpen ? "is-open" : ""
                  }`}
                  key={category.id}
                >
                  <button
                    className="meal-faq-category-button"
                    type="button"
                    aria-expanded={categoryOpen}
                    aria-controls={`faq-category-${category.id}`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <span className="meal-faq-category-art" aria-hidden="true">
                      <img src={category.image} alt="" />
                    </span>

                    <span className="meal-faq-category-copy">
                      <strong>{category.title}</strong>
                      <span>{category.description}</span>
                    </span>

                    <span className="meal-faq-category-chevron">
                      <ChevronIcon open={categoryOpen} />
                    </span>
                  </button>

                  {categoryOpen && (
                    <div
                      className="meal-faq-question-list"
                      id={`faq-category-${category.id}`}
                    >
                      {category.questions.map((item, index) => {
                        const questionId = `${category.id}-${index}`;
                        const questionOpen = openQuestion === questionId;

                        return (
                          <div className="meal-faq-question" key={item.question}>
                            <button
                              className="meal-faq-question-button"
                              type="button"
                              aria-expanded={questionOpen}
                              onClick={() => toggleQuestion(questionId)}
                            >
                              <span>{item.question}</span>
                              <strong aria-hidden="true">
                                {questionOpen ? "−" : "+"}
                              </strong>
                            </button>

                            {questionOpen && (
                              <div className="meal-faq-answer">
                                <p>{item.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <section className="meal-faq-start-card">
            <div className="meal-faq-start-art" aria-hidden="true">
              <img src={faqReadyToBeginArt} alt="" />
            </div>

            <div className="meal-faq-start-copy">
              <p className="meal-faq-section-label">Ready to Begin?</p>
              <h2>Looking to start meal delivery?</h2>
              <p>
                Complete the application and our team will contact you within
                3 business days.
              </p>
            </div>

            <a
              className="meal-faq-start-button"
              href="/arrange-home-delivery"
            >
              <span>Start Application</span>
              <ArrowIcon />
            </a>
          </section>

          <section className="meal-faq-help-card">
            <div className="meal-faq-help-icon" aria-hidden="true">
              <PhoneIcon />
            </div>

            <div className="meal-faq-help-copy">
              <h2>Still Need Help?</h2>
              <p>We&apos;re happy to answer your questions.</p>

              <a href="tel:+18137827859">813-782-7859</a>

              <span>Mon–Fri, 8:00 AM–1:00 PM</span>
            </div>
          </section>
        </section>
      </main>

      <nav className="meal-faq-bottom-nav" aria-label="Main navigation">
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

export default MealDeliveryFAQs;