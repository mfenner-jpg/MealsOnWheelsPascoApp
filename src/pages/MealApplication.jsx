
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
