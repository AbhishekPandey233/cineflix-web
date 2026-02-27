import request from "supertest";
import app from "../../app";
import { UserService } from "../../services/user.service";

describe("Auth route integration (extended)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("POST /api/auth/register returns 400 for invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "user-a",
      email: "not-an-email",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation error");
  });

  it("POST /api/auth/register returns 400 for password mismatch", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "user-b",
      email: "userb@example.com",
      password: "password123",
      confirmPassword: "password999",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/register returns 409 for duplicate email", async () => {
    jest.spyOn(UserService.prototype, "createUser").mockRejectedValue({ statusCode: 409, message: "Email already in use" });

    const res = await request(app).post("/api/auth/register").send({
      name: "user-c",
      email: "dupe@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Email already in use");
  });

  it("POST /api/auth/login returns 400 for invalid payload", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "invalid",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation error");
  });

  it("POST /api/auth/login returns 404 when user not found", async () => {
    jest.spyOn(UserService.prototype, "loginUser").mockRejectedValue({ statusCode: 404, message: "User not found" });

    const res = await request(app).post("/api/auth/login").send({
      email: "missing@example.com",
      password: "password123",
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("POST /api/auth/login returns 401 on invalid credentials", async () => {
    jest.spyOn(UserService.prototype, "loginUser").mockRejectedValue({ statusCode: 401, message: "Invalid credentials" });

    const res = await request(app).post("/api/auth/login").send({
      email: "user@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/forgot-password returns 400 on invalid email", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({ email: "bad" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation error");
  });

  it("POST /api/auth/reset-password returns 400 on missing token", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({
      token: "short",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation error");
  });
});
