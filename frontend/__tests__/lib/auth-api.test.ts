import { API } from "@/lib/api/endpoints";

const postMock = jest.fn();

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    post: (...args: unknown[]) => postMock(...args),
  },
}));

import { loginUser, registerUser } from "@/lib/api/auth";

describe("auth api wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registerUser posts to register endpoint", async () => {
    postMock.mockResolvedValue({ data: { success: true, message: "ok", data: {} } });

    await registerUser({ name: "A", email: "a@test.com", password: "password123", confirmPassword: "password123" });

    expect(postMock).toHaveBeenCalledWith(API.AUTH.REGISTER, expect.any(Object));
  });

  it("loginUser posts to login endpoint", async () => {
    postMock.mockResolvedValue({ data: { success: true, message: "ok", token: "t", data: { role: "user" } } });

    await loginUser({ email: "a@test.com", password: "password123" });

    expect(postMock).toHaveBeenCalledWith(API.AUTH.LOGIN, expect.any(Object));
  });

  it("registerUser throws normalized error message", async () => {
    postMock.mockRejectedValue({ response: { data: { message: "Registration failed" } } });

    await expect(registerUser({ name: "A", email: "a@test.com", password: "password123", confirmPassword: "password123" })).rejects.toThrow(
      "Registration failed"
    );
  });
});
