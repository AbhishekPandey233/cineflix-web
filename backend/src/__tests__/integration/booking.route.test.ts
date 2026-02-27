jest.mock("../../middleware/auth.middleware", () => ({
  requireAuth: (req: any, res: any, next: any) => {
    if (req.headers.authorization === "Bearer good-user-token") {
      req.user = { id: "user-1", role: "user", email: "user@test.com", name: "User" };
      return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
  },
}));

import request from "supertest";
import app from "../../app";
import { BookingModel } from "../../models/Booking";
import { ShowtimeModel } from "../../models/Showtime";
import { mockSortLeanResult, mockLeanResult, mockSelectLeanResult, mockPopulateSortLeanResult } from "../helpers/chain";

describe("Booking route integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("GET /api/showtimes/movie/:movieId returns showtimes", async () => {
    jest.spyOn(ShowtimeModel, "find").mockReturnValue(mockSortLeanResult([{ _id: "s1" }]) as any);

    const res = await request(app).get("/api/showtimes/movie/movie-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/showtimes/:showtimeId/seats returns 404 when showtime not found", async () => {
    jest.spyOn(ShowtimeModel, "findById").mockReturnValue(mockLeanResult(null) as any);

    const res = await request(app).get("/api/showtimes/showtime-1/seats");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Showtime not found");
  });

  it("POST /api/bookings returns 401 without auth", async () => {
    const res = await request(app).post("/api/bookings").send({ showtimeId: "s1", seats: ["A1"] });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/bookings returns 400 for missing seats", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", "Bearer good-user-token")
      .send({ showtimeId: "s1", seats: [] });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("showtimeId and seats are required");
  });

  it("POST /api/bookings returns 404 when showtime missing", async () => {
    jest.spyOn(ShowtimeModel, "findById").mockReturnValue(mockLeanResult(null) as any);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", "Bearer good-user-token")
      .send({ showtimeId: "s-missing", seats: ["A1"] });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Showtime not found");
  });

  it("GET /api/bookings/user/history returns user bookings", async () => {
    jest.spyOn(BookingModel, "find").mockReturnValue(mockPopulateSortLeanResult([{ _id: "b1" }]) as any);

    const res = await request(app)
      .get("/api/bookings/user/history")
      .set("Authorization", "Bearer good-user-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("DELETE /api/bookings/:id returns 404 when booking missing", async () => {
    jest.spyOn(BookingModel, "findOne").mockResolvedValue(null as any);

    const res = await request(app)
      .delete("/api/bookings/b-missing")
      .set("Authorization", "Bearer good-user-token");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Booking not found or already cancelled");
  });
});
