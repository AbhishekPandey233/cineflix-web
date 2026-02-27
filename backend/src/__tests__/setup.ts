import mongoose from "mongoose";
import { connectDatabase } from "../database/mongodb";

// Open one MongoDB connection before the test suite starts.
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDatabase();
  }
});

// Ensure Jest exits cleanly by closing the connection.
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});