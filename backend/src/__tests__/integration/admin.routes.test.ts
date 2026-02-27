jest.mock("../../middleware/auth.middleware", () => ({
  requireAuth: (req: any, res: any, next: any) => {
    const token = req.headers.authorization;
    if (token === "Bearer admin-token") {
      req.user = { id: "admin-1", role: "admin", email: "admin@test.com", name: "Admin" };
      return next();
    }
    if (token === "Bearer user-token") {
      req.user = { id: "user-1", role: "user", email: "user@test.com", name: "User" };
      return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
  },
}));

jest.mock("../../middleware/admin.middleware", () => ({
  requireAdmin: (req: any, res: any, next: any) => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden (admin only)" });
    }
    return next();
  },
}));

jest.mock("../../middleware/multer.middleware", () => ({
  uploadUserImage: { single: () => (_req: any, _res: any, next: any) => next() },
  uploadMovieImage: { single: () => (_req: any, _res: any, next: any) => next() },
}));

import request from "supertest";
import app from "../../app";
import { UserRepository } from "../../repositories/user.repository";
import { MovieModel } from "../../models/Movie";
import { ShowtimeModel } from "../../models/Showtime";
import { BookingModel } from "../../models/Booking";
import { mockSortLeanResult, mockLeanResult, mockPopulateSortLeanResult } from "../helpers/chain";

describe("Admin routes integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("GET /api/admin/users returns 401 without auth", async () => {
    const res = await request(app).get("/api/admin/users");

    expect(res.status).toBe(401);
  });

  it("GET /api/admin/users returns 403 for non-admin", async () => {
    const res = await request(app).get("/api/admin/users").set("Authorization", "Bearer user-token");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden (admin only)");
  });

  it("GET /api/admin/users returns list for admin", async () => {
    jest.spyOn(UserRepository.prototype, "getAllUsers").mockResolvedValue([
      { toObject: () => ({ id: "u1", email: "u1@test.com", password: "secret" }) },
    ] as any);

    const res = await request(app).get("/api/admin/users").set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].password).toBeUndefined();
  });

  it("GET /api/admin/movies returns list for admin", async () => {
    jest.spyOn(MovieModel, "find").mockReturnValue(mockSortLeanResult([{ title: "Movie 1" }]) as any);

    const res = await request(app).get("/api/admin/movies").set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/admin/movies/:id returns 404 when not found", async () => {
    jest.spyOn(MovieModel, "findById").mockReturnValue(mockLeanResult(null) as any);

    const res = await request(app).get("/api/admin/movies/missing-id").set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Movie not found");
  });

  it("GET /api/admin/showtimes/movie/:movieId returns showtimes", async () => {
    jest.spyOn(ShowtimeModel, "find").mockReturnValue(mockSortLeanResult([{ _id: "s1" }]) as any);

    const res = await request(app)
      .get("/api/admin/showtimes/movie/movie-1")
      .set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/admin/bookings returns bookings", async () => {
    jest.spyOn(BookingModel, "find").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([{ _id: "b1" }]),
          }),
        }),
      }),
    } as any);

    const res = await request(app).get("/api/admin/bookings").set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("DELETE /api/admin/bookings/:id returns 404 when missing", async () => {
    jest.spyOn(BookingModel, "findById").mockResolvedValue(null as any);

    const res = await request(app)
      .delete("/api/admin/bookings/missing-id")
      .set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Booking not found");
  });
});
