import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowRight, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
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

  const handleVerifyOTP = async () => {
    const code = otp.join("");
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
    if (index === 5 && value && newOtp.join("").length === 6) handleVerifyOTP();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-primary-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-15%] w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute top-[30%] left-[50%] w-48 h-48 bg-pink-200/20 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="relative inline-block mb-5">
            <div className="size-20 bg-linear-to-br from-primary-500 via-primary-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-primary-500/30 animate-float">
              <Sparkles className="size-9 text-white drop-shadow-md" />
            </div>
            <div className="absolute -top-1 -right-1 size-6 bg-linear-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
              <span className="text-white text-[10px] font-bold">✦</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold gradient-text tracking-tight">VenueBook</h1>
          <p className="text-gray-500 mt-2 text-[15px]">Бронирование спортивных площадок</p>
        </div>

        {step === "phone" ? (
          <div className="animate-scale-in space-y-5" key="phone">
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 shadow-xl shadow-gray-900/4 border border-white/60">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="size-12 bg-linear-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <Phone className="size-5.5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-[17px]">Вход в систему</h2>
                  <p className="text-sm text-gray-500">Введите номер телефона</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Номер телефона</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base select-none pointer-events-none">🇺🇿</div>
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
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-[17px] font-semibold tracking-wider"
                  />
                </div>
                {error && (
                  <p className="text-sm text-danger-600 mt-2 flex items-center gap-1.5 font-medium">
                    <span className="size-1.5 rounded-full bg-danger-500 inline-block" />
                    {error}
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handleSendOTP} loading={loading} className="w-full rounded-2xl! py-4! text-[15px]!" size="lg">
              Получить код
              <ArrowRight className="size-5" />
            </Button>
          </div>
        ) : (
          <div className="animate-scale-in space-y-5" key="otp">
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 shadow-xl shadow-gray-900/4 border border-white/60">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="size-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <ShieldCheck className="size-5.5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-[17px]">Подтверждение</h2>
                  <p className="text-sm text-gray-500">
                    Код отправлен на <span className="font-semibold text-gray-700">{phone}</span>
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
                    className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border-2 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all ${
                      digit ? "border-primary-400 bg-primary-50/60 shadow-sm shadow-primary-500/10" : "border-gray-100"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-danger-600 text-center mt-4 flex items-center justify-center gap-1.5 font-medium">
                  <span className="size-1.5 rounded-full bg-danger-500 inline-block" />
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="flex-1 rounded-2xl! py-3.5!"
                size="lg"
              >
                <ArrowLeft className="size-4" />
                Назад
              </Button>
              <Button
                onClick={handleVerifyOTP}
                loading={loading}
                className="flex-1 rounded-2xl! py-3.5!"
                size="lg"
              >
                Войти
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">OTP-код в консоли сервера (dev)</p>
      </div>
    </div>
  );
}
