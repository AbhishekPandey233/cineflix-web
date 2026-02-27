jest.mock("../../../repositories/user.repository", () => {
  const mockRepo = {
    getUserByEmail: jest.fn(),
    getUserByName: jest.fn(),
    createUser: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    getUserByResetToken: jest.fn(),
  };

  return {
    UserRepository: jest.fn(() => mockRepo),
    __mockRepo: mockRepo,
  };
});

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserService } from "../../../services/user.service";
import { UserRepository } from "../../../repositories/user.repository";

describe("user.service", () => {
  const service = new UserService();
  const repo = (UserRepository as unknown as jest.Mock).mock.results[0].value;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("createUser throws when email exists", async () => {
    repo.getUserByEmail.mockResolvedValue({ _id: "u1" });

    await expect(
      service.createUser({
        name: "user1",
        email: "exists@example.com",
        password: "password123",
        confirmPassword: "password123",
      } as any)
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("createUser hashes password and returns safe user", async () => {
    repo.getUserByEmail.mockResolvedValue(null);
    repo.getUserByName.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashed-password");
    repo.createUser.mockResolvedValue({
      toObject: () => ({ id: "u1", email: "new@example.com", password: "hashed-password" }),
    });

    const result = await service.createUser({
      name: "user2",
      email: "new@example.com",
      password: "password123",
      confirmPassword: "password123",
    } as any);

    expect(bcryptjs.hash).toHaveBeenCalled();
    expect(result.password).toBeUndefined();
    expect(result.email).toBe("new@example.com");
  });

  it("loginUser throws 404 when user missing", async () => {
    repo.getUserByEmail.mockResolvedValue(null);

    await expect(service.loginUser({ email: "missing@example.com", password: "password123" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("loginUser throws 401 on invalid password", async () => {
    repo.getUserByEmail.mockResolvedValue({ password: "hash" });
    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.loginUser({ email: "u@example.com", password: "wrongpass" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("loginUser returns token and safe user on success", async () => {
    repo.getUserByEmail.mockResolvedValue({
      _id: "u1",
      email: "u@example.com",
      name: "user",
      role: "user",
      password: "hash",
      toObject: () => ({ _id: "u1", email: "u@example.com", password: "hash" }),
    });
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("jwt-token");

    const result = await service.loginUser({ email: "u@example.com", password: "password123" });

    expect(result.token).toBe("jwt-token");
    expect(result.user.password).toBeUndefined();
  });

  it("getUserById throws 404 when user not found", async () => {
    repo.getUserById.mockResolvedValue(null);

    await expect(service.getUserById("missing-id")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("requestPasswordReset returns null token for unknown email", async () => {
    repo.getUserByEmail.mockResolvedValue(null);

    const result = await service.requestPasswordReset("unknown@example.com");

    expect(result).toEqual({ token: null });
  });
});
