import type { AxiosError } from "axios";
import type { APIError } from "@/types";

const AUTH_ERROR_KEY_MAP: Record<string, string> = {
  user_already_registered: "login.error.userAlreadyRegistered",
  user_not_found: "login.error.userNotFound",
  invalid_credentials: "login.error.invalidCredentials",
  registration_not_completed: "login.error.registrationNotCompleted",
  registration_token_invalid_or_expired: "login.error.registrationTokenInvalid",
  reset_token_invalid_or_expired: "login.error.resetTokenInvalid",
  otp_invalid: "login.error.otpInvalid",
  otp_expired: "login.error.otpExpired",
  otp_rate_limit: "login.error.otpRateLimit",
  validation_error: "login.error.validation",
  server_error: "login.error.server",
};

export function getAuthErrorCode(err: unknown): string | undefined {
  const axiosErr = err as AxiosError<APIError>;
  return axiosErr.response?.data?.error?.code;
}

export function resolveAuthErrorMessage(
  err: unknown,
  translate: (key: string) => string,
  fallbackKey: string
): string {
  const axiosErr = err as AxiosError<APIError>;

  if (!axiosErr.response) {
    return translate("login.error.network");
  }

  const code = getAuthErrorCode(err);

  if (code && AUTH_ERROR_KEY_MAP[code]) {
    return translate(AUTH_ERROR_KEY_MAP[code]);
  }

  return axiosErr.response.data?.error?.message || translate(fallbackKey);
}
