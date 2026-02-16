import { Request, Response } from "express";
import { AdminCreateShowtimeDTO, AdminUpdateShowtimeDTO } from "../dtos/admin.showtime.dto";
import { MovieModel } from "../models/Movie";
import { HallId, ShowtimeModel } from "../models/Showtime";

const HALL_NAME_BY_ID: Record<HallId, "Hall A" | "Hall B"> = {
  A: "Hall A",
  B: "Hall B",
};

export class AdminShowtimeController {
  async getShowtimesByMovie(req: Request, res: Response) {
    try {
      const movieId = String(req.params.movieId);
      const showtimes = await ShowtimeModel.find({ movieId }).sort({ startTime: 1 }).lean();
      return res.status(200).json({ success: true, data: showtimes });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async createShowtime(req: Request, res: Response) {
    try {
      const parsed = AdminCreateShowtimeDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsed.error,
        });
      }

      const data = parsed.data;
      const movie = await MovieModel.findById(data.movieId).lean();
      if (!movie) {
        return res.status(404).json({ success: false, message: "Movie not found" });
      }

      const created = await ShowtimeModel.create({
        movieId: data.movieId,
        hallId: data.hallId,
        hallName: HALL_NAME_BY_ID[data.hallId],
        startTime: data.startTime,
        price: data.price,
      });

      return res.status(201).json({
        success: true,
        message: "Showtime created",
        data: created,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateShowtime(req: Request, res: Response) {
    try {
      const parsed = AdminUpdateShowtimeDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsed.error,
        });
      }

      const id = req.params.id;
      const update = parsed.data as Record<string, unknown> & { hallId?: HallId };

      if (update.movieId) {
        const movie = await MovieModel.findById(update.movieId).lean();
        if (!movie) {
          return res.status(404).json({ success: false, message: "Movie not found" });
        }
      }

      if (update.hallId) {
        update.hallName = HALL_NAME_BY_ID[update.hallId];
      }

      const updated = await ShowtimeModel.findByIdAndUpdate(id, update, { new: true }).lean();
      if (!updated) {
        return res.status(404).json({ success: false, message: "Showtime not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Showtime updated",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteShowtime(req: Request, res: Response) {
    try {
      const deleted = await ShowtimeModel.findByIdAndDelete(req.params.id).lean();
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Showtime not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Showtime deleted",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
