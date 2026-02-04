import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { uploadUserImage } from "../middleware/multer.middleware";

const router = Router();
const controller = new AuthController();

router.get("/profile", requireAuth, (req, res, next) => {
  return controller.getProfile(req as any, res as any);
});

// PUT profile – supports image upload under field "image"
router.put("/profile", requireAuth, uploadUserImage.single("image"), (req, res, next) => {
  // ensure controller sees the correct id param
  (req as any).params = (req as any).params || {};
  (req as any).params.id = (req as any).user?.id;
  return controller.updateProfile(req as any, res as any);
});

export default router;
