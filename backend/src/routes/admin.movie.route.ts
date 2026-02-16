import { Router } from "express";
import { AdminMovieController } from "../controllers/admin.movie.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import { uploadMovieImage } from "../middleware/multer.middleware";

const router = Router();
const controller = new AdminMovieController();

router.use(requireAuth, requireAdmin);

router.post("/movies", uploadMovieImage.single("image"), controller.createMovie);
router.get("/movies", controller.getMovies);
router.get("/movies/:id", controller.getMovieById);
router.put("/movies/:id", uploadMovieImage.single("image"), controller.updateMovie);
router.delete("/movies/:id", controller.deleteMovie);

export default router;
