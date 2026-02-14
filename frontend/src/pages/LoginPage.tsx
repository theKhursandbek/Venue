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
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden bg-surface-950">
      {/* ═══ Ambient light effects ═══ */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-primary-500/6 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-80 h-80 bg-accent-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-4s" }} />
      </div>

      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* ═══ Logo ═══ */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-16 bg-primary-500 rounded-2xl mb-6 animate-float">
            <span className="text-surface-950 font-black text-2xl">V</span>
          </div>
          <h1 className="text-3xl font-bold text-surface-50 tracking-tight">
            Venue<span className="gradient-text">Book</span>
          </h1>
          <p className="text-surface-500 mt-2 text-sm">Бронирование спортивных площадок</p>
        </div>

        {step === "phone" ? (
          <div className="animate-scale-in space-y-5" key="phone">
            <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-11 bg-surface-800 border border-surface-600/50 rounded-xl flex items-center justify-center">
                  <Phone className="size-5 text-primary-400" />
                </div>
                <div>
                  <h2 className="font-bold text-surface-50 text-lg">Вход</h2>
                  <p className="text-sm text-surface-500">Введите номер телефона</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-surface-300">Номер телефона</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg select-none pointer-events-none">🇺🇿</div>
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
                    className="w-full pl-13 pr-4 py-4 rounded-xl border border-surface-600/50 bg-surface-800 text-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all text-lg font-bold tracking-[0.15em]"
                  />
                </div>
                {error && (
                  <p className="text-sm text-danger-400 mt-2 flex items-center gap-1.5 font-medium animate-fade-in">
                    <span className="size-1.5 rounded-full bg-danger-500 inline-block animate-pulse" />
                    {error}
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handleSendOTP} loading={loading} className="w-full py-4! text-base!" size="lg">
              Получить код
              <ArrowRight className="size-5" />
            </Button>
          </div>
        ) : (
          <div className="animate-scale-in space-y-5" key="otp">
            <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-11 bg-success-50 border border-success-500/20 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="size-5 text-success-400" />
                </div>
                <div>
                  <h2 className="font-bold text-surface-50 text-lg">Подтверждение</h2>
                  <p className="text-sm text-surface-500">
                    Код на <span className="font-bold text-surface-200">{phone}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 justify-center">
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
                    className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-surface-800 ${
                      digit
                        ? "border-primary-500/50 text-primary-300 shadow-lg shadow-primary-500/10"
                        : "border-surface-600/50 text-surface-100 hover:border-surface-500"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-danger-400 text-center mt-5 flex items-center justify-center gap-1.5 font-medium animate-fade-in">
                  <span className="size-1.5 rounded-full bg-danger-500 inline-block animate-pulse" />
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="flex-1 py-4!"
                size="lg"
              >
                <ArrowLeft className="size-4" />
                Назад
              </Button>
              <Button
                onClick={() => handleVerifyOTP()}
                loading={loading}
                className="flex-1 py-4!"
                size="lg"
              >
                Войти
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-surface-600 text-center">OTP-код в консоли сервера (dev)</p>
      </div>
    </div>
  );
}
