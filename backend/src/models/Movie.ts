import mongoose, { Document, Schema } from "mongoose";

export interface IMovie extends Document {
  title: string;
  genre: string;
  rating: string;
  img: string;
  year: number;
  score: number;
  duration: string;
  synopsis: string;
  language: string;
  status: "now-showing" | "coming-soon";
  releaseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema: Schema = new Schema<IMovie>(
  {
    title: { type: String, required: true, unique: true },
    genre: { type: String, required: true },
    rating: { type: String, required: true },
    img: { type: String, required: true },
    year: { type: Number, required: true },
    score: { type: Number, required: true },
    duration: { type: String, required: true },
    synopsis: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, enum: ["now-showing", "coming-soon"], default: "now-showing" },
    releaseDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const MovieModel = mongoose.model<IMovie>("Movie", MovieSchema);
