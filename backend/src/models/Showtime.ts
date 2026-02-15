import mongoose, { Document, Schema } from "mongoose";

export type HallId = "A" | "B";

export interface IShowtime extends Document {
  movieId: mongoose.Types.ObjectId;
  hallId: HallId;
  hallName: "Hall A" | "Hall B";
  startTime: Date;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const ShowtimeSchema = new Schema<IShowtime>(
  {
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
    hallId: { type: String, enum: ["A", "B"], required: true },
    hallName: { type: String, enum: ["Hall A", "Hall B"], required: true },
    startTime: { type: Date, required: true },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ShowtimeSchema.index({ movieId: 1, startTime: 1 });

export const ShowtimeModel = mongoose.model<IShowtime>("Showtime", ShowtimeSchema);
