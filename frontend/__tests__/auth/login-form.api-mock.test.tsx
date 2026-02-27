import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/(auth)/_components/LoginForm";
import { handleLogin } from "@/lib/actions/auth-actions";

// Demonstrates API/server-action mocking with jest.mock.
jest.mock("@/lib/actions/auth-actions", () => ({
  handleLogin: jest.fn(),
  handleForgotPassword: jest.fn(),
  handleResetPassword: jest.fn(),
}));

describe("LoginForm API mock", () => {
  it("calls mocked handleLogin on submit", async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    // Force failure response so no navigation side effects happen in test.
    (handleLogin as jest.Mock).mockResolvedValue({
      success: false,
      message: "Invalid credentials",
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });

    alertSpy.mockRestore();
  });
});