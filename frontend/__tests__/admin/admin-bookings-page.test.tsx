import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminBookingsPage from "@/app/admin/bookings/page";

const getMock = jest.fn();
const deleteMock = jest.fn();

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => getMock(...args),
    delete: (...args: unknown[]) => deleteMock(...args),
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

  it("shows remove action for cancelled booking and calls remove endpoint", async () => {
    const user = userEvent.setup();
    getMock.mockResolvedValue({
      data: {
        data: [
          {
            _id: "b2",
            userId: { _id: "u2", email: "u2@test.com", fullName: "User Two" },
            showtimeId: { _id: "s2", movieId: { _id: "m2", title: "Movie 2" }, hallId: "B", hallName: "Hall B", startTime: new Date().toISOString(), price: 120 },
            seats: ["B1"],
            totalPrice: 120,
            status: "cancelled",
            canceledBy: "admin",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });
    deleteMock.mockResolvedValue({ data: { success: true } });

    render(<AdminBookingsPage />);

    await user.click(await screen.findByRole("button", { name: "Remove" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(deleteMock).toHaveBeenCalledWith("/api/admin/bookings/b2/remove");
  });

  it("opens cancel confirmation modal and cancels booking on confirm", async () => {
    const user = userEvent.setup();
    getMock.mockResolvedValue({
      data: {
        data: [
          {
            _id: "b3",
            userId: { _id: "u3", email: "u3@test.com", fullName: "User Three" },
            showtimeId: { _id: "s3", movieId: { _id: "m3", title: "Movie 3" }, hallId: "A", hallName: "Hall A", startTime: new Date().toISOString(), price: 150 },
            seats: ["A2"],
            totalPrice: 150,
            status: "confirmed",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });
    deleteMock.mockResolvedValue({ data: { success: true } });

    render(<AdminBookingsPage />);

    await user.click(await screen.findByRole("button", { name: "Cancel" }));
    expect(await screen.findByText("Cancel Booking?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(deleteMock).toHaveBeenCalledWith("/api/admin/bookings/b3");
  });
});
