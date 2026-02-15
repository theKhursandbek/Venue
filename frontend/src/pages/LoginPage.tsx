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
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 relative">
      <div className="mesh-bg" />

      <div className="w-full max-w-sm animate-enter">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/20 animate-float">
            <span className="text-white text-2xl font-black">V</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-50 tracking-tight">Venue</h1>
          <p className="text-surface-400 mt-1 text-[13px]">Бронирование спортивных площадок</p>
        </div>

        {/* Glass card */}
        <div className="glass rounded-2xl p-6">
          {step === "phone" ? (
            <div className="animate-fade-in space-y-5" key="phone">
              <div>
                <label className="text-[12px] font-semibold text-surface-300 uppercase tracking-wider mb-2 block">Номер телефона</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm select-none pointer-events-none">🇺🇿</span>
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
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-800/50 border border-surface-700/30 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-[16px] font-semibold tracking-widest"
                  />
                </div>
                {error && (
                  <p className="text-[12px] text-danger-400 mt-2 font-medium animate-fade-in">{error}</p>
                )}
              </div>
              <Button onClick={handleSendOTP} loading={loading} className="w-full" size="lg">
                Получить код
                <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="animate-fade-in space-y-5" key="otp">
              <div className="text-center">
                <div className="size-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="size-5 text-primary-400" />
                </div>
                <p className="text-[14px] text-surface-200">
                  Код отправлен на <span className="font-bold text-surface-50">{phone}</span>
                </p>
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
                    className={`w-11 h-13 text-center text-xl font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${
                      digit
                        ? "bg-primary-500/10 border-primary-500/30 text-primary-300"
                        : "bg-surface-800/50 border-surface-700/30 text-surface-200"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-[12px] text-danger-400 text-center font-medium animate-fade-in">{error}</p>
              )}

              <div className="flex gap-2">
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
        </div>

        <p className="text-[11px] text-surface-600 text-center mt-6">OTP-код в консоли сервера (dev)</p>
      </div>
    </div>
  );
}
