import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/(auth)/_components/LoginForm";
import { handleForgotPassword, handleLogin } from "@/lib/actions/auth-actions";

jest.mock("@/lib/actions/auth-actions", () => ({
  handleLogin: jest.fn(),
  handleForgotPassword: jest.fn(),
  handleResetPassword: jest.fn(),
}));

describe("LoginForm behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows validation error for missing email", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Please enter a valid email")).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Password must be at least 6 characters")).toBeInTheDocument();
  });

  it("switches to forgot mode and submits email", async () => {
    const user = userEvent.setup();
    (handleForgotPassword as jest.Mock).mockResolvedValue({ success: true, message: "Sent" });

    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Forgot password?" }));
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset token" }));

    await waitFor(() => {
      expect(handleForgotPassword).toHaveBeenCalledWith({ email: "user@example.com" });
    });
  });

  it("alerts when login action returns failure", async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    (handleLogin as jest.Mock).mockResolvedValue({ success: false, message: "Invalid credentials" });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Invalid credentials");
    });

    alertSpy.mockRestore();
  });
});
