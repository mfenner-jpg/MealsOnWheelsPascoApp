const weeklyMenu = {
  Monday: ['Pot Roast', 'Mashed Potatoes & Vegetable'],
  Tuesday: ["Chef’s Choice", 'Mixed Vegetables'],
  Wednesday: ['Sub Sandwich & Turkey Noodle Soup', ''],
  Thursday: ['Baked Chicken Wings', 'Mac & Cheese & Vegetable'],
  Friday: ['Stuffed Bell Peppers', 'Crescent Roll'],
}

function getEasternTime() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  )

  return {
    weekday: values.weekday,
    hour: Number(values.hour),
    minute: Number(values.minute),
  }
}

function getLunchStatus(hour, minute) {
  const totalMinutes = hour * 60 + minute

  if (totalMinutes < 570) {
    return 'Our kitchen is busy preparing today’s meals.'
  }

  if (totalMinutes < 660) {
    return 'Drivers are getting ready to head out.'
  }

  if (totalMinutes <= 720) {
    return 'Meals are on the way!'
  }

  return 'Thanks for joining us today! We’ll see you tomorrow.'
}

function LunchCard() {
  const { weekday, hour, minute } = getEasternTime()
  const isWeekend = weekday === 'Saturday' || weekday === 'Sunday'
  const meal = weeklyMenu[weekday]

  return (
    <a
      className="today-card today-card-menu"
      href="https://www.mealsonwheelspasco.org/weekly-menu"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="card-icon" aria-hidden="true">
        🍴
      </div>

      <div className="tag tag-menu">
        {isWeekend ? 'Weekly Menu' : 'Today’s Lunch'}
      </div>

      <h3>
        {isWeekend
          ? 'Next Week’s Menu Is Ready'
          : meal?.[0] || 'Weekly menu available'}
      </h3>

      <p className="today-main">
        {isWeekend
          ? 'See what’s cooking Monday through Friday.'
          : meal?.[1] || 'View the weekly menu for complete details.'}
      </p>

      <p>
        {isWeekend
          ? 'Tap below to view the full weekly menu.'
          : getLunchStatus(hour, minute)}
      </p>

      <span className="card-link">
        {isWeekend ? 'View next week’s menu' : 'View weekly menu'}
        <span aria-hidden="true"> →</span>
      </span>
    </a>
  )
}

export default LunchCard