import chefsChoiceIcon from "../assets/menu-icons/chefs-choice.png";
import pastaIcon from "../assets/menu-icons/pasta.png";
import chickenIcon from "../assets/menu-icons/chicken.png";
import beefIcon from "../assets/menu-icons/beef.png";
import sandwichIcon from "../assets/menu-icons/sandwich.png";

const foodIcons = {
  chef: chefsChoiceIcon,
  pasta: pastaIcon,
  chicken: chickenIcon,
  beef: beefIcon,
  sandwich: sandwichIcon,
};

export function getFoodIconType(mealTitle = "") {
  const title = mealTitle.toLowerCase().trim();

  if (!title) return "chef";

  if (
    title.includes("chef's choice") ||
    title.includes("chefs choice") ||
    title.includes("chef choice")
  ) {
    return "chef";
  }

  if (
    title.includes("sandwich") ||
    title.includes("sub") ||
    title.includes("hoagie") ||
    title.includes("grilled cheese")
  ) {
    return "sandwich";
  }

  /*
    Chicken/turkey is checked before pasta so a title such as
    "Chicken Alfredo" uses the chicken illustration instead of
    the spaghetti illustration.
  */
  if (
    title.includes("chicken") ||
    title.includes("turkey")
  ) {
    return "chicken";
  }

  if (
    title.includes("spaghetti") ||
    title.includes("meatball") ||
    title.includes("ravioli") ||
    title.includes("lasagna") ||
    title.includes("pasta") ||
    title.includes("alfredo") ||
    title.includes("mac & cheese") ||
    title.includes("mac and cheese") ||
    title.includes("macaroni")
  ) {
    return "pasta";
  }

  if (
    title.includes("beef") ||
    title.includes("steak") ||
    title.includes("meatloaf") ||
    title.includes("meat loaf") ||
    title.includes("pot roast") ||
    title.includes("corned beef") ||
    title.includes("chili") ||
    title.includes("stew") ||
    title.includes("burger") ||
    title.includes("hamburger") ||
    title.includes("cheeseburger")
  ) {
    return "beef";
  }

  /*
    TEMPORARY fallback while we build the rest of the icon library.
    Unknown meals use Chef's Choice so there is never a broken image.
  */
  return "chef";
}

export default function MenuFoodIcon({ mealTitle, className = "" }) {
  const type = getFoodIconType(mealTitle);
  const iconSrc = foodIcons[type] || foodIcons.chef;

  return (
    <span
      className={`menu-food-icon ${className}`.trim()}
      aria-hidden="true"
      data-food-icon={type}
    >
      <img src={iconSrc} alt="" />
    </span>
  );
}
