/*
Restaurant Time Slot

Restaurant reservations use a fixed two-hour duration for this prototype.
The function returns null when a start time would cross midnight.
*/

function getRestaurantEndTime(startTime) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const endMinutes = hours * 60 + minutes + 120;

  if (endMinutes >= 24 * 60) {
    return null;
  }

  const endHours = String(Math.floor(endMinutes / 60)).padStart(2, "0");
  const remainingMinutes = String(endMinutes % 60).padStart(2, "0");

  return `${endHours}:${remainingMinutes}`;
}

module.exports = getRestaurantEndTime;
