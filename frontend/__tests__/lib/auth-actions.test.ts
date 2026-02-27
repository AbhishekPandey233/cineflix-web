jest.mock("@/lib/api/auth", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
}));

const cookieSetMock = jest.fn();

jest.mock("next/headers", () => ({
  cookies: async () => ({ set: cookieSetMock }),
}));

import { forgotPassword, loginUser, registerUser, resetPassword } from "@/lib/api/auth";
import { handleForgotPassword, handleLogin, handleRegister, handleResetPassword } from "@/lib/actions/auth-actions";

describe("auth-actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handleRegister returns success shape", async () => {
    (registerUser as jest.Mock).mockResolvedValue({ message: "ok", data: { _id: "u1" } });

    const result = await handleRegister({ name: "A", email: "a@test.com", password: "password123", confirmPassword: "password123" });

    expect(result.success).toBe(true);
    expect(result.message).toBe("ok");
  });

  it("handleLogin sets auth cookies on success", async () => {
    (loginUser as jest.Mock).mockResolvedValue({ message: "ok", token: "t1", data: { role: "user" } });

    const result = await handleLogin({ email: "a@test.com", password: "password123" });

    expect(result.success).toBe(true);
    expect(cookieSetMock).toHaveBeenCalled();
  });

  it("handleForgotPassword returns failure on thrown error", async () => {
    (forgotPassword as jest.Mock).mockRejectedValue(new Error("Request failed"));

    const result = await handleForgotPassword({ email: "a@test.com" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Request failed");
  });

  it("handleResetPassword returns success", async () => {
    (resetPassword as jest.Mock).mockResolvedValue({ message: "done" });

    const result = await handleResetPassword({ token: "1234567890", password: "password123", confirmPassword: "password123" });

    expect(result.success).toBe(true);
    expect(result.message).toBe("done");
  });
});
