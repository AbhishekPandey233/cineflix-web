import { AdminCreateShowtimeDTO, AdminUpdateShowtimeDTO } from "../../../dtos/admin.showtime.dto";

describe("admin.showtime.dto", () => {
  it("AdminCreateShowtimeDTO accepts valid payload", () => {
    const parsed = AdminCreateShowtimeDTO.safeParse({
      movieId: "movie-1",
      hallId: "A",
      startTime: "2026-03-01T10:00:00.000Z",
      price: 350,
    });

    expect(parsed.success).toBe(true);
  });

  it("AdminCreateShowtimeDTO rejects invalid hallId", () => {
    const parsed = AdminCreateShowtimeDTO.safeParse({
      movieId: "movie-1",
      hallId: "C",
      startTime: "2026-03-01T10:00:00.000Z",
      price: 350,
    });

    expect(parsed.success).toBe(false);
  });

  it("AdminUpdateShowtimeDTO rejects negative price", () => {
    const parsed = AdminUpdateShowtimeDTO.safeParse({ price: -10 });
    expect(parsed.success).toBe(false);
  });
});
