import { z } from "zod";

const HallIdSchema = z.enum(["A", "B"]);

export const AdminCreateShowtimeDTO = z.object({
  movieId: z.string().min(1, "movieId is required"),
  hallId: HallIdSchema,
  startTime: z.coerce.date(),
  price: z.coerce.number().min(0).default(0),
});

export type AdminCreateShowtimeDTO = z.infer<typeof AdminCreateShowtimeDTO>;

export const AdminUpdateShowtimeDTO = z.object({
  movieId: z.string().min(1).optional(),
  hallId: HallIdSchema.optional(),
  startTime: z.coerce.date().optional(),
  price: z.coerce.number().min(0).optional(),
});

export type AdminUpdateShowtimeDTO = z.infer<typeof AdminUpdateShowtimeDTO>;
