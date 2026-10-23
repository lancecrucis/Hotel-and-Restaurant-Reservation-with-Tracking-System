const {
  getMyReservationHistory,
} = require("./reservationHistory.service");

async function listMyReservationHistory(request, response, next) {
  try {
    const history = await getMyReservationHistory(request.user.id);

    response.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listMyReservationHistory,
};
