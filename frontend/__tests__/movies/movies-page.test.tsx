import { render, screen, waitFor } from "@testing-library/react";
import MoviesPage from "@/app/movies/page";

const getMock = jest.fn();

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: { get: (...args: unknown[]) => getMock(...args) },
}));

describe("MoviesPage", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("renders page title", async () => {
    getMock.mockResolvedValueOnce({ data: { data: [] } }).mockResolvedValueOnce({ data: { data: [] } });

    render(<MoviesPage />);

    expect(await screen.findByText("Movies")).toBeInTheDocument();
  });

  it("renders now showing movie cards", async () => {
    getMock
      .mockResolvedValueOnce({ data: { data: [{ _id: "m1", title: "Now 1", genre: "Action", rating: "PG", img: "/a.jpg", year: 2025, score: 8, duration: "2h", synopsis: "s", language: "en", status: "now-showing" }] } })
      .mockResolvedValueOnce({ data: { data: [] } });

    render(<MoviesPage />);

    expect(await screen.findByText("Now 1")).toBeInTheDocument();
  });

  it("renders coming soon section item", async () => {
    getMock.mockResolvedValueOnce({ data: { data: [] } }).mockResolvedValueOnce({ data: { data: [{ _id: "m2", title: "Soon 1", releaseDate: "2026-02-01" }] } });

    render(<MoviesPage />);

    expect(await screen.findByText("Soon 1")).toBeInTheDocument();
  });
});
