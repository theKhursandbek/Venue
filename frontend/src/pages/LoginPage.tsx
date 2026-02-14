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
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 bg-surface-950">
      <div className="w-full max-w-xs space-y-5 animate-enter">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-10 bg-primary-500 rounded-lg mb-3">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <h1 className="text-xl font-semibold text-surface-100 tracking-tight">
            Venue<span className="gradient-text">Book</span>
          </h1>
          <p className="text-surface-500 mt-0.5 text-[11px]">Бронирование спортивных площадок</p>
        </div>

        {step === "phone" ? (
          <div className="animate-fade-in space-y-3" key="phone">
            <div className="bg-surface-900 border border-surface-700/30 rounded-lg p-4 v-edge">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-7 bg-surface-800 border border-surface-700/30 rounded flex items-center justify-center">
                  <Phone className="size-3 text-primary-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-surface-100 text-[13px]">Вход</h2>
                  <p className="text-[11px] text-surface-500">Введите номер телефона</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-surface-400">Номер телефона</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs select-none pointer-events-none">🇺🇿</div>
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
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-surface-700/30 bg-surface-850 text-surface-100 focus:outline-none focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500/40 transition-colors text-[13px] font-semibold tracking-widest"
                  />
                </div>
                {error && (
                  <p className="text-[11px] text-danger-400 mt-1 flex items-center gap-1 font-medium animate-fade-in">
                    <span className="size-1 rounded-full bg-danger-500 inline-block" />
                    {error}
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handleSendOTP} loading={loading} className="w-full" size="lg">
              Получить код
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="animate-fade-in space-y-3" key="otp">
            <div className="bg-surface-900 border border-surface-700/30 rounded-lg p-4 v-edge">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-7 bg-success-50 border border-success-500/15 rounded flex items-center justify-center">
                  <ShieldCheck className="size-3 text-success-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-surface-100 text-[13px]">Подтверждение</h2>
                  <p className="text-[11px] text-surface-500">
                    Код на <span className="font-semibold text-surface-300">{phone}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-1.5 justify-center">
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
                    className={`w-9 h-10 text-center text-base font-bold rounded-md border transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-primary-500/30 bg-surface-850 ${
                      digit
                        ? "border-primary-500/40 text-primary-300"
                        : "border-surface-700/30 text-surface-200 hover:border-surface-600"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-[11px] text-danger-400 text-center mt-3 flex items-center justify-center gap-1 font-medium animate-fade-in">
                  <span className="size-1 rounded-full bg-danger-500 inline-block" />
                  {error}
                </p>
              )}
            </div>

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
