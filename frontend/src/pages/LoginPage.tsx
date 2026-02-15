import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, ShieldCheck, Sun, Moon, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";
import type { AxiosError } from "axios";
import type { APIError } from "@/types";

type Step = "phone" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+998");
  const { theme, toggle: toggleTheme } = useThemeStore();
  const { cycle, label } = useLanguageStore();
  const { t } = useTranslation();
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
      setError(t("login.phoneError"));
      return;
    }
    setLoading(true);
    try {
      await authService.sendOTP({ phone_number: phone });
      toast.success(t("login.otpSent"));
      setStep("otp");
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      setError(axiosErr.response?.data?.error?.message || t("login.otpSendError"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (fullCode?: string) => {
    const code = fullCode || otp.join("");
    if (code.length !== 6) {
      setError(t("login.otpCodeError"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await authService.verifyOTP({ phone_number: phone, otp: code });
      login(data.access, data.refresh, data.user);
      toast.success(t("login.welcome"));
      navigate("/", { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      setError(axiosErr.response?.data?.error?.message || t("login.otpInvalid"));
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
    <div className="min-h-dvh flex flex-col items-center justify-center px-3 relative">
      <div className="mesh-bg" />

      {/* Theme toggle & Language switcher */}
      <div className="absolute top-4 right-4 flex items-center gap-2 animate-slide-right">
        <button
          onClick={cycle}
          className="h-9 px-2.5 rounded-xl glass flex items-center justify-center text-[11px] font-bold text-surface-500 hover:text-surface-700 transition-all duration-300 active:scale-90 tracking-wide"
        >
          <Globe className="size-3.5 mr-1 opacity-50" />
          {label()}
        </button>
        <button
          onClick={toggleTheme}
          className="size-9 rounded-xl glass flex items-center justify-center text-surface-500 hover:text-surface-700 transition-all duration-300 active:scale-90 hover:rotate-12"
        >
          {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>
      </div>

      <div className="w-full max-w-sm animate-page-enter">
        {/* Hero logo section */}
        <div className="text-center mb-8 hero-section relative" data-scroll="scale">
          {/* Floating particles */}
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />

          {/* Animated logo with spinning ring */}
          <div className="relative inline-block mb-4">
            <div className="size-16 rounded-2xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/20 animate-levitate aurora-glow">
              <span className="text-white text-2xl font-black">V</span>
            </div>
            <div className="absolute -inset-3 hero-ring" />
          </div>

          <div className="hero-text-line">
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight gradient-text-animated">{t("login.brand")}</h1>
          </div>
          <div className="hero-text-line">
            <p className="text-surface-500 mt-1 text-[13px]">{t("login.subtitle")}</p>
          </div>
          <div className="hero-accent-line w-16 mx-auto mt-3" />
        </div>

        {/* Glass card */}
        <div className="glass rounded-2xl p-6 tilt-card aurora-glow shimmer-line" data-scroll="up" data-scroll-delay="150">
          {step === "phone" ? (
            <div className="animate-slide-left space-y-5" key="phone">
              <div>
                <label className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider mb-2 block">{t("login.phoneLabel")}</label>
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
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-100 border border-surface-300 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-[16px] font-semibold tracking-widest input-glow transition-all duration-300 focus:scale-[1.01]"
                  />
                </div>
                {error && (
                  <p className="text-[12px] text-danger-600 mt-2 font-medium animate-shake">{error}</p>
                )}
              </div>
              <div className="animate-bounce-in" style={{animationDelay: '200ms'}}>
                <Button onClick={handleSendOTP} loading={loading} className="w-full" size="lg">
                  {t("login.getCode")}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-slide-right space-y-5" key="otp">
              <div className="text-center">
                <div className="size-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-3 animate-bounce-in">
                  <ShieldCheck className="size-5 text-primary-500 animate-pendulum" />
                </div>
                <p className="text-[14px] text-surface-600 animate-fade-in" style={{animationDelay: '100ms'}}>
                  {t("login.codeSentTo")} <span className="font-bold text-surface-900">{phone}</span>
                </p>
              </div>

              <div className="flex gap-2.5 justify-center">
                {(["slot-1", "slot-2", "slot-3", "slot-4", "slot-5", "slot-6"] as const).map((slotId, i) => (
                  <input
                    key={slotId}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-11 h-13 text-center text-xl font-bold rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:scale-110 animate-bounce-in ${
                      otp[i]
                        ? "bg-primary-500/10 border-primary-500/30 text-primary-600"
                        : "bg-surface-100 border-surface-300 text-surface-800"
                    }`}
                    style={{animationDelay: `${i * 60}ms`}}
                  />
                ))}
              </div>

              {error && (
                <p className="text-[12px] text-danger-600 text-center font-medium animate-shake">{error}</p>
              )}

              <div className="flex gap-2 animate-slide-up" style={{animationDelay: '200ms'}}>
                <Button
                  variant="secondary"
                  onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                  className="flex-1"
                  size="lg"
                >
                  <ArrowLeft className="size-3.5" />
                  {t("login.back")}
                </Button>
                <Button
                  onClick={() => handleVerifyOTP()}
                  loading={loading}
                  className="flex-1"
                  size="lg"
                >
                  {t("login.signIn")}
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-surface-400 text-center mt-6" data-scroll="up" data-scroll-delay="300">{t("login.devOtpHint")}</p>
      </div>
    </div>
  );
}
