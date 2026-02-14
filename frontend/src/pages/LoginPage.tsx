import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowRight, ArrowLeft, ShieldCheck, Zap } from "lucide-react";
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
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* ═══ Animated mesh background ═══ */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-primary-300/20 rounded-full blur-3xl animate-morph" />
        <div className="absolute bottom-[-20%] left-[-15%] w-[600px] h-[600px] bg-accent-400/15 rounded-full blur-3xl animate-morph" style={{ animationDelay: "-4s" }} />
        <div className="absolute top-[20%] left-[60%] w-64 h-64 bg-primary-200/20 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-[30%] right-[70%] w-48 h-48 bg-accent-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "-3s" }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(139,92,246,0.04) 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />
      </div>

      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* ═══ Logo ═══ */}
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-[-8px] bg-primary-500/15 rounded-[28px] blur-xl animate-pulse-soft" />
            <div className="relative size-[76px] bg-linear-to-br from-primary-600 via-primary-500 to-accent-500 rounded-[22px] flex items-center justify-center shadow-2xl shadow-primary-500/30 animate-float">
              <Zap className="size-9 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -top-2 -right-2 size-7 bg-linear-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 ring-[3px] ring-white animate-bounce-in" style={{ animationDelay: "0.3s" }}>
              <span className="text-white text-[10px] font-black">✦</span>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="gradient-text">VenueBook</span>
          </h1>
          <p className="text-gray-400 mt-2.5 text-[15px] font-medium">Бронирование спортивных площадок</p>
        </div>

        {step === "phone" ? (
          <div className="animate-scale-in space-y-5" key="phone">
            <div className="relative bg-white/60 backdrop-blur-2xl rounded-[28px] p-7 shadow-2xl shadow-gray-900/[0.06] border border-white/70 shimmer-border">
              <div className="flex items-center gap-4 mb-7">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500/15 rounded-2xl blur-md" />
                  <div className="relative size-14 bg-linear-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                    <Phone className="size-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-lg">Вход в систему</h2>
                  <p className="text-sm text-gray-400 font-medium">Введите номер телефона</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 tracking-wide">Номер телефона</label>
                <div className="relative group">
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
                    className="w-full pl-13 pr-4 py-4.5 rounded-2xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-lg font-bold tracking-[0.15em] group-hover:border-gray-200"
                  />
                </div>
                {error && (
                  <p className="text-sm text-danger-500 mt-2.5 flex items-center gap-1.5 font-semibold animate-fade-in">
                    <span className="size-1.5 rounded-full bg-danger-500 inline-block animate-pulse" />
                    {error}
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handleSendOTP} loading={loading} className="w-full rounded-2xl! py-4.5! text-base! font-bold!" size="lg">
              Получить код
              <ArrowRight className="size-5" />
            </Button>
          </div>
        ) : (
          <div className="animate-scale-in space-y-5" key="otp">
            <div className="relative bg-white/60 backdrop-blur-2xl rounded-[28px] p-7 shadow-2xl shadow-gray-900/[0.06] border border-white/70 shimmer-border">
              <div className="flex items-center gap-4 mb-7">
                <div className="relative">
                  <div className="absolute inset-0 bg-success-500/15 rounded-2xl blur-md" />
                  <div className="relative size-14 bg-linear-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <ShieldCheck className="size-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-lg">Подтверждение</h2>
                  <p className="text-sm text-gray-400 font-medium">
                    Код отправлен на <span className="font-bold text-gray-600">{phone}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
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
                    className={`w-[52px] h-[60px] text-center text-2xl font-black rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500/10 ${
                      digit
                        ? "border-primary-400 bg-primary-50/70 text-primary-700 shadow-md shadow-primary-500/10 scale-105"
                        : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-danger-500 text-center mt-5 flex items-center justify-center gap-1.5 font-semibold animate-fade-in">
                  <span className="size-1.5 rounded-full bg-danger-500 inline-block animate-pulse" />
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="flex-1 rounded-2xl! py-4!"
                size="lg"
              >
                <ArrowLeft className="size-4" />
                Назад
              </Button>
              <Button
                onClick={() => handleVerifyOTP()}
                loading={loading}
                className="flex-1 rounded-2xl! py-4!"
                size="lg"
              >
                Войти
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-300 text-center font-medium">OTP-код в консоли сервера (dev)</p>
      </div>
    </div>
  );
}
