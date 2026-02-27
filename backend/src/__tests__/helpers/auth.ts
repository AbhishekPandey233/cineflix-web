import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";

export const makeToken = (overrides?: Record<string, unknown>) =>
  jwt.sign(
    {
      id: "user-1",
      email: "user@test.com",
      name: "Test User",
      role: "user",
      ...overrides,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
