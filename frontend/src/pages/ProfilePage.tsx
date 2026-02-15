import { useState, useEffect } from "react";
import {
  User,
  Phone,
  LogOut,
  Save,
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
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="size-12 bg-surface-850 rounded-full flex items-center justify-center">
            <User className="size-5 text-surface-400" />
          </div>
          {user?.is_verified && (
            <div className="absolute -bottom-0.5 -right-0.5 size-4 bg-surface-50 rounded-full flex items-center justify-center ring-2 ring-surface-950">
              <CheckCircle className="size-2.5 text-surface-950" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-lg font-bold text-surface-50">{user?.name || "Пользователь"}</h1>
          <p className="text-[12px] text-surface-500 flex items-center gap-1">
            <Phone className="size-3" />
            {user?.phone_number}
          </p>
        </div>
      </div>

      <div className="divider" />

      {/* Stats */}
      <div className="flex gap-8">
        <div>
          <p className="text-[11px] text-surface-500 uppercase tracking-wider">Статус</p>
          <p className="text-[14px] font-semibold text-surface-100 mt-0.5">
            {user?.is_verified ? "Активный" : "Не верифицирован"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-surface-500 uppercase tracking-wider">Регистрация</p>
          <p className="text-[14px] font-semibold text-surface-100 mt-0.5">
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

      <div className="divider" />

      {/* Personal info */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-surface-500 uppercase tracking-wider">Личные данные</p>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[12px] font-medium text-surface-200 hover:text-surface-50 transition-colors"
            >
              Редактировать
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="animate-fade-in space-y-3">
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
                <Save className="size-3" />
                Сохранить
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div>
              <p className="text-[11px] text-surface-500">Имя</p>
              <p className="text-[14px] text-surface-100 mt-0.5">{user?.name || "Не указано"}</p>
            </div>
            <div>
              <p className="text-[11px] text-surface-500">Телефон</p>
              <p className="text-[14px] text-surface-100 mt-0.5">{user?.phone_number}</p>
            </div>
          </div>
        )}
      </div>

      <div className="divider" />

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          toast.success("Вы вышли из аккаунта");
        }}
        className="text-danger-400 font-medium text-[13px] hover:text-danger-300 transition-colors flex items-center gap-1.5"
      >
        <LogOut className="size-3.5" />
        Выйти из аккаунта
      </button>
    </div>
  );
}
