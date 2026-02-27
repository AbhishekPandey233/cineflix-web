import { BookingModel } from "../../../models/Booking";
import { MovieModel } from "../../../models/Movie";
import { ShowtimeModel } from "../../../models/Showtime";
import { UserModel } from "../../../models/user.model";

describe("model schemas", () => {
  it("BookingModel sets default status and paymentStatus", () => {
    const doc = new BookingModel({
      showtimeId: "507f191e810c19729de860ea",
      seats: ["A1"],
      totalPrice: 200,
    });

    expect(doc.status).toBe("confirmed");
    expect(doc.paymentStatus).toBe("unpaid");
  });

  it("UserModel sets default role to user", () => {
    const doc = new UserModel({
      name: "user-model-test",
      email: "user-model-test@example.com",
      password: "password123",
    });

    expect(doc.role).toBe("user");
  });

  it("MovieModel validation fails when required fields missing", () => {
    const doc = new MovieModel({});
    const err = doc.validateSync();

    expect(err).toBeDefined();
    expect(err?.errors.title).toBeDefined();
  });

  it("ShowtimeModel default price is 0", () => {
    const doc = new ShowtimeModel({
      movieId: "507f191e810c19729de860ea",
      hallId: "A",
      hallName: "Hall A",
      startTime: new Date(),
    });

    expect(doc.price).toBe(0);
  });
});
