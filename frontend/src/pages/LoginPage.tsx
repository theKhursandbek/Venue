import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
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

  // Auto-focus first OTP input
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
      setError(
        axiosErr.response?.data?.error?.message || "Ошибка отправки OTP"
      );
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
      const { data } = await authService.verifyOTP({
        phone_number: phone,
        otp: code,
      });
      login(data.access, data.refresh, data.user);
      toast.success("Вы вошли в систему!");
      navigate("/", { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      setError(
        axiosErr.response?.data?.error?.message || "Неверный OTP-код"
      );
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

    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (index === 5 && value) {
      const code = newOtp.join("");
      if (code.length === 6) {
        handleVerifyOTP();
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="size-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">VB</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">VenueBook</h1>
          <p className="text-gray-500 mt-1">Бронирование площадок</p>
        </div>

        {step === "phone" ? (
          /* Phone Step */
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Phone className="size-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Вход</h2>
                  <p className="text-sm text-gray-500">
                    Введите номер телефона
                  </p>
                </div>
              </div>

              <Input
                type="tel"
                placeholder="+998901234567"
                value={phone}
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.startsWith("+998")) val = "+998";
                  if (val.length <= 13) setPhone(val);
                }}
                error={error}
                autoFocus
              />
            </div>

            <Button
              onClick={handleSendOTP}
              loading={loading}
              className="w-full"
              size="lg"
            >
              Получить код
              <ArrowRight className="size-4" />
            </Button>
          </div>
        ) : (
          /* OTP Step */
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="size-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Подтверждение
                  </h2>
                  <p className="text-sm text-gray-500">
                    Код отправлен на {phone}
                  </p>
                </div>
              </div>

              {/* OTP inputs */}
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
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center mt-3">
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setStep("phone");
                  setOtp(["", "", "", "", "", ""]);
                  setError("");
                }}
                className="flex-1"
                size="lg"
              >
                <ArrowLeft className="size-4" />
                Назад
              </Button>
              <Button
                onClick={handleVerifyOTP}
                loading={loading}
                className="flex-1"
                size="lg"
              >
                Войти
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          OTP-код будет показан в консоли сервера (development)
        </p>
      </div>
    </div>
  );
}
