import { render, screen, waitFor } from "@testing-library/react";
import HistoryPage from "@/app/history/page";
import { createSearchParams } from "../helpers/mocks";

const getMock = jest.fn();
const postMock = jest.fn();
const delMock = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => createSearchParams({}),
}));

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
    delete: (...args: unknown[]) => delMock(...args),
  },
}));

describe("HistoryPage", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    delMock.mockReset();
  });

  it("renders booking history heading", async () => {
    getMock.mockResolvedValue({ data: { data: [] } });

    render(<HistoryPage />);

    expect(await screen.findByText("Booking History")).toBeInTheDocument();
  });

  it("renders empty state when no bookings", async () => {
    getMock.mockResolvedValue({ data: { data: [] } });

    render(<HistoryPage />);

    expect(await screen.findByText("No bookings yet")).toBeInTheDocument();
  });

  it("renders booking item when bookings exist", async () => {
    getMock.mockResolvedValue({
      data: {
        data: [
          {
            _id: "b1",
            showtimeId: { _id: "s1", movieId: { _id: "m1", title: "Movie One" }, hallId: "A", hallName: "Hall A", startTime: new Date().toISOString(), price: 250 },
            seats: ["A1"],
            totalPrice: 250,
            status: "confirmed",
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });

    render(<HistoryPage />);

    expect(await screen.findByText("Movie One")).toBeInTheDocument();
  });

  it("shows load error message when API fails", async () => {
    getMock.mockRejectedValue({ response: { data: { message: "Failed to load bookings" } } });

    render(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load bookings")).toBeInTheDocument();
    });
  });
});
