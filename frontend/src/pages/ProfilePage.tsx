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
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <h1 className="text-lg font-semibold text-surface-100 tracking-tight">Профиль</h1>

      {/* Profile Card */}
      <div className="bg-surface-900 rounded-md border border-surface-700/20 p-3 v-edge">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="size-9 bg-surface-800 border border-surface-700/30 rounded flex items-center justify-center">
              <User className="size-4 text-surface-400" />
            </div>
            {user?.is_verified && (
              <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-success-500 rounded-sm flex items-center justify-center">
                <CheckCircle className="size-2 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-surface-100 text-[13px] truncate">
              {user?.name || "Пользователь"}
            </p>
            <p className="text-surface-500 flex items-center gap-1 text-[11px]">
              <Phone className="size-2.5 shrink-0" />
              {user?.phone_number}
            </p>
          </div>
          {user?.is_verified && (
            <span className="inline-flex items-center gap-0.5 text-success-400 text-[9px] font-semibold bg-success-50 px-1.5 py-px rounded border border-success-500/15 uppercase tracking-wider">
              <Shield className="size-2" />
              Вериф.
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="bg-surface-900 rounded-md border border-surface-700/20 p-2.5">
          <div className="size-6 bg-primary-500/10 border border-primary-500/15 rounded flex items-center justify-center mb-1.5">
            <Shield className="size-2.5 text-primary-400" />
          </div>
          <p className="text-[10px] text-surface-500 uppercase tracking-wider">Статус</p>
          <p className="text-[12px] font-semibold text-surface-100 mt-px">
            {user?.is_verified ? "Активный" : "Не вериф."}
          </p>
        </div>
        <div className="bg-surface-900 rounded-md border border-surface-700/20 p-2.5">
          <div className="size-6 bg-accent-500/10 border border-accent-500/15 rounded flex items-center justify-center mb-1.5">
            <CalendarDays className="size-2.5 text-accent-400" />
          </div>
          <p className="text-[10px] text-surface-500 uppercase tracking-wider">Регистр.</p>
          <p className="text-[12px] font-semibold text-surface-100 mt-px">
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

      {/* Edit Form */}
      <div className="bg-surface-900 rounded-md border border-surface-700/20 overflow-hidden v-edge">
        <div className="flex items-center justify-between px-3 py-2 border-b border-surface-700/20">
          <h3 className="text-[11px] font-medium text-surface-300 flex items-center gap-1">
            <Edit3 className="size-2.5 text-primary-400" />
            Личные данные
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[10px] font-medium text-primary-400 hover:text-primary-300 bg-primary-500/10 px-2 py-0.5 rounded transition-colors active:scale-95 border border-primary-500/15"
            >
              Редактировать
            </button>
          )}
        </div>

        <div className="p-3 space-y-2">
          {isEditing ? (
            <div className="animate-fade-in space-y-2">
              <Input
                label="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
              />
              <div className="flex gap-1.5">
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
                  <Save className="size-3" />
                  Сохранить
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 animate-fade-in">
              <div className="bg-surface-850 border border-surface-700/20 rounded px-2.5 py-2">
                <p className="text-[10px] text-surface-500 uppercase tracking-wider">Имя</p>
                <p className="text-[13px] font-medium text-surface-100">
                  {user?.name || "Не указано"}
                </p>
              </div>
              <div className="bg-surface-850 border border-surface-700/20 rounded px-2.5 py-2">
                <p className="text-[10px] text-surface-500 uppercase tracking-wider">Телефон</p>
                <p className="text-[13px] font-medium text-surface-100">
                  {user?.phone_number}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          toast.success("Вы вышли из аккаунта");
        }}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-danger-400 font-medium text-[13px] hover:bg-danger-50 rounded-md transition-colors border border-danger-500/15 active:scale-[0.97]"
      >
        <LogOut className="size-3" />
        Выйти из аккаунта
      </button>
    </div>
  );
}
