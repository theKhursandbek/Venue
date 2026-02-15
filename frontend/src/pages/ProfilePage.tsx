import { useState, useEffect } from "react";
import {
  User,
  Phone,
  LogOut,
  Save,
  CheckCircle,
  Shield,
  Calendar,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { getNumberLocale } from "@/utils/locale";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageLoader from "@/components/ui/PageLoader";
import { useAuthStore } from "@/store/authStore";
import { useReveal } from "@/hooks/useReveal";
import { authService } from "@/services/authService";
import type { AxiosError } from "axios";
import type { APIError } from "@/types";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const { t, i18n } = useTranslation();

  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(!user);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      authService
        .getProfile()
        .then(({ data }) => {
          setUser(data);
          setName(data.name || "");
        })
        .finally(() => setLoadingProfile(false));
    }
  }, [user, setUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authService.updateProfile({ name: name.trim() });
      setUser(data);
      setIsEditing(false);
      toast.success(t("profile.updateSuccess"));
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      toast.error(axiosErr.response?.data?.error?.message || t("profile.updateError"));
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = name.trim() !== (user?.name || "");

  const statsRef = useReveal<HTMLDivElement>();
  const infoRef = useReveal<HTMLDivElement>();
  const logoutRef = useReveal<HTMLDivElement>();

  if (loadingProfile) return <PageLoader />;

  return (
    <div className="space-y-4 animate-page-enter stagger-children">
      {/* Profile card */}
      <div className="glass rounded-2xl p-5 tilt-card shimmer-line" data-scroll="up">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-16 rounded-2xl bg-linear-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 flex items-center justify-center animate-levitate aurora-glow">
              <User className="size-7 text-primary-500" />
            </div>
            {user?.is_verified && (
              <div className="absolute -bottom-1 -right-1 size-5 bg-linear-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center ring-2 ring-white animate-bounce-in">
                <CheckCircle className="size-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-surface-900 gradient-text-animated">{user?.name || t("profile.defaultName")}</h1>
            <p className="text-[13px] text-surface-500 flex items-center gap-1.5 mt-0.5">
              <Phone className="size-3.5" />
              {user?.phone_number}
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div ref={statsRef} className="grid grid-cols-2 gap-3 reveal-up" data-scroll="up" data-scroll-delay="100">
        <div className="glass rounded-2xl p-4 tilt-card shimmer-line">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="size-4 text-primary-500" />
            <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">{t("profile.status")}</p>
          </div>
          <p className="text-[15px] font-bold text-surface-900">
            {user?.is_verified ? t("profile.active") : t("profile.notVerified")}
          </p>
        </div>
        <div className="glass rounded-2xl p-4 tilt-card shimmer-line">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="size-4 text-accent-500" />
            <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">{t("profile.memberSince")}</p>
          </div>
          <p className="text-[15px] font-bold text-surface-900">
            {user?.date_joined
              ? new Date(user.date_joined).toLocaleDateString(getNumberLocale(i18n.language), {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
      </div>

      {/* Personal info card */}
      <div ref={infoRef} className="glass rounded-2xl p-5 tilt-card aurora-glow reveal-scale" data-scroll="scale">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider">{t("profile.personalInfo")}</p>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[12px] font-semibold text-primary-500 hover:text-primary-600 transition-all duration-300 bg-primary-500/10 border border-primary-500/15 px-3 py-1 rounded-lg hover:scale-105 hover:bg-primary-500/15 active:scale-95"
            >
              {t("profile.edit")}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="animate-scale-in space-y-4">
            <Input
              label={t("profile.nameLabel")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("profile.namePlaceholder")}
            />
            <div className="flex gap-2 animate-slide-up" style={{animationDelay: '100ms'}}>
              <Button
                variant="secondary"
                onClick={() => { setIsEditing(false); setName(user?.name || ""); }}
                className="flex-1"
              >
                {t("profile.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                loading={saving}
                disabled={!hasChanges}
                className="flex-1"
              >
                <Save className="size-3.5" />
                {t("profile.save")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass rounded-xl p-3 tilt-card" data-scroll="left" data-scroll-delay="100">
              <p className="text-[11px] text-surface-500 font-semibold uppercase tracking-wider mb-0.5">{t("profile.nameLabel")}</p>
              <p className="text-[15px] text-surface-800 font-medium">{user?.name || t("profile.notSpecified")}</p>
            </div>
            <div className="glass rounded-xl p-3 tilt-card" data-scroll="right" data-scroll-delay="200">
              <p className="text-[11px] text-surface-500 font-semibold uppercase tracking-wider mb-0.5">{t("profile.phone")}</p>
              <p className="text-[15px] text-surface-800 font-medium">{user?.phone_number}</p>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <div ref={logoutRef} className="reveal-up" data-scroll="up" data-scroll-delay="150">
      <button
        onClick={() => {
          logout();
          toast.success(t("profile.logoutSuccess"));
        }}
        className="w-full glass rounded-2xl p-4 text-danger-600 font-semibold text-[14px] hover:text-danger-500 transition-all duration-300 flex items-center justify-center gap-2 magnetic hover:border-danger-500/30"
      >
        <LogOut className="size-4 transition-transform duration-300 group-hover:rotate-12" />
        {t("profile.logout")}
      </button>
      </div>
    </div>
  );
}
