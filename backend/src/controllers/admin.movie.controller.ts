import { Request, Response } from "express";
import { AdminCreateMovieDTO, AdminUpdateMovieDTO } from "../dtos/admin.movie.dto";
import { MovieModel } from "../models/Movie";
import { ShowtimeModel } from "../models/Showtime";

export class AdminMovieController {
  async createMovie(req: Request, res: Response) {
    try {
      const imagePath = (req as any).file?.filename
        ? `/uploads/movies/${(req as any).file.filename}`
        : undefined;

      const payload = {
        ...req.body,
        img: imagePath ?? req.body?.img,
      };

      const parsed = AdminCreateMovieDTO.safeParse(payload);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsed.error,
        });
      }

      const data = parsed.data;
      const existing = await MovieModel.findOne({ title: data.title }).lean();
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Movie title already exists",
        });
      }

      const created = await MovieModel.create(data);
      return res.status(201).json({
        success: true,
        message: "Movie created",
        data: created,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMovies(_req: Request, res: Response) {
    try {
      const movies = await MovieModel.find().sort({ status: 1, score: -1 }).lean();
      return res.status(200).json({ success: true, data: movies });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMovieById(req: Request, res: Response) {
    try {
      const movie = await MovieModel.findById(req.params.id).lean();
      if (!movie) {
        return res.status(404).json({ success: false, message: "Movie not found" });
      }
      return res.status(200).json({ success: true, data: movie });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateMovie(req: Request, res: Response) {
    try {
      const imagePath = (req as any).file?.filename
        ? `/uploads/movies/${(req as any).file.filename}`
        : undefined;

      const payload = {
        ...req.body,
        ...(imagePath ? { img: imagePath } : {}),
      };

      const parsed = AdminUpdateMovieDTO.safeParse(payload);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsed.error,
        });
      }

      const update = parsed.data as Record<string, unknown>;
      const id = req.params.id;

      if (update.title) {
        const existing = await MovieModel.findOne({ title: update.title, _id: { $ne: id } }).lean();
        if (existing) {
          return res.status(409).json({
            success: false,
            message: "Movie title already exists",
          });
        }
      }

      const wantsClearReleaseDate =
        Object.prototype.hasOwnProperty.call(req.body, "releaseDate") &&
        (req.body.releaseDate === "" || req.body.releaseDate === null);

      const updateDoc: any = { ...update };
      if (wantsClearReleaseDate) {
        delete updateDoc.releaseDate;
        updateDoc.$unset = { releaseDate: "" };
      }

      const updated = await MovieModel.findByIdAndUpdate(id, updateDoc, { new: true }).lean();
      if (!updated) {
        return res.status(404).json({ success: false, message: "Movie not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Movie updated",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteMovie(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const deleted = await MovieModel.findByIdAndDelete(id).lean();
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Movie not found" });
      }

      await ShowtimeModel.deleteMany({ movieId: id });

      return res.status(200).json({
        success: true,
        message: "Movie deleted",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
