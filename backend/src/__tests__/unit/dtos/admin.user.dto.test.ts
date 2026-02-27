import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../../../dtos/admin.user.dto";

describe("admin.user.dto", () => {
  it("AdminCreateUserDTO accepts valid payload", () => {
    const parsed = AdminCreateUserDTO.safeParse({
      firstName: "Admin",
      lastName: "User",
      name: "admin1",
      email: "admin1@example.com",
      password: "password123",
      role: "admin",
      image: "/uploads/users/a.png",
    });

    expect(parsed.success).toBe(true);
  });

  it("AdminCreateUserDTO rejects missing required fields", () => {
    const parsed = AdminCreateUserDTO.safeParse({ email: "admin2@example.com" });
    expect(parsed.success).toBe(false);
  });

  it("AdminUpdateUserDTO accepts partial update", () => {
    const parsed = AdminUpdateUserDTO.safeParse({ firstName: "Updated" });
    expect(parsed.success).toBe(true);
  });

  it("AdminUpdateUserDTO rejects short password", () => {
    const parsed = AdminUpdateUserDTO.safeParse({ password: "123" });
    expect(parsed.success).toBe(false);
  });
});
