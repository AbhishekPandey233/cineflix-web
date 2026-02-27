import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SeatSelectionPage from "@/app/seat-select/page";
import { createSearchParams, mockRouter } from "../helpers/mocks";

const getMock = jest.fn();
const postMock = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => createSearchParams({ showtimeId: "s1" }),
  useRouter: () => mockRouter,
}));

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
  },
}));

describe("SeatSelectionPage", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    jest.clearAllMocks();

    getMock.mockResolvedValue({
      data: {
        data: {
          showtimeId: "s1",
          movieId: "m1",
          hallId: "A",
          hallName: "Hall A",
          startTime: new Date().toISOString(),
          price: 200,
          layout: { rows: ["A"], seatsPerRow: 3, seatIds: ["A1", "A2", "A3"] },
          bookedSeats: ["A3"],
        },
      },
    });
  });

  it("renders seat selection heading", async () => {
    render(<SeatSelectionPage />);

    expect(await screen.findByText("Select Your Seats")).toBeInTheDocument();
  });

  it("keeps book button disabled when no seat selected", async () => {
    render(<SeatSelectionPage />);

    const button = await screen.findByRole("button", { name: "Book Seats" });
    expect(button).toBeDisabled();
  });

  it("updates selected seat summary when seat is clicked", async () => {
    const user = userEvent.setup();
    render(<SeatSelectionPage />);

    const seat = await screen.findByRole("button", { name: "Seat A1" });
    await user.click(seat);

    expect(screen.getByText("1 seat(s) - ₹200")).toBeInTheDocument();
  });

  it("opens confirmation dialog when booking is initiated", async () => {
    const user = userEvent.setup();
    render(<SeatSelectionPage />);

    const seat = await screen.findByRole("button", { name: "Seat A1" });
    await user.click(seat);
    await user.click(screen.getByRole("button", { name: "Book Seats" }));

    expect(screen.getByText("Confirm Booking")).toBeInTheDocument();
  });
});
