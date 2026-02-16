import { z } from "zod";

const MovieStatusSchema = z.enum(["now-showing", "coming-soon"]);

const ReleaseDateSchema = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return val;
  },
  z.coerce.date().optional()
);

export const AdminCreateMovieDTO = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().min(1, "Genre is required"),
  rating: z.string().min(1, "Rating is required"),
  img: z.string().min(1, "Image URL is required"),
  year: z.coerce.number().int().min(1888, "Year is required"),
  score: z.coerce.number().min(0).max(10),
  duration: z.string().min(1, "Duration is required"),
  synopsis: z.string().min(1, "Synopsis is required"),
  language: z.string().min(1, "Language is required"),
  status: MovieStatusSchema,
  releaseDate: ReleaseDateSchema,
});

export type AdminCreateMovieDTO = z.infer<typeof AdminCreateMovieDTO>;

export const AdminUpdateMovieDTO = AdminCreateMovieDTO.partial();

export type AdminUpdateMovieDTO = z.infer<typeof AdminUpdateMovieDTO>;
