import { Router } from "express";
import { AdminShowtimeController } from "../controllers/admin.showtime.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new AdminShowtimeController();

router.use(requireAuth, requireAdmin);

router.get("/showtimes/movie/:movieId", controller.getShowtimesByMovie);
router.post("/showtimes", controller.createShowtime);
router.put("/showtimes/:id", controller.updateShowtime);
router.delete("/showtimes/:id", controller.deleteShowtime);

export default router;
