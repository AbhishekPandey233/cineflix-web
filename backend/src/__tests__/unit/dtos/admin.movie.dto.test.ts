import { AdminCreateMovieDTO, AdminUpdateMovieDTO } from "../../../dtos/admin.movie.dto";

describe("admin.movie.dto", () => {
  const validMovie = {
    title: "Movie X",
    genre: "Action",
    rating: "PG-13",
    img: "/uploads/movies/x.jpg",
    year: 2025,
    score: 8.5,
    duration: "2h",
    synopsis: "desc",
    language: "English",
    status: "now-showing",
    releaseDate: "2026-01-01",
  };

  it("AdminCreateMovieDTO accepts valid movie", () => {
    const parsed = AdminCreateMovieDTO.safeParse(validMovie);
    expect(parsed.success).toBe(true);
  });

  it("AdminCreateMovieDTO rejects invalid status", () => {
    const parsed = AdminCreateMovieDTO.safeParse({ ...validMovie, status: "invalid" });
    expect(parsed.success).toBe(false);
  });

  it("AdminCreateMovieDTO rejects out-of-range score", () => {
    const parsed = AdminCreateMovieDTO.safeParse({ ...validMovie, score: 15 });
    expect(parsed.success).toBe(false);
  });

  it("AdminUpdateMovieDTO accepts partial payload", () => {
    const parsed = AdminUpdateMovieDTO.safeParse({ title: "Updated Title" });
    expect(parsed.success).toBe(true);
  });
});
