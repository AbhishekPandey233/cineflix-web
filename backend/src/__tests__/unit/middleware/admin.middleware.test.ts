import { requireAdmin } from "../../../middleware/admin.middleware";

describe("admin.middleware", () => {
  it("returns 401 when req.user missing", () => {
    const req: any = {};
    const next = jest.fn();

    requireAdmin(req, {} as any, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Unauthorized");
  });

  it("returns 403 for non-admin role", () => {
    const req: any = { user: { role: "user" } };
    const next = jest.fn();

    requireAdmin(req, {} as any, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("Forbidden (admin only)");
  });

  it("calls next for admin user", () => {
    const req: any = { user: { role: "admin" } };
    const next = jest.fn();

    requireAdmin(req, {} as any, next);

    expect(next).toHaveBeenCalledWith();
  });
});
