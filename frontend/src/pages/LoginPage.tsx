import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import type { AxiosError } from "axios";
import type { APIError } from "@/types";

type Step = "phone" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+998");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "otp") {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const handleSendOTP = async () => {
    setError("");
    if (phone.length !== 13) {
      setError("Введите полный номер (+998XXXXXXXXX)");
      return;
    }
    setLoading(true);
    try {
      await authService.sendOTP({ phone_number: phone });
      toast.success("OTP-код отправлен!");
      setStep("otp");
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      setError(axiosErr.response?.data?.error?.message || "Ошибка отправки OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (fullCode?: string) => {
    const code = fullCode || otp.join("");
    if (code.length !== 6) {
      setError("Введите 6-значный код");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await authService.verifyOTP({ phone_number: phone, otp: code });
      login(data.access, data.refresh, data.user);
      toast.success("Добро пожаловать!");
      navigate("/", { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      setError(axiosErr.response?.data?.error?.message || "Неверный OTP-код");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (index === 5 && value && newOtp.join("").length === 6) handleVerifyOTP(newOtp.join(""));
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 relative overflow-hidden bg-surface-950">
      {/* ═══ Ambient light orbs ═══ */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-30%] left-[-15%] w-80 h-80 bg-primary-500/[0.04] rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-[-20%] right-[-15%] w-64 h-64 bg-accent-500/[0.03] rounded-full blur-3xl animate-breathe" style={{ animationDelay: "-2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/[0.015] rounded-full blur-3xl animate-pulse-soft" />
      </div>

      <div className="w-full max-w-sm space-y-6 animate-entrance">
        {/* ═══ Logo ═══ */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl mb-4 shadow-lg shadow-primary-500/20 animate-float">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <h1 className="text-2xl font-semibold text-surface-100 tracking-tight">
            Venue<span className="gradient-text">Book</span>
          </h1>
          <p className="text-surface-500 mt-1 text-xs">Бронирование спортивных площадок</p>
        </div>

        {step === "phone" ? (
          <div className="animate-scale-in space-y-4" key="phone">
            <div className="bg-surface-900/80 border border-surface-700/30 rounded-xl p-5 inner-light backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="size-9 bg-surface-800 border border-surface-700/40 rounded-lg flex items-center justify-center">
                  <Phone className="size-4 text-primary-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-surface-100 text-sm">Вход</h2>
                  <p className="text-xs text-surface-500">Введите номер телефона</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-surface-400">Номер телефона</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm select-none pointer-events-none">🇺🇿</div>
                  <input
                    type="tel"
                    placeholder="+998901234567"
                    value={phone}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val.startsWith("+998")) val = "+998";
                      if (val.length <= 13) setPhone(val);
                    }}
                    autoFocus
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-lg border border-surface-700/40 bg-surface-850 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40 transition-all text-sm font-semibold tracking-widest"
                  />
                </div>
                {error && (
                  <p className="text-xs text-danger-400 mt-1.5 flex items-center gap-1 font-medium animate-fade-in">
                    <span className="size-1 rounded-full bg-danger-500 inline-block animate-pulse" />
                    {error}
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handleSendOTP} loading={loading} className="w-full" size="lg">
              Получить код
              <ArrowRight className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="animate-scale-in space-y-4" key="otp">
            <div className="bg-surface-900/80 border border-surface-700/30 rounded-xl p-5 inner-light backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="size-9 bg-success-50 border border-success-500/15 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="size-4 text-success-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-surface-100 text-sm">Подтверждение</h2>
                  <p className="text-xs text-surface-500">
                    Код на <span className="font-semibold text-surface-300">{phone}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-10 h-11 text-center text-lg font-bold rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-surface-850 ${
                      digit
                        ? "border-primary-500/40 text-primary-300 shadow-sm shadow-primary-500/10"
                        : "border-surface-700/40 text-surface-200 hover:border-surface-600"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-xs text-danger-400 text-center mt-4 flex items-center justify-center gap-1 font-medium animate-fade-in">
                  <span className="size-1 rounded-full bg-danger-500 inline-block animate-pulse" />
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-2.5">
              <Button
                variant="secondary"
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="size-3.5" />
                Назад
              </Button>
              <Button
                onClick={() => handleVerifyOTP()}
                loading={loading}
                className="flex-1"
                size="lg"
              >
                Войти
              </Button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-surface-600 text-center">OTP-код в консоли сервера (dev)</p>
      </div>
    </div>
  );
}
