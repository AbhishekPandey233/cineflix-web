// src/index.ts
import path from "path";
import "dotenv/config";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import adminUserRoutes from "./routes/admin.user.route";
import adminMovieRoutes from "./routes/admin.movie.route";
import adminShowtimeRoutes from "./routes/admin.showtime.route";
import adminBookingRoutes from "./routes/admin.booking.route";
import authRoutes from "./routes/auth.route";
import userProfileRoutes from "./routes/user.profile.route";
import { connectDatabase } from "./database/mongodb";
import userAvatarRoutes from "./routes/user.avatar.route";
import bookingRoutes from "./routes/booking.route";
import movieRoutes from "./routes/movie.route";
import { seedMovies } from "./seeds/movies.seed";

import { PORT } from "./config"; 

const app: Application = express();
import cors from "cors";


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow frontend to call backend directly with credentials (cookies)
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));

app.use("/api/users", userAvatarRoutes);


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userProfileRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api", bookingRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin", adminMovieRoutes);
app.use("/api/admin", adminShowtimeRoutes);
app.use("/api/admin", adminBookingRoutes);

async function startServer() {
  try {
    await connectDatabase();
    await seedMovies();

    app.listen(PORT, () => {
      console.log(`✅ Server running: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
