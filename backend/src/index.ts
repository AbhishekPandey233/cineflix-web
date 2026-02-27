import "dotenv/config";
import { connectDatabase } from "./database/mongodb";
import { seedMovies } from "./seeds/movies.seed";
import { PORT } from "./config"; 
import app from "./app";

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
