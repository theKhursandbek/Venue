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
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-surface-950">
      <div className="w-full max-w-xs space-y-6 animate-enter">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-50 tracking-tight">venue</h1>
          <p className="text-surface-500 mt-1 text-[12px]">Бронирование спортивных площадок</p>
        </div>

        {step === "phone" ? (
          <div className="animate-fade-in space-y-4" key="phone">
            <div>
              <label className="text-[12px] font-medium text-surface-400 mb-1.5 block">Номер телефона</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs select-none pointer-events-none">🇺🇿</span>
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
                  className="w-full pl-10 pr-3.5 py-3 rounded-lg bg-surface-850 text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-[15px] font-semibold tracking-widest border-none"
                />
              </div>
              {error && (
                <p className="text-[11px] text-danger-400 mt-2 font-medium animate-fade-in">{error}</p>
              )}
            </div>
            <Button onClick={handleSendOTP} loading={loading} className="w-full" size="lg">
              Получить код
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="animate-fade-in space-y-4" key="otp">
            <div className="text-center">
              <p className="text-[13px] text-surface-300">
                Код отправлен на <span className="font-semibold text-surface-100">{phone}</span>
              </p>
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
                  className={`w-10 h-12 text-center text-lg font-bold rounded-lg border-none bg-surface-850 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/25 ${
                    digit ? "text-primary-300" : "text-surface-200"
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-[11px] text-danger-400 text-center font-medium animate-fade-in">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="size-3" />
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
