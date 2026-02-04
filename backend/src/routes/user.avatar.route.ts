// routes/user.avatar.route.ts
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { UserModel as User } from "../models/user.model";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads", "users");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

function requireAuth(req: express.Request, _res: express.Response, next: express.NextFunction) {
  const auth = (req.headers.authorization || "").split(" ")[1];
  if (!auth) return next(new Error("Unauthorized"));
  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new Error("Unauthorized"));
  try {
    const payload = jwt.verify(auth, secret) as any;
    (req as any).userId = (payload as any).id;
    return next();
  } catch (e) {
    return next(new Error("Unauthorized"));
  }
}

router.post("/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file" });
    const url = `${process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT}`}/uploads/users/${req.file.filename}`;
    // persist to user record
    const userId = (req as any).userId;
    const updated = await User.findByIdAndUpdate(userId, { avatar: url }, { new: true });
    return res.json({ success: true, url, user: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Upload error" });
  }
});

export default router;