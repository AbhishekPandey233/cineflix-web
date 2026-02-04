import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";

export type AuthUserPayload = {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | null = null;
    const header = req.headers.authorization;

    if (header && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    } else if (req.headers.cookie) {
      // support token via cookie (from browser)
      const cookies = String(req.headers.cookie).split(";").map(c => c.trim());
      const tokenCookie = cookies.find(c => c.startsWith("token="));
      if (tokenCookie) token = decodeURIComponent(tokenCookie.split("=").slice(1).join("="));
    }

    if (!token) return next(new HttpError(401, "Unauthorized"));

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;

    (req as any).user = decoded;
    next();
  } catch {
    next(new HttpError(401, "Unauthorized"));
  }
};
