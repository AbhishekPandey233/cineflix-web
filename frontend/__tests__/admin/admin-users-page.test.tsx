import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminUsersPage from "@/app/admin/users/page";

const getMock = jest.fn();
const deleteMock = jest.fn();

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => getMock(...args),
    delete: (...args: unknown[]) => deleteMock(...args),
  },
}));

describe("AdminUsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders heading", async () => {
    getMock.mockResolvedValue({ data: { data: [] } });
    render(<AdminUsersPage />);

    expect(await screen.findByText("System Users")).toBeInTheDocument();
  });

  it("renders empty state row", async () => {
    getMock.mockResolvedValue({ data: { data: [] } });
    render(<AdminUsersPage />);

    expect(await screen.findByText("No users found.")).toBeInTheDocument();
  });

  it("deletes a user after confirm", async () => {
    const user = userEvent.setup();
    jest.spyOn(window, "confirm").mockReturnValue(true);

    getMock.mockResolvedValue({ data: { data: [{ _id: "u1", name: "A", email: "a@test.com", role: "user" }] } });
    deleteMock.mockResolvedValue({});

    render(<AdminUsersPage />);

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalled();
    });
  });
});
