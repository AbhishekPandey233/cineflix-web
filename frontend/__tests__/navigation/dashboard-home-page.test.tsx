import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(dashboard)/home/page";

const getMock = jest.fn();

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => getMock(...args),
  },
}));

describe("Dashboard HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders welcome text", async () => {
    getMock.mockResolvedValue({ data: { data: [] } });

    render(<HomePage />);

    expect(await screen.findByText(/New Movies,/)).toBeInTheDocument();
  });

  it("shows empty now-showing message when no movies", async () => {
    getMock.mockResolvedValue({ data: { data: [] } });

    render(<HomePage />);

    expect(await screen.findByText("No movies currently showing")).toBeInTheDocument();
  });

  it("renders movie card when API returns now-showing", async () => {
    getMock.mockResolvedValue({ data: { data: [{ _id: "m1", title: "Featured", genre: "Action", rating: "PG", img: "/p.jpg", year: 2024, score: 8.2 }] } });

    render(<HomePage />);

    expect(await screen.findByText("Featured")).toBeInTheDocument();
  });
});
