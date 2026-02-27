import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "@/app/user/profile/page";

const getMock = jest.fn();
const putMock = jest.fn();
const postMock = jest.fn();

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    defaults: { baseURL: "http://localhost:5000" },
    get: (...args: unknown[]) => getMock(...args),
    put: (...args: unknown[]) => putMock(...args),
    post: (...args: unknown[]) => postMock(...args),
  },
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMock.mockResolvedValue({ data: { data: { _id: "u1", name: "User One", email: "user@example.com", role: "user" } } });
  });

  it("renders profile heading", async () => {
    render(<ProfilePage />);

    expect(await screen.findByText("My Profile")).toBeInTheDocument();
  });

  it("shows loaded user name", async () => {
    render(<ProfilePage />);

    expect(await screen.findByDisplayValue("User One")).toBeInTheDocument();
  });

  it("shows nothing-to-change message when submitting unchanged profile", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await screen.findByDisplayValue("User One");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Nothing to change")).toBeInTheDocument();
  });

  it("submits changed profile and shows success", async () => {
    const user = userEvent.setup();
    putMock.mockResolvedValue({ data: { success: true, data: { name: "New Name", email: "user@example.com" } } });

    render(<ProfilePage />);

    const nameInput = await screen.findByDisplayValue("User One");
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(putMock).toHaveBeenCalled();
    });
    expect(await screen.findByText("Profile updated")).toBeInTheDocument();
  });
});
