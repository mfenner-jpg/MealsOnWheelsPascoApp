import mowLogo from '../assets/mow-logo.png'

function PlaceholderLink({ children }) {
  return (
    <a
      href="#"
      aria-disabled="true"
      onClick={(event) => event.preventDefault()}
    >
      {children}
      <small className="menu-coming-soon">Coming soon</small>
    </a>
  )
}

function SideMenu({ open, onClose, greeting, dateLabel }) {
  return (
    <>
      <button
        className={`menu-backdrop ${open ? 'open' : ''}`}
        type="button"
        aria-label="Close menu"
        onClick={onClose}
      />

      <aside
        className={`side-menu ${open ? 'open' : ''}`}
        aria-hidden={!open}
      >
        <div className="side-menu-header">
          <div className="menu-header-content">
            <img
              className="side-menu-logo"
              src={mowLogo}
              alt="Meals on Wheels of Pasco County"
            />

            <div className="menu-greeting">
              <p>{greeting}</p>
              <span>{dateLabel}</span>
              <small>We’re glad you’re here.</small>
            </div>
          </div>

          <button
            className="side-menu-close"
            type="button"
            aria-label="Close menu"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <nav className="side-menu-body" aria-label="App menu">
          <a className="menu-home" href="/" onClick={onClose}>
            Home
          </a>

          <details>
            <summary>Get Meals</summary>

            <a
              href="https://www.mealsonwheelspasco.org/get-meals-0"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Meals
            </a>

            <a
              href="https://www.mealsonwheelspasco.org/weekly-menu"
              target="_blank"
              rel="noopener noreferrer"
            >
              Weekly Menu
            </a>

            <a
              href="https://www.mealsonwheelspasco.org/meal-delivery-faqs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Meal Delivery FAQs
            </a>
          </details>

          <details>
            <summary>Feeding You With Love Food Pantry</summary>

            <a
              href="https://www.mealsonwheelspasco.org/food-pantry-registration-recertification"
              target="_blank"
              rel="noopener noreferrer"
            >
              Food Pantry Registration
            </a>

            <PlaceholderLink>Food Pantry FAQs</PlaceholderLink>

            <PlaceholderLink>Income Guidelines</PlaceholderLink>

            <PlaceholderLink>Comfort Kitchen Recipes</PlaceholderLink>
          </details>

          <details>
            <summary>Genesis Community Center</summary>

            <a
              href="https://www.mealsonwheelspasco.org/genesis"
              target="_blank"
              rel="noopener noreferrer"
            >
              About the Genesis Center
            </a>

            <PlaceholderLink>Facility Information</PlaceholderLink>

            <PlaceholderLink>Contact Genesis</PlaceholderLink>

            <details className="submenu-group">
              <summary>Programs &amp; Activities</summary>

              <PlaceholderLink>
                Current Genesis programs and activities will appear here
              </PlaceholderLink>

              <a
                href="https://www.mealsonwheelspasco.org/calendar"
                target="_blank"
                rel="noopener noreferrer"
              >
                View All Activities
              </a>
            </details>
          </details>

          <details>
            <summary>Volunteer</summary>

            <a
              href="https://www.mealsonwheelspasco.org/volunteer-opportunities"
              target="_blank"
              rel="noopener noreferrer"
            >
              Volunteer Opportunities
            </a>

            <a
              href="https://www.mealsonwheelspasco.org/recipe-change"
              target="_blank"
              rel="noopener noreferrer"
            >
              Group Volunteer Opportunities
            </a>

            <a
              href="https://www.mealsonwheelspasco.org/volunteer-be-lifeline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Individual Volunteer Opportunities
            </a>
          </details>

          <details>
            <summary>Support Our Mission</summary>

            <a
              href="https://www.mealsonwheelspasco.org/Donate%20Form"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donate Today
            </a>

            <a
              href="https://www.mealsonwheelspasco.org/give-hope-pasco"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donation Options
            </a>

            <a
              className="menu-featured-link"
              href="https://www.mealsonwheelspasco.org/amazon-wishlist-0"
              target="_blank"
              rel="noopener noreferrer"
            >
              Amazon Wishlist
            </a>

            <a
              href="https://www.mealsonwheelspasco.org/donation-faqs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donation FAQs
            </a>
          </details>

          <details>
            <summary>Events &amp; News</summary>

            <a
              href="https://www.mealsonwheelspasco.org/calendar"
              target="_blank"
              rel="noopener noreferrer"
            >
              Community Calendar
            </a>

            <details className="submenu-group">
              <summary>News &amp; Announcements</summary>

              <PlaceholderLink>
                The five latest articles will appear here
              </PlaceholderLink>

              <a
                href="https://www.mealsonwheelspasco.org/blog"
                target="_blank"
                rel="noopener noreferrer"
              >
                View All News
              </a>
            </details>
          </details>

          <details>
            <summary>About Us</summary>

            <a
              href="https://www.mealsonwheelspasco.org/what-we-do"
              target="_blank"
              rel="noopener noreferrer"
            >
              What We Do
            </a>

            <a
              href="https://www.mealsonwheelspasco.org/mission-history"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mission &amp; History
            </a>

            <PlaceholderLink>Board of Directors</PlaceholderLink>

            <PlaceholderLink>Our Team</PlaceholderLink>

            <PlaceholderLink>
              Sponsors &amp; Community Partners
            </PlaceholderLink>

            <a
              href="https://www.mealsonwheelspasco.org/contact-us"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Us
            </a>
          </details>

          <details>
            <summary>App</summary>

            <a href="mailto:info@mealsonwheelspasco.org?subject=Meals%20on%20Wheels%20Pasco%20App%20Feedback">
              Send Feedback
            </a>

            <span className="menu-version">
              App Preview · React Build
            </span>
          </details>
        </nav>

        <footer className="side-menu-footer">
          Neighbors helping neighbors since 1974.
        </footer>
      </aside>
    </>
  )
}

export default SideMenu