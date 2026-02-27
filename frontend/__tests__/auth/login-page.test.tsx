import { render, screen } from "@testing-library/react";

// Mock server actions imported by client forms used in the page.
jest.mock("@/lib/actions/auth-actions", () => ({
  handleLogin: jest.fn(),
  handleForgotPassword: jest.fn(),
  handleResetPassword: jest.fn(),
  handleRegister: jest.fn(),
}));

import LoginPage from "@/app/(auth)/login/page";

describe("Login page", () => {
  it("renders login page content and form controls", () => {
    // Smoke test: key login UI elements should be present.
    render(<LoginPage />);

    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });
});