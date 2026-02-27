import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/app/(auth)/_components/RegisterForm";

const pushMock = jest.fn();

// Router is mocked so redirect behavior can be asserted safely.
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("@/lib/actions/auth-actions", () => ({
  handleRegister: jest.fn(),
}));

describe("RegisterForm", () => {
  it("shows validation errors on empty submit", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(screen.getByText("Name must be at least 2 characters")).toBeInTheDocument();
      expect(screen.getByText("Please enter a valid email")).toBeInTheDocument();
      expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
      expect(screen.getByText("Confirm your password")).toBeInTheDocument();
    });
  });

  it("toggles password visibility when clicking Show/Hide", async () => {
    // Interaction test for the Show/Hide button.
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const showButtons = screen.getAllByRole("button", { name: "Show" });
    await user.click(showButtons[0]);
    expect(passwordInput.type).toBe("text");

    const hideButtons = screen.getAllByRole("button", { name: "Hide" });
    await user.click(hideButtons[0]);
    expect(passwordInput.type).toBe("password");
  });
});