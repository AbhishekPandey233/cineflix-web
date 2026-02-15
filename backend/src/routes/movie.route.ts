import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";

const router = Router();
const controller = new MovieController();

router.get("/", controller.getAllMovies);
router.get("/now-showing", controller.getNowShowing);
router.get("/coming-soon", controller.getComingSoon);
router.get("/:id", controller.getMovieById);

export default router;
