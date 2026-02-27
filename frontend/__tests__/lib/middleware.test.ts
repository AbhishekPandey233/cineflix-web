import { middleware } from "../../middleware";
import type { NextRequest } from "next/server";

const nextMock = jest.fn(() => ({ type: "next" }));
const redirectMock = jest.fn((url) => ({ type: "redirect", url }));

jest.mock("next/server", () => ({
  NextResponse: {
    next: () => nextMock(),
    redirect: (url: URL) => redirectMock(url),
  },
}));

const makeReq = (pathname: string, cookies: Record<string, string> = {}) => ({
  nextUrl: {
    pathname,
    clone: () => ({ pathname }),
  },
  cookies: {
    get: (key: string) => (cookies[key] ? { value: cookies[key] } : undefined),
  },
});

describe("middleware route protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects unauthenticated /home to /login", () => {
    const req = makeReq("/home");

    middleware(req as unknown as NextRequest);

    expect(redirectMock).toHaveBeenCalled();
  });

  it("redirects non-admin /admin route to /home", () => {
    const req = makeReq("/admin/users", { token: "t1", role: "user" });

    middleware(req as unknown as NextRequest);

    expect(redirectMock).toHaveBeenCalled();
  });

  it("allows admin /admin route", () => {
    const req = makeReq("/admin/users", { token: "t1", role: "admin" });

    middleware(req as unknown as NextRequest);

    expect(nextMock).toHaveBeenCalled();
  });
});
