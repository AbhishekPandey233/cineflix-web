import { UserRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../models/user.model";

describe("user.repository", () => {
  const repo = new UserRepository();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("getUserByEmail calls UserModel.findOne with email", async () => {
    const findOneSpy = jest.spyOn(UserModel, "findOne").mockResolvedValue({ _id: "u1" } as any);

    const result = await repo.getUserByEmail("repo@example.com");

    expect(findOneSpy).toHaveBeenCalledWith({ email: "repo@example.com" });
    expect(result).toEqual({ _id: "u1" });
  });

  it("deleteUser returns true when document is deleted", async () => {
    jest.spyOn(UserModel, "findByIdAndDelete").mockResolvedValue({ _id: "u1" } as any);

    const result = await repo.deleteUser("u1");

    expect(result).toBe(true);
  });
});
