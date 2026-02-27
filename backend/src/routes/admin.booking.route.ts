import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new BookingController();

router.use(requireAuth, requireAdmin);

router.get("/bookings", controller.adminGetAllBookings);
router.delete("/bookings/:bookingId", controller.adminCancelBooking);
router.delete("/bookings/:bookingId/remove", controller.adminRemoveCancelledBooking);

export default router;
