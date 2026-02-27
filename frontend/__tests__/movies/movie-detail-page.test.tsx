import { render, screen } from "@testing-library/react";
import { use as reactUse } from "react";
import MovieDetailPage from "@/app/movies/[id]/page";

jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return {
    ...actual,
    use: jest.fn(),
  };
});

const getMock = jest.fn();

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: { get: (...args: unknown[]) => getMock(...args) },
}));

describe("MovieDetailPage", () => {
  beforeEach(() => {
    getMock.mockReset();
    (reactUse as jest.Mock).mockReturnValue({ id: "m1" });
  });

  it("renders movie title when API returns movie", async () => {
    getMock
      .mockResolvedValueOnce({ data: { data: { _id: "m1", title: "Movie A", genre: "Action", rating: "PG", img: "/a.jpg", year: 2025, score: 8, duration: "2h", synopsis: "plot", language: "EN" } } })
      .mockResolvedValueOnce({ data: { data: [] } });

    render(<MovieDetailPage params={Promise.resolve({ id: "m1" })} />);

    expect(await screen.findByText("Movie A")).toBeInTheDocument();
  });

  it("shows no showtimes state", async () => {
    getMock
      .mockResolvedValueOnce({ data: { data: { _id: "m1", title: "Movie B", genre: "Drama", rating: "PG", img: "/b.jpg", year: 2024, score: 7, duration: "1h", synopsis: "plot", language: "EN" } } })
      .mockResolvedValueOnce({ data: { data: [] } });

    render(<MovieDetailPage params={Promise.resolve({ id: "m1" })} />);

    expect(await screen.findByText("No showtimes available")).toBeInTheDocument();
  });

  it("shows fallback when movie is missing", async () => {
    getMock.mockRejectedValue(new Error("Not found"));

    (reactUse as jest.Mock).mockReturnValue({ id: "missing" });

    render(<MovieDetailPage params={Promise.resolve({ id: "missing" })} />);

    expect(await screen.findByText("Movie not found")).toBeInTheDocument();
  });
});
