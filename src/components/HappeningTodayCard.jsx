function HappeningTodayCard() {
  return (
    <article className="live-card happening-card">
      <div className="live-card-top">
        <span className="pill event-pill">Happening Today</span>
      </div>

      <h3>See What’s Happening Today</h3>

      <p className="meal-description">
        View today’s programs, pantry activity, community gatherings, and
        special events.
      </p>

      <a
        className="primary-link"
        href="https://www.mealsonwheelspasco.org/calendar"
        target="_blank"
        rel="noopener noreferrer"
      >
        View today’s schedule
        <span aria-hidden="true">→</span>
      </a>
    </article>
  )
}

export default HappeningTodayCard