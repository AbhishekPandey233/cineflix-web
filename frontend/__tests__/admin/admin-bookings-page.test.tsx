import { render, screen } from "@testing-library/react";
import AdminBookingsPage from "@/app/admin/bookings/page";

const getMock = jest.fn();

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => getMock(...args),
    delete: jest.fn(),
  },
}));

describe("AdminBookingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders bookings heading", async () => {
    getMock.mockResolvedValue({ data: { data: [] } });

    render(<AdminBookingsPage />);

    expect(await screen.findByText("Bookings")).toBeInTheDocument();
  });

  it("renders no bookings state", async () => {
    getMock.mockResolvedValue({ data: { data: [] } });

    render(<AdminBookingsPage />);

    expect(await screen.findByText("No bookings found")).toBeInTheDocument();
  });

  it("renders booking row data", async () => {
    getMock.mockResolvedValue({
      data: {
        data: [
          {
            _id: "b1",
            userId: { _id: "u1", email: "u@test.com", fullName: "User One" },
            showtimeId: { _id: "s1", movieId: { _id: "m1", title: "Movie 1" }, hallId: "A", hallName: "Hall A", startTime: new Date().toISOString(), price: 100 },
            seats: ["A1"],
            totalPrice: 100,
            status: "confirmed",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });

    render(<AdminBookingsPage />);

    expect(await screen.findByText("Movie 1")).toBeInTheDocument();
  });
});
