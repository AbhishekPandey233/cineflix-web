import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
const controller = new BookingController();

// Showtimes
router.get("/showtimes/movie/:movieId", controller.getShowtimesByMovie);
router.get("/showtimes/:showtimeId/seats", controller.getSeatAvailability);

// Bookings
router.post("/bookings", requireAuth, controller.createBooking);
router.get("/bookings/user/history", requireAuth, controller.getUserBookings);
router.delete("/bookings/:bookingId", requireAuth, controller.cancelBooking);
router.post("/bookings/:bookingId/payment/khalti/initiate", requireAuth, controller.initiateKhaltiPayment);
router.post("/bookings/:bookingId/payment/khalti/verify", requireAuth, controller.verifyKhaltiPayment);

export default router;
