//auth.controller.ts
import { UserService } from "../services/user.service";
import { CreateUserDTO, ForgotPasswordDTO, LoginUserDTO, ResetPasswordDTO } from "../dtos/user.dto";
import { Request, Response } from "express";

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      
      console.log("REGISTER CT:", req.headers["content-type"]);
      console.log("REGISTER BODY:", req.body);

      const parsedData = CreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const newUser = await userService.createUser(parsedData.data);

      return res.status(201).json({
        success: true,
        message: "User Created",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      
      console.log("LOGIN CT:", req.headers["content-type"]);
      console.log("LOGIN BODY:", req.body);

      const parsedData = LoginUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const { token, user } = await userService.loginUser(parsedData.data);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const requester = (req as any).user;
      const user = await userService.getUserById(requester.id);
      return res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      // Clear cookies set by login
      res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" });
      res.clearCookie("user", { path: "/" });
      res.clearCookie("role", { path: "/" });

      return res.status(200).json({ success: true, message: "Logged out" });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const parsedData = ForgotPasswordDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const { token } = await userService.requestPasswordReset(parsedData.data.email);

      return res.status(200).json({
        success: true,
        message: "If an account exists, a reset token has been generated",
        data: token ? { resetToken: token } : undefined,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const parsedData = ResetPasswordDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      await userService.resetPassword(parsedData.data.token, parsedData.data.password);

      return res.status(200).json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
  try {
    const requester = (req as any).user;

    const update: any = { ...req.body };

    if ((req as any).file?.filename) {
      update.image = `/uploads/users/${(req as any).file.filename}`;
    }

    const updated = await userService.updateProfile(requester, req.params.id, update);

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: updated,
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}


}
