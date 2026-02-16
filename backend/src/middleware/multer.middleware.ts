import multer from "multer";
import path from "path";
import fs from "fs";

const createStorage = (folder: string) => {
  const uploadDir = path.join(process.cwd(), "uploads", folder);
  fs.mkdirSync(uploadDir, { recursive: true });

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  });
};

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {   
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) return cb(new Error("Only image files are allowed"));
  cb(null, true);
};

export const uploadUserImage = multer({
  storage: createStorage("users"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadMovieImage = multer({
  storage: createStorage("movies"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
