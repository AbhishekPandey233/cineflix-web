import { Request, Response } from "express";
import { MovieModel } from "../models/Movie";

export class MovieController {
  async getNowShowing(req: Request, res: Response) {
    try {
      const movies = await MovieModel.find({ status: "now-showing" })
        .sort({ score: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        data: movies,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getComingSoon(req: Request, res: Response) {
    try {
      const movies = await MovieModel.find({ status: "coming-soon" })
        .sort({ releaseDate: 1 })
        .lean();

      return res.status(200).json({
        success: true,
        data: movies,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllMovies(req: Request, res: Response) {
    try {
      const movies = await MovieModel.find()
        .sort({ status: 1, score: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        data: movies,
      });
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
        return res.status(404).json({
          success: false,
          message: "Movie not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: movie,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
