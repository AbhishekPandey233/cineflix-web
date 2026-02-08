import axios, { AxiosError } from "axios";
import axiosInstance from "./axios";
import { API } from "./endpoints";

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";

  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    resetToken?: string;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const registerUser = async (data: RegisterFormData): Promise<RegisterResponse> => {
  try {
    const res = await axiosInstance.post<RegisterResponse>(API.AUTH.REGISTER, data);
    return res.data;
  } catch (err: unknown) {
    let message = "Registration failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const loginUser = async (data: LoginFormData): Promise<LoginResponse> => {
  try {
    const res = await axiosInstance.post<LoginResponse>(API.AUTH.LOGIN, data);
    return res.data;
  } catch (err: unknown) {
    let message = "Login failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const forgotPassword = async (data: ForgotPasswordFormData): Promise<ForgotPasswordResponse> => {
  try {
    const res = await axiosInstance.post<ForgotPasswordResponse>(API.AUTH.FORGOT_PASSWORD, data);
    return res.data;
  } catch (err: unknown) {
    let message = "Request failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const resetPassword = async (data: ResetPasswordFormData): Promise<ResetPasswordResponse> => {
  try {
    const res = await axiosInstance.post<ResetPasswordResponse>(API.AUTH.RESET_PASSWORD, data);
    return res.data;
  } catch (err: unknown) {
    let message = "Reset failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};