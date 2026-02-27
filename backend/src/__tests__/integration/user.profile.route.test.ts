jest.mock("../../middleware/auth.middleware", () => ({
  requireAuth: (req: any, res: any, next: any) => {
    if (req.headers.authorization === "Bearer profile-user-token") {
      req.user = { id: "user-1", role: "user", email: "user@test.com", name: "User" };
      return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
  },
}));

jest.mock("../../middleware/multer.middleware", () => ({
  uploadUserImage: {
    single: () => (req: any, _res: any, next: any) => next(),
  },
  uploadMovieImage: {
    single: () => (req: any, _res: any, next: any) => next(),
  },
}));

import request from "supertest";
import app from "../../app";
import { UserService } from "../../services/user.service";

describe("User profile route integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("GET /api/user/profile returns 401 when unauthorized", async () => {
    const res = await request(app).get("/api/user/profile");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/user/profile returns profile data", async () => {
    jest.spyOn(UserService.prototype, "getUserById").mockResolvedValue({ id: "user-1", email: "user@test.com" } as any);

    const res = await request(app).get("/api/user/profile").set("Authorization", "Bearer profile-user-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("user@test.com");
  });

  it("PUT /api/user/profile returns 200 on valid update", async () => {
    jest.spyOn(UserService.prototype, "updateProfile").mockResolvedValue({ id: "user-1", name: "Updated" } as any);

    const res = await request(app)
      .put("/api/user/profile")
      .set("Authorization", "Bearer profile-user-token")
      .send({ name: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Profile updated");
  });

  it("PUT /api/user/profile returns 409 for duplicate email", async () => {
    jest.spyOn(UserService.prototype, "updateProfile").mockRejectedValue({ statusCode: 409, message: "Email already in use" });

    const res = await request(app)
      .put("/api/user/profile")
      .set("Authorization", "Bearer profile-user-token")
      .send({ email: "exists@example.com" });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Email already in use");
  });

  it("PUT /api/user/profile returns 401 when unauthorized", async () => {
    const res = await request(app).put("/api/user/profile").send({ name: "NoAuth" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
