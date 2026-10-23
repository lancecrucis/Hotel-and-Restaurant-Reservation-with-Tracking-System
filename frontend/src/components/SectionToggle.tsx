import { NavLink } from "react-router-dom";

/*
Hotel and Restaurant Toggle

This shared navigation lets users switch between the prototype screens.
Only the Hotel and Restaurant sections are shown for now.
*/
export default function SectionToggle() {
  const buttonClass = ({ isActive }: { isActive: boolean }) =>
    `rounded px-5 py-2 text-white ${
      isActive ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
    }`;

  return (
    <nav
      aria-label="Reservation sections"
      className="mb-6 flex justify-center gap-3"
    >
      <NavLink to="/rooms" className={buttonClass}>
        Hotel
      </NavLink>

      <NavLink to="/restaurant" className={buttonClass}>
        Restaurant
      </NavLink>
    </nav>
  );
}
