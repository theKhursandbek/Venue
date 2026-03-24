import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sun, Moon, Globe, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";
import { getAuthErrorCode, resolveAuthErrorMessage } from "@/utils/authError";
import { validatePasswordConfirmation } from "@/utils/passwordValidation";

type AuthView = "login" | "register" | "reset";
type RegisterStep = "phone" | "otp" | "complete";
type ResetStep = "phone" | "otp" | "new-password";

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  showAriaLabel: string;
  hideAriaLabel: string;
  name: string;
  autoComplete: string;
  inputClassName: string;
}

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  isVisible,
  onToggleVisibility,
  showAriaLabel,
  hideAriaLabel,
  name,
  autoComplete,
  inputClassName,
}: Readonly<PasswordFieldProps>) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider mb-2 block">
        {label}
      </label>
      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          name={name}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={isVisible ? hideAriaLabel : showAriaLabel}
          className="absolute inset-y-0 right-0 px-3 text-surface-500 hover:text-surface-700 transition-colors"
        >
          {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const { theme, toggle: toggleTheme } = useThemeStore();
  const { cycle, label } = useLanguageStore();

  const [view, setView] = useState<AuthView>("login");

  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerStep, setRegisterStep] = useState<RegisterStep>("phone");
  const [registrationToken, setRegistrationToken] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const [resetStep, setResetStep] = useState<ResetStep>("phone");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const otpActive =
      (view === "register" && registerStep === "otp") ||
      (view === "reset" && resetStep === "otp");
    if (otpActive) {
      otpRefs.current[0]?.focus();
    }
  }, [view, registerStep, resetStep]);

  const normalizePhoneValid = () => phone.length === 13;
  const otpCode = otp.join("");

  const resetOtpInputs = () => setOtp(["", "", "", "", "", ""]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!normalizePhoneValid()) {
      setError(t("login.phoneError"));
      return;
    }
    if (!password) {
      setError(t("login.passwordRequired"));
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.login({ phone_number: phone, password });
      login(data.access, data.refresh, data.user, false);
      toast.success(t("login.welcome"));
      navigate("/", { replace: true });
    } catch (err) {
      setError(resolveAuthErrorMessage(err, t, "login.passwordLoginError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSendOtp = async () => {
    setError("");
    if (!normalizePhoneValid()) {
      setError(t("login.phoneError"));
      return;
    }

    setLoading(true);
    try {
      await authService.registerSendOTP({ phone_number: phone });
      toast.success(t("login.otpSent"));
      resetOtpInputs();
      setRegisterStep("otp");
    } catch (err) {
      if (getAuthErrorCode(err) === "user_already_registered") {
        setView("login");
        setRegisterStep("phone");
        resetOtpInputs();
      }
      setError(resolveAuthErrorMessage(err, t, "login.otpSendError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVerifyOtp = async () => {
    setError("");
    if (otpCode.length !== 6) {
      setError(t("login.otpCodeError"));
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.registerVerifyOTP({
        phone_number: phone,
        otp: otpCode,
      });
      setRegistrationToken(data.registration_token);
      setRegisterStep("complete");
      toast.success(t("login.otpVerified"));
    } catch (err) {
      setError(resolveAuthErrorMessage(err, t, "login.otpInvalid"));
      resetOtpInputs();
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterComplete = async () => {
    setError("");
    if (!registerName.trim()) {
      setError(t("login.completeNameRequired"));
      return;
    }
    if (registerPassword.length < 8) {
      setError(t("login.completePasswordMin"));
      return;
    }

    const registerValidation = validatePasswordConfirmation(
      registerPassword,
      registerConfirmPassword
    );
    if (!registerValidation.isValid && registerValidation.errorKey) {
      setError(t(registerValidation.errorKey));
      return;
    }

    setLoading(true);
    try {
      await authService.completeRegistration({
        registration_token: registrationToken,
        name: registerName.trim(),
        password: registerPassword,
      });
      toast.success(t("login.registrationCompleted"));
      setView("login");
      setRegisterStep("phone");
      setRegisterName("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      setRegistrationToken("");
      resetOtpInputs();
    } catch (err) {
      setError(resolveAuthErrorMessage(err, t, "login.registrationCompleteError"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetSendOtp = async () => {
    setError("");
    if (!normalizePhoneValid()) {
      setError(t("login.phoneError"));
      return;
    }

    setLoading(true);
    try {
      await authService.passwordResetSendOTP({ phone_number: phone });
      toast.success(t("login.otpSent"));
      resetOtpInputs();
      setResetStep("otp");
    } catch (err) {
      setError(resolveAuthErrorMessage(err, t, "login.otpSendError"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetVerifyOtp = async () => {
    setError("");
    if (otpCode.length !== 6) {
      setError(t("login.otpCodeError"));
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.passwordResetVerifyOTP({
        phone_number: phone,
        otp: otpCode,
      });
      setResetToken(data.reset_token);
      setResetStep("new-password");
      toast.success(t("login.otpVerified"));
    } catch (err) {
      setError(resolveAuthErrorMessage(err, t, "login.otpInvalid"));
      resetOtpInputs();
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async () => {
    setError("");
    if (newPassword.length < 8) {
      setError(t("login.completePasswordMin"));
      return;
    }

    const resetValidation = validatePasswordConfirmation(newPassword, confirmNewPassword);
    if (!resetValidation.isValid && resetValidation.errorKey) {
      setError(t(resetValidation.errorKey));
      return;
    }

    setLoading(true);
    try {
      await authService.passwordResetConfirm({
        reset_token: resetToken,
        new_password: newPassword,
      });
      toast.success(t("login.passwordResetSuccess"));
      setView("login");
      setResetStep("phone");
      setNewPassword("");
      setConfirmNewPassword("");
      setResetToken("");
      resetOtpInputs();
    } catch (err) {
      setError(resolveAuthErrorMessage(err, t, "login.passwordResetError"));
    } finally {
      setLoading(false);
    }
  };

  const switchView = (next: AuthView) => {
    setView(next);
    setError("");
    setPassword("");
    resetOtpInputs();
    setRegisterStep("phone");
    setRegisterConfirmPassword("");
    setResetStep("phone");
    setConfirmNewPassword("");
  };

  return (
    <div className="min-h-dvh relative isolate flex flex-col items-center justify-start px-3 pt-6 pb-6 overflow-x-hidden overflow-y-auto">
      <div className="mesh-bg pointer-events-none" />

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 animate-slide-right">
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

      <div className="relative z-10 w-full max-w-sm animate-page-enter mt-2">
        <div className="text-center pt-4 mb-5 hero-section relative" data-scroll="scale">
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />
          <div className="hero-particle" />

          <div className="relative inline-block mb-4">
            <div className="size-16 rounded-2xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/20 animate-levitate aurora-glow">
              <span className="text-white text-2xl font-black">V</span>
            </div>
            <div className="absolute -inset-3 hero-ring" />
          </div>

          <div className="hero-text-line">
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight gradient-text-animated">
              {t("login.brand")}
            </h1>
          </div>
          <div className="hero-text-line">
            <p className="text-surface-500 mt-1 text-[13px]">{t("login.subtitle")}</p>
          </div>
          <div className="hero-accent-line w-16 mx-auto mt-3" />
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => switchView("login")}
              className={`h-10 rounded-xl text-[12px] font-semibold transition-all ${
                view === "login" ? "bg-primary-500 text-white" : "glass text-surface-600"
              }`}
            >
              {t("login.signIn")}
            </button>
            <button
              onClick={() => switchView("register")}
              className={`h-10 rounded-xl text-[12px] font-semibold transition-all ${
                view === "register" ? "bg-primary-500 text-white" : "glass text-surface-600"
              }`}
            >
              {t("login.register")}
            </button>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider mb-2 block">
              {t("login.phoneLabel")}
            </label>
            <input
              type="tel"
              placeholder="+998901234567"
              value={phone}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.startsWith("+998")) val = "+998";
                if (val.length <= 13) setPhone(val);
              }}
              className="w-full px-4 py-3.5 rounded-xl bg-surface-100 border border-surface-300 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-[16px] font-semibold tracking-widest input-glow"
            />
          </div>

          {view === "login" && (
            <>
              <PasswordField
                label={t("login.passwordLabel")}
                placeholder={t("login.passwordPlaceholder")}
                value={password}
                onChange={setPassword}
                isVisible={showLoginPassword}
                onToggleVisibility={() => setShowLoginPassword((prev) => !prev)}
                showAriaLabel={t("login.showPassword")}
                hideAriaLabel={t("login.hidePassword")}
                name="login-password"
                autoComplete="current-password"
                inputClassName="w-full px-4 pr-12 py-3.5 rounded-xl bg-surface-100 border border-surface-300 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-[14px] input-glow"
              />

              <button
                onClick={() => switchView("reset")}
                className="text-[12px] text-primary-600 font-semibold"
              >
                {t("login.forgotPassword")}
              </button>

              <Button onClick={handleLogin} loading={loading} className="w-full" size="lg">
                {t("login.signIn")}
                <ArrowRight className="size-4" />
              </Button>
            </>
          )}

          {view === "register" && registerStep === "phone" && (
            <Button onClick={handleRegisterSendOtp} loading={loading} className="w-full" size="lg">
              {t("login.getCode")}
              <ArrowRight className="size-4" />
            </Button>
          )}

          {view === "register" && registerStep === "otp" && (
            <>
              <p className="text-[13px] text-surface-600">{t("login.codeSentTo")} {phone}</p>
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
                    className="w-11 h-13 text-center text-xl font-bold rounded-xl border bg-surface-100 border-surface-300 text-surface-800"
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setRegisterStep("phone")}
                  className="flex-1"
                  size="lg"
                >
                  <ArrowLeft className="size-3.5" />
                  {t("login.back")}
                </Button>
                <Button onClick={handleRegisterVerifyOtp} loading={loading} className="flex-1" size="lg">
                  {t("login.verify")}
                </Button>
              </div>
            </>
          )}

          {view === "register" && registerStep === "complete" && (
            <>
              <div>
                <label className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider mb-2 block">
                  {t("login.completeNameLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("login.completeNamePlaceholder")}
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-surface-100 border border-surface-300 text-surface-900"
                />
              </div>
              <PasswordField
                label={t("login.completePasswordLabel")}
                placeholder={t("login.completePasswordPlaceholder")}
                value={registerPassword}
                onChange={setRegisterPassword}
                isVisible={showRegisterPassword}
                onToggleVisibility={() => setShowRegisterPassword((prev) => !prev)}
                showAriaLabel={t("login.showPassword")}
                hideAriaLabel={t("login.hidePassword")}
                name="register-password"
                autoComplete="new-password"
                inputClassName="w-full px-4 pr-12 py-3.5 rounded-xl bg-surface-100 border border-surface-300 text-surface-900"
              />
              <PasswordField
                label={t("login.confirmPasswordLabel")}
                placeholder={t("login.confirmPasswordPlaceholder")}
                value={registerConfirmPassword}
                onChange={setRegisterConfirmPassword}
                isVisible={showRegisterConfirmPassword}
                onToggleVisibility={() => setShowRegisterConfirmPassword((prev) => !prev)}
                showAriaLabel={t("login.showPassword")}
                hideAriaLabel={t("login.hidePassword")}
                name="register-confirm-password"
                autoComplete="new-password"
                inputClassName="w-full px-4 pr-12 py-3.5 rounded-xl bg-surface-100 border border-surface-300 text-surface-900"
              />
              <Button onClick={handleRegisterComplete} loading={loading} className="w-full" size="lg">
                {t("login.completeButton")}
              </Button>
            </>
          )}

          {view === "reset" && resetStep === "phone" && (
            <>
              <p className="text-[13px] text-surface-600">{t("login.resetSubtitle")}</p>
              <Button onClick={handleResetSendOtp} loading={loading} className="w-full" size="lg">
                {t("login.getCode")}
                <ArrowRight className="size-4" />
              </Button>
            </>
          )}

          {view === "reset" && resetStep === "otp" && (
            <>
              <p className="text-[13px] text-surface-600">{t("login.codeSentTo")} {phone}</p>
              <div className="flex gap-2.5 justify-center">
                {(["slot-r1", "slot-r2", "slot-r3", "slot-r4", "slot-r5", "slot-r6"] as const).map((slotId, i) => (
                  <input
                    key={slotId}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-13 text-center text-xl font-bold rounded-xl border bg-surface-100 border-surface-300 text-surface-800"
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setResetStep("phone")}
                  className="flex-1"
                  size="lg"
                >
                  <ArrowLeft className="size-3.5" />
                  {t("login.back")}
                </Button>
                <Button onClick={handleResetVerifyOtp} loading={loading} className="flex-1" size="lg">
                  {t("login.verify")}
                </Button>
              </div>
            </>
          )}

          {view === "reset" && resetStep === "new-password" && (
            <>
              <PasswordField
                label={t("login.newPassword")}
                placeholder={t("login.completePasswordPlaceholder")}
                value={newPassword}
                onChange={setNewPassword}
                isVisible={showResetPassword}
                onToggleVisibility={() => setShowResetPassword((prev) => !prev)}
                showAriaLabel={t("login.showPassword")}
                hideAriaLabel={t("login.hidePassword")}
                name="reset-new-password"
                autoComplete="new-password"
                inputClassName="w-full px-4 pr-12 py-3.5 rounded-xl bg-surface-100 border border-surface-300 text-surface-900"
              />
              <PasswordField
                label={t("login.confirmPasswordLabel")}
                placeholder={t("login.confirmPasswordPlaceholder")}
                value={confirmNewPassword}
                onChange={setConfirmNewPassword}
                isVisible={showResetConfirmPassword}
                onToggleVisibility={() => setShowResetConfirmPassword((prev) => !prev)}
                showAriaLabel={t("login.showPassword")}
                hideAriaLabel={t("login.hidePassword")}
                name="reset-confirm-password"
                autoComplete="new-password"
                inputClassName="w-full px-4 pr-12 py-3.5 rounded-xl bg-surface-100 border border-surface-300 text-surface-900"
              />
              <Button onClick={handleResetConfirm} loading={loading} className="w-full" size="lg">
                {t("login.resetPassword")}
              </Button>
            </>
          )}

          {error && <p className="text-[12px] text-danger-600 font-medium">{error}</p>}
        </div>

        <p className="text-[11px] text-surface-400 text-center mt-6">{t("login.devOtpHint")}</p>
      </div>
    </div>
  );
}
