import type { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { getAuthErrorCode, resolveAuthErrorMessage } from "@/utils/authError";
import type { APIError } from "@/types";

const t = (key: string) => `__${key}__`;

describe("resolveAuthErrorMessage", () => {
  it("returns mapped key when code is known", () => {
    const err = {
      response: {
        data: {
          error: {
            code: "user_already_registered",
            message: "User already registered. Please log in.",
          },
        },
      },
    } as AxiosError<APIError>;

    expect(resolveAuthErrorMessage(err, t, "login.otpSendError")).toBe(
      "__login.error.userAlreadyRegistered__"
    );
  });

  it("returns network key when response is missing", () => {
    const err = {} as AxiosError<APIError>;

    expect(resolveAuthErrorMessage(err, t, "login.otpSendError")).toBe(
      "__login.error.network__"
    );
  });

  it("falls back to backend message for unknown code", () => {
    const err = {
      response: {
        data: {
          error: {
            code: "unknown_code",
            message: "Something custom happened",
          },
        },
      },
    } as AxiosError<APIError>;

    expect(resolveAuthErrorMessage(err, t, "login.otpSendError")).toBe(
      "Something custom happened"
    );
  });
});

describe("getAuthErrorCode", () => {
  it("returns code when backend response contains it", () => {
    const err = {
      response: {
        data: {
          error: {
            code: "user_already_registered",
            message: "User already registered. Please log in.",
          },
        },
      },
    } as AxiosError<APIError>;

    expect(getAuthErrorCode(err)).toBe("user_already_registered");
  });

  it("returns undefined when response is absent", () => {
    const err = {} as AxiosError<APIError>;

    expect(getAuthErrorCode(err)).toBeUndefined();
  });
});
