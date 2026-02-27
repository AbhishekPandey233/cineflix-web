import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/app/(auth)/_components/RegisterForm";
import { handleRegister } from "@/lib/actions/auth-actions";
import { mockRouter } from "../helpers/mocks";

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@/lib/actions/auth-actions", () => ({
  handleRegister: jest.fn(),
}));

describe("RegisterForm behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows password mismatch validation message", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Name"), "User Test");
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password999");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });

  it("shows email validation message for missing email", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Name"), "User Test");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Please enter a valid email")).toBeInTheDocument();
  });

  it("pushes to login after successful register", async () => {
    const user = userEvent.setup();
    (handleRegister as jest.Mock).mockResolvedValue({ success: true, message: "ok" });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Name"), "User Test");
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
  });

  it("alerts on failed register response", async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    (handleRegister as jest.Mock).mockResolvedValue({ success: false, message: "Email already used" });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Name"), "User Test");
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Email already used");
    });

    alertSpy.mockRestore();
  });
});
