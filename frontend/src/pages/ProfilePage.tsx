import { useState, useEffect } from "react";
import {
  User,
  Phone,
  LogOut,
  Save,
  Shield,
  CalendarDays,
  Edit3,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageLoader from "@/components/ui/PageLoader";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import type { AxiosError } from "axios";
import type { APIError } from "@/types";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();

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
      toast.success("Профиль обновлён");
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      toast.error(axiosErr.response?.data?.error?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = name.trim() !== (user?.name || "");

  if (loadingProfile) return <PageLoader />;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-[10px] font-medium text-primary-500 tracking-widest uppercase mb-0.5">Аккаунт</p>
        <h1 className="text-xl font-semibold text-surface-50 tracking-tight">
          Мой <span className="gradient-text">профиль</span>
        </h1>
      </div>

      {/* ═══ Profile Hero Card ═══ */}
      <div className="bg-surface-900/80 rounded-lg border border-surface-700/25 p-4 inner-light backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-11 bg-surface-850 border border-surface-700/30 rounded-lg flex items-center justify-center">
              <User className="size-5 text-surface-400" />
            </div>
            {user?.is_verified && (
              <div className="absolute -bottom-0.5 -right-0.5 size-4 bg-success-500 rounded flex items-center justify-center">
                <CheckCircle className="size-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-surface-100 text-sm truncate">
              {user?.name || "Пользователь"}
            </p>
            <p className="text-surface-500 flex items-center gap-1 text-xs mt-0.5">
              <Phone className="size-2.5 shrink-0" />
              {user?.phone_number}
            </p>
            {user?.is_verified && (
              <span className="inline-flex items-center gap-1 text-success-400 text-[10px] mt-1 font-medium bg-success-50 px-1.5 py-0.5 rounded border border-success-500/15">
                <Shield className="size-2.5" />
                Верифицирован
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Quick Stats ═══ */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface-900/80 rounded-lg border border-surface-700/25 p-3.5 inner-light">
          <div className="size-7 bg-primary-500/8 border border-primary-500/15 rounded-md flex items-center justify-center mb-2">
            <Shield className="size-3 text-primary-400" />
          </div>
          <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">Статус</p>
          <p className="text-xs font-semibold text-surface-100 mt-0.5">
            {user?.is_verified ? "Активный" : "Не верифицирован"}
          </p>
        </div>
        <div className="bg-surface-900/80 rounded-lg border border-surface-700/25 p-3.5 inner-light">
          <div className="size-7 bg-accent-500/8 border border-accent-500/15 rounded-md flex items-center justify-center mb-2">
            <CalendarDays className="size-3 text-accent-400" />
          </div>
          <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">Регистрация</p>
          <p className="text-xs font-semibold text-surface-100 mt-0.5">
            {user?.date_joined
              ? new Date(user.date_joined).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
      </div>

      {/* ═══ Edit Form ═══ */}
      <div className="bg-surface-900/80 rounded-lg border border-surface-700/25 overflow-hidden inner-light">
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-surface-700/25">
          <h3 className="text-xs font-medium text-surface-200 flex items-center gap-1.5">
            <Edit3 className="size-3 text-primary-400" />
            Личные данные
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[11px] font-medium text-primary-400 hover:text-primary-300 bg-primary-500/8 hover:bg-primary-500/12 px-2.5 py-1 rounded-md transition-all active:scale-90 border border-primary-500/15"
            >
              Редактировать
            </button>
          )}
        </div>

        <div className="p-3.5 space-y-2.5">
          {isEditing ? (
            <div className="animate-fade-in space-y-2.5">
              <Input
                label="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user?.name || "");
                  }}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleSave}
                  loading={saving}
                  disabled={!hasChanges}
                  className="flex-1"
                >
                  <Save className="size-3.5" />
                  Сохранить
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 animate-fade-in">
              <div className="bg-surface-850 border border-surface-700/25 rounded-md px-3 py-2.5">
                <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">Имя</p>
                <p className="text-sm font-medium text-surface-100 mt-0.5">
                  {user?.name || "Не указано"}
                </p>
              </div>
              <div className="bg-surface-850 border border-surface-700/25 rounded-md px-3 py-2.5">
                <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">Телефон</p>
                <p className="text-sm font-medium text-surface-100 mt-0.5">
                  {user?.phone_number}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Logout ═══ */}
      <button
        onClick={() => {
          logout();
          toast.success("Вы вышли из аккаунта");
        }}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-danger-400 font-medium text-sm hover:bg-danger-50 rounded-lg transition-all border border-danger-500/15 active:scale-[0.96]"
      >
        <LogOut className="size-3.5" />
        Выйти из аккаунта
      </button>
    </div>
  );
}
