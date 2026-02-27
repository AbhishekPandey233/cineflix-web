import { HttpError } from "../../../errors/http-error";

describe("HttpError", () => {
  it("sets statusCode and message", () => {
    const err = new HttpError(404, "Not found");

    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not found");
  });
});
