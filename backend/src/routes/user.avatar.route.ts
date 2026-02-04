// routes/user.avatar.route.ts
import express from "express";
import { UserModel as User } from "../models/user.model";
import { requireAuth } from "../middleware/auth.middleware";
import { uploadUserImage } from "../middleware/multer.middleware";

const router = express.Router();

// POST /api/users/avatar
// field: "avatar"
router.post("/avatar", requireAuth, uploadUserImage.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const filename = req.file.filename;
    const pathUrl = `/uploads/users/${filename}`;
    const url = `${process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT}`}${pathUrl}`;

    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Save the relative path in the user document (field 'image')
    const updated = await User.findByIdAndUpdate(userId, { image: pathUrl }, { new: true });

    return res.json({ success: true, message: "Upload successful", url, path: pathUrl, user: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Upload error" });
  }
});

export default router;