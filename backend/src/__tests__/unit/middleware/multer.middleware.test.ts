import { uploadMovieImage, uploadUserImage } from "../../../middleware/multer.middleware";

describe("multer.middleware", () => {
  it("uploadUserImage exposes single() middleware builder", () => {
    expect(typeof uploadUserImage.single).toBe("function");
  });

  it("uploadMovieImage exposes single() middleware builder", () => {
    expect(typeof uploadMovieImage.single).toBe("function");
  });

  it("single('image') returns express middleware function", () => {
    const middleware = uploadUserImage.single("image");
    expect(typeof middleware).toBe("function");
  });
});
