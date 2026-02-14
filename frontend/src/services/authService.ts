import api from "./api";
import type {
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  User,
} from "@/types";

export const authService = {
  sendOTP: (data: SendOTPRequest) =>
    api.post<SendOTPResponse>("/auth/send-otp/", data),

  verifyOTP: (data: VerifyOTPRequest) =>
    api.post<VerifyOTPResponse>("/auth/verify-otp/", data),

  getProfile: () => api.get<User>("/auth/me/"),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>("/auth/me/", data),
};
