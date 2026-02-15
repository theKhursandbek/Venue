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
      {/* Profile card */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 flex items-center justify-center">
              <User className="size-7 text-primary-500" />
            </div>
            {user?.is_verified && (
              <div className="absolute -bottom-1 -right-1 size-5 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center ring-2 ring-white">
                <CheckCircle className="size-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-900">{user?.name || "Пользователь"}</h1>
            <p className="text-[13px] text-surface-500 flex items-center gap-1.5 mt-0.5">
              <Phone className="size-3.5" />
              {user?.phone_number}
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="size-4 text-primary-500" />
            <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Статус</p>
          </div>
          <p className="text-[15px] font-bold text-surface-900">
            {user?.is_verified ? "Активный" : "Не верифицирован"}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="size-4 text-accent-500" />
            <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">С нами с</p>
          </div>
          <p className="text-[15px] font-bold text-surface-900">
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

      {/* Personal info card */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider">Личные данные</p>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[12px] font-semibold text-primary-500 hover:text-primary-600 transition-colors bg-primary-500/10 border border-primary-500/15 px-3 py-1 rounded-lg"
            >
              Редактировать
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="animate-fade-in space-y-4">
            <Input
              label="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => { setIsEditing(false); setName(user?.name || ""); }}
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
          <div className="space-y-4 animate-fade-in">
            <div className="glass rounded-xl p-3">
              <p className="text-[11px] text-surface-500 font-semibold uppercase tracking-wider mb-0.5">Имя</p>
              <p className="text-[15px] text-surface-800 font-medium">{user?.name || "Не указано"}</p>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-[11px] text-surface-500 font-semibold uppercase tracking-wider mb-0.5">Телефон</p>
              <p className="text-[15px] text-surface-800 font-medium">{user?.phone_number}</p>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          toast.success("Вы вышли из аккаунта");
        }}
        className="w-full glass rounded-2xl p-4 text-danger-600 font-semibold text-[14px] hover:text-danger-500 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="size-4" />
        Выйти из аккаунта
      </button>
    </div>
  );
}
