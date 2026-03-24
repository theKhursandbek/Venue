import api from "./api";
import type {
  AuthSuccessResponse,
  CompleteRegistrationRequest,
  LogoutRequest,
  LogoutResponse,
  PasswordResetConfirmRequest,
  PasswordResetVerifyResponse,
  PasswordLoginRequest,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  User,
} from "@/types";

export const authService = {
  registerSendOTP: (data: SendOTPRequest) =>
    api.post<SendOTPResponse>("/auth/send-otp/", data),

  registerVerifyOTP: (data: VerifyOTPRequest) =>
    api.post<VerifyOTPResponse>("/auth/verify-otp/", data),

  login: (data: PasswordLoginRequest) =>
    api.post<AuthSuccessResponse>("/auth/login/", data),

  completeRegistration: (data: CompleteRegistrationRequest) =>
    api.post<User>("/auth/complete-registration/", data),

  passwordResetSendOTP: (data: SendOTPRequest) =>
    api.post<SendOTPResponse>("/auth/password-reset/send-otp/", data),

  passwordResetVerifyOTP: (data: VerifyOTPRequest) =>
    api.post<PasswordResetVerifyResponse>("/auth/password-reset/verify-otp/", data),

  passwordResetConfirm: (data: PasswordResetConfirmRequest) =>
    api.post<LogoutResponse>("/auth/password-reset/confirm/", data),

  logout: (data: LogoutRequest) =>
    api.post<LogoutResponse>("/auth/logout/", data),

  getProfile: () => api.get<User>("/auth/me/"),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>("/auth/me/", data),
};
