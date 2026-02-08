//user.service.ts
import bcryptjs from "bcryptjs";
import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } from "../config";

const userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(409, "Email already in use");
    }

    const usernameCheck = await userRepository.getUserByName(data.name);
    if (usernameCheck) {
      throw new HttpError(409, "Username already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, BCRYPT_SALT_ROUNDS);
    data.password = hashedPassword;

    const newUser = await userRepository.createUser(data);

    const userObj = (newUser as any).toObject ? (newUser as any).toObject() : newUser;
    delete (userObj as any).password;

    return userObj;
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    delete (userObj as any).password;

    return { token, user: userObj };
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) throw new HttpError(404, "User not found");

    const obj = (user as any).toObject ? (user as any).toObject() : user;
    delete (obj as any).password;
    return obj;
  }

  async updateProfile(requester: any, id: string, updateData: any) {
  // user can only update self unless admin
  const isAdmin = requester?.role === "admin";
  const isSelf = requester?.id === id;

  if (!isAdmin && !isSelf) throw new HttpError(403, "Forbidden");

  // Don’t allow role change from this endpoint unless admin
  if (!isAdmin) delete updateData.role;

  // If password present, hash it
  if (updateData.password) {
    updateData.password = await bcryptjs.hash(updateData.password, BCRYPT_SALT_ROUNDS);
  }

  const updated = await userRepository.updateUser(id, updateData);
  if (!updated) throw new HttpError(404, "User not found");

  const obj = (updated as any).toObject ? (updated as any).toObject() : updated;
  delete obj.password;

  return obj;
}

  async requestPasswordReset(email: string) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      return { token: null };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30);

    await userRepository.updateUser(user._id.toString(), {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: expires,
    });

    return { token: rawToken };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userRepository.getUserByResetToken(tokenHash);

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new HttpError(400, "Reset token is invalid or expired");
    }

    const isSamePassword = await bcryptjs.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new HttpError(400, "Old password entered");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await userRepository.updateUser(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    return true;
  }

}
