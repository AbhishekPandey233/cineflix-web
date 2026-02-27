import jwt from "jsonwebtoken";
import { requireAuth } from "../../../middleware/auth.middleware";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("auth.middleware", () => {
  it("calls next with 401 when token missing", () => {
    const req: any = { headers: {} };
    const next = jest.fn();

    requireAuth(req, {} as any, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Unauthorized");
  });

  it("sets req.user and calls next for valid bearer token", () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "u1", role: "user" });

    const req: any = { headers: { authorization: "Bearer token-123" } };
    const next = jest.fn();

    requireAuth(req, {} as any, next);

    expect(req.user).toEqual({ id: "u1", role: "user" });
    expect(next).toHaveBeenCalledWith();
  });

  it("reads token from cookie header", () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "u2", role: "admin" });

    const req: any = { headers: { cookie: "foo=bar; token=cookie-token" } };
    const next = jest.fn();

    requireAuth(req, {} as any, next);

    expect(req.user.id).toBe("u2");
    expect(next).toHaveBeenCalledWith();
  });
});
