import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Auth integration", () => {
  // Dedicated account used by integration tests.
  const testUser = {
    name: "jestuser",
    email: "jest.auth@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  beforeAll(async () => {
    // Clean stale user if previous run was interrupted.
    await UserModel.deleteOne({ email: testUser.email });
  });

  afterAll(async () => {
    // Remove test data to keep DB clean.
    await UserModel.deleteOne({ email: testUser.email });
  });

  it("POST /api/auth/register should create a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      message: "User Created",
    });
    expect(response.body.data).toBeDefined();
    expect(response.body.data.email).toBe(testUser.email);
    expect(response.body.data.password).toBeUndefined();
  });

  it("POST /api/auth/login should return token and user data", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Login successful",
    });
    expect(response.body.token).toBeTruthy();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.email).toBe(testUser.email);
    expect(response.body.data.password).toBeUndefined();
  });
});