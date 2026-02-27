jest.mock("../../middleware/auth.middleware", () => ({
  requireAuth: (req: any, res: any, next: any) => {
    if (req.headers.authorization === "Bearer avatar-user-token") {
      req.user = { id: "user-1", role: "user", email: "user@test.com", name: "User" };
      return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
  },
}));

jest.mock("../../middleware/multer.middleware", () => ({
  uploadUserImage: {
    single: () => (req: any, res: any, next: any) => {
      const scenario = req.headers["x-upload-scenario"];
      if (scenario === "invalid-type") {
        return res.status(400).json({ success: false, message: "Only image files are allowed" });
      }
      if (scenario === "too-large") {
        return res.status(400).json({ success: false, message: "File too large" });
      }
      if (scenario === "ok") {
        req.file = { filename: "avatar.png" };
      }
      return next();
    },
  },
  uploadMovieImage: {
    single: () => (req: any, _res: any, next: any) => next(),
  },
}));

import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("User avatar route integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("POST /api/users/avatar returns 401 when unauthorized", async () => {
    const res = await request(app).post("/api/users/avatar");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/users/avatar returns 400 when no file uploaded", async () => {
    const res = await request(app).post("/api/users/avatar").set("Authorization", "Bearer avatar-user-token");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("No file uploaded");
  });

  it("POST /api/users/avatar returns 400 for invalid file type", async () => {
    const res = await request(app)
      .post("/api/users/avatar")
      .set("Authorization", "Bearer avatar-user-token")
      .set("x-upload-scenario", "invalid-type");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Only image files are allowed");
  });

  it("POST /api/users/avatar returns 400 for oversized file", async () => {
    const res = await request(app)
      .post("/api/users/avatar")
      .set("Authorization", "Bearer avatar-user-token")
      .set("x-upload-scenario", "too-large");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("File too large");
  });

  it("POST /api/users/avatar uploads and updates user image", async () => {
    jest.spyOn(UserModel, "findByIdAndUpdate").mockResolvedValue({ _id: "user-1", image: "/uploads/users/avatar.png" } as any);

    const res = await request(app)
      .post("/api/users/avatar")
      .set("Authorization", "Bearer avatar-user-token")
      .set("x-upload-scenario", "ok");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.path).toBe("/uploads/users/avatar.png");
  });
});
