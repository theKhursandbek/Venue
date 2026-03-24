import { describe, expect, it } from "vitest";
import { validatePasswordConfirmation } from "@/utils/passwordValidation";

describe("validatePasswordConfirmation", () => {
  it("returns required error when confirmation is empty", () => {
    const result = validatePasswordConfirmation("password123", "");

    expect(result).toEqual({
      isValid: false,
      errorKey: "login.confirmPasswordRequired",
    });
  });

  it("returns mismatch error when passwords differ", () => {
    const result = validatePasswordConfirmation("password123", "password456");

    expect(result).toEqual({
      isValid: false,
      errorKey: "login.passwordsDoNotMatch",
    });
  });

  it("returns valid when passwords match", () => {
    const result = validatePasswordConfirmation("password123", "password123");

    expect(result).toEqual({ isValid: true });
  });
});
