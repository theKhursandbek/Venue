export type PasswordValidationErrorKey =
  | "login.confirmPasswordRequired"
  | "login.passwordsDoNotMatch";

export interface PasswordValidationResult {
  isValid: boolean;
  errorKey?: PasswordValidationErrorKey;
}

export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): PasswordValidationResult {
  if (!confirmPassword.trim()) {
    return {
      isValid: false,
      errorKey: "login.confirmPasswordRequired",
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      errorKey: "login.passwordsDoNotMatch",
    };
  }

  return { isValid: true };
}
