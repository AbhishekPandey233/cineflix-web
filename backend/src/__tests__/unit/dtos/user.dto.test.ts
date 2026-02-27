import { CreateUserDTO, ForgotPasswordDTO, LoginUserDTO, ResetPasswordDTO } from "../../../dtos/user.dto";

describe("user.dto", () => {
  it("CreateUserDTO accepts valid payload", () => {
    const parsed = CreateUserDTO.safeParse({
      firstName: "A",
      lastName: "B",
      name: "user1",
      email: "user1@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(parsed.success).toBe(true);
  });

  it("CreateUserDTO rejects missing confirmPassword", () => {
    const parsed = CreateUserDTO.safeParse({
      name: "user2",
      email: "user2@example.com",
      password: "password123",
    });

    expect(parsed.success).toBe(false);
  });

  it("CreateUserDTO rejects mismatched passwords", () => {
    const parsed = CreateUserDTO.safeParse({
      name: "user3",
      email: "user3@example.com",
      password: "password123",
      confirmPassword: "password999",
    });

    expect(parsed.success).toBe(false);
  });

  it("LoginUserDTO rejects invalid email", () => {
    const parsed = LoginUserDTO.safeParse({ email: "bad-email", password: "password123" });
    expect(parsed.success).toBe(false);
  });

  it("ForgotPasswordDTO accepts valid email", () => {
    const parsed = ForgotPasswordDTO.safeParse({ email: "user4@example.com" });
    expect(parsed.success).toBe(true);
  });

  it("ResetPasswordDTO rejects short token", () => {
    const parsed = ResetPasswordDTO.safeParse({
      token: "short",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(parsed.success).toBe(false);
  });
});
