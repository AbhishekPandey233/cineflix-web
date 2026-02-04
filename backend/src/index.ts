// src/index.ts
import path from "path";
import "dotenv/config";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import adminUserRoutes from "./routes/admin.user.route";
import authRoutes from "./routes/auth.route";
import { connectDatabase } from "./database/mongodb";
import userAvatarRoutes from "./routes/user.avatar.route";

import { PORT } from "./config";

const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userAvatarRoutes);


// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/admin", adminUserRoutes);

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`✅ Server running: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
