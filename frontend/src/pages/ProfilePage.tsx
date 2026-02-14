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
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-primary-500 tracking-widest uppercase mb-1">Аккаунт</p>
        <h1 className="text-2xl font-bold text-surface-50 tracking-tight">
          Мой <span className="gradient-text">профиль</span>
        </h1>
      </div>

      {/* ═══ Profile Hero Card ═══ */}
      <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-14 bg-surface-800 border border-surface-600/50 rounded-xl flex items-center justify-center">
              <User className="size-7 text-surface-400" />
            </div>
            {user?.is_verified && (
              <div className="absolute -bottom-1 -right-1 size-5 bg-success-500 rounded-md flex items-center justify-center">
                <CheckCircle className="size-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-surface-100 text-lg truncate">
              {user?.name || "Пользователь"}
            </p>
            <p className="text-surface-500 flex items-center gap-1.5 text-sm mt-0.5">
              <Phone className="size-3 shrink-0" />
              {user?.phone_number}
            </p>
            {user?.is_verified && (
              <span className="inline-flex items-center gap-1 text-success-400 text-xs mt-1.5 font-semibold bg-success-50 px-2 py-0.5 rounded-md border border-success-500/20">
                <Shield className="size-3" />
                Верифицирован
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Quick Stats ═══ */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-4">
          <div className="size-9 bg-primary-500/10 border border-primary-500/20 rounded-lg flex items-center justify-center mb-2.5">
            <Shield className="size-4 text-primary-400" />
          </div>
          <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">Статус</p>
          <p className="text-sm font-bold text-surface-100 mt-1">
            {user?.is_verified ? "Активный" : "Не верифицирован"}
          </p>
        </div>
        <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-4">
          <div className="size-9 bg-accent-500/10 border border-accent-500/20 rounded-lg flex items-center justify-center mb-2.5">
            <CalendarDays className="size-4 text-accent-400" />
          </div>
          <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">Регистрация</p>
          <p className="text-sm font-bold text-surface-100 mt-1">
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
      <div className="bg-surface-900 rounded-xl border border-surface-700/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-surface-700/50">
          <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
            <Edit3 className="size-3.5 text-primary-400" />
            Личные данные
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/15 px-3 py-1.5 rounded-lg transition-all active:scale-95 border border-primary-500/20"
            >
              Редактировать
            </button>
          )}
        </div>

        <div className="p-4 space-y-3">
          {isEditing ? (
            <div className="animate-fade-in space-y-3">
              <Input
                label="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
              />
              <div className="flex gap-2.5">
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
                  <Save className="size-4" />
                  Сохранить
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-surface-800 border border-surface-700/50 rounded-lg px-4 py-3">
                <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">Имя</p>
                <p className="text-sm font-semibold text-surface-100 mt-1">
                  {user?.name || "Не указано"}
                </p>
              </div>
              <div className="bg-surface-800 border border-surface-700/50 rounded-lg px-4 py-3">
                <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">Телефон</p>
                <p className="text-sm font-semibold text-surface-100 mt-1">
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
        className="w-full flex items-center justify-center gap-2 py-3.5 text-danger-400 font-semibold hover:bg-danger-50 rounded-xl transition-all border border-danger-500/20 active:scale-[0.97]"
      >
        <LogOut className="size-4" />
        Выйти из аккаунта
      </button>
    </div>
  );
}
