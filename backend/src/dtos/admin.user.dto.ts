import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const AdminCreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  name: true,
  password: true,
  role: true,
  image: true,
});

export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

export const AdminUpdateUserDTO = UserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6).optional(), // allow password update if provided
});

export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;
