import request from "supertest";
import app from "../../app";
import { MovieModel } from "../../models/Movie";
import { mockSortLeanResult, mockLeanResult } from "../helpers/chain";

describe("Movie route integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("GET /api/movies returns all movies", async () => {
    jest.spyOn(MovieModel, "find").mockReturnValue(mockSortLeanResult([{ title: "Movie 1" }]) as any);

    const res = await request(app).get("/api/movies");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it("GET /api/movies/now-showing returns filtered list", async () => {
    jest.spyOn(MovieModel, "find").mockReturnValue(mockSortLeanResult([{ status: "now-showing" }]) as any);

    const res = await request(app).get("/api/movies/now-showing");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/movies/coming-soon returns filtered list", async () => {
    jest.spyOn(MovieModel, "find").mockReturnValue(mockSortLeanResult([{ status: "coming-soon" }]) as any);

    const res = await request(app).get("/api/movies/coming-soon");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/movies/:id returns movie by id", async () => {
    jest.spyOn(MovieModel, "findById").mockReturnValue(mockLeanResult({ _id: "m1", title: "Movie 1" }) as any);

    const res = await request(app).get("/api/movies/507f191e810c19729de860ea");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Movie 1");
  });

  it("GET /api/movies/:id returns 404 when missing", async () => {
    jest.spyOn(MovieModel, "findById").mockReturnValue(mockLeanResult(null) as any);

    const res = await request(app).get("/api/movies/507f191e810c19729de860eb");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Movie not found");
  });

  it("GET /api/movies/:id returns 500 for malformed id", async () => {
    jest.spyOn(MovieModel, "findById").mockImplementation(() => {
      throw new Error("CastError");
    });

    const res = await request(app).get("/api/movies/invalid-id");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
