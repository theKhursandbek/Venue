import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import type { APIError } from "@/types";

export default function CompleteRegistrationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const registrationToken =
    new URLSearchParams(globalThis.location.search).get("registration_token") ?? "";

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const requiresRegistration = useAuthStore((s) => s.requiresRegistration);
  const markRegistrationCompleted = useAuthStore((s) => s.markRegistrationCompleted);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!requiresRegistration) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) {
      setError(t("login.completeNameRequired"));
      return;
    }

    if (password.length < 8) {
      setError(t("login.completePasswordMin"));
      return;
    }

    if (!registrationToken) {
      setError(t("login.registrationCompleteError"));
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.completeRegistration({
        registration_token: registrationToken,
        name: name.trim(),
        password,
      });
      markRegistrationCompleted(data);
      toast.success(t("login.registrationCompleted"));
      navigate("/", { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      setError(axiosErr.response?.data?.error?.message || t("login.registrationCompleteError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-3">
      <div className="w-full max-w-sm glass rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-surface-900">{t("login.completeTitle")}</h1>
        <p className="text-[13px] text-surface-500">{t("login.completeSubtitle")}</p>

        <Input
          label={t("login.completeNameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("login.completeNamePlaceholder")}
        />

        <Input
          label={t("login.completePasswordLabel")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("login.completePasswordPlaceholder")}
        />

        {error && <p className="text-[12px] text-danger-600">{error}</p>}

        <Button onClick={handleSubmit} loading={loading} className="w-full" size="lg">
          <User className="size-3.5" />
          {t("login.completeButton")}
          <Lock className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
