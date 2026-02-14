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
      toast.success("Профиль обновлён ✨");
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Мой <span className="gradient-text">профиль</span>
        </h1>
      </div>

      {/* Profile Card */}
      <div className="relative bg-linear-to-br from-primary-500 via-primary-600 to-purple-600 rounded-3xl p-6 shadow-xl shadow-primary-500/20 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-7.5 -right-5 w-28 h-28 bg-white/10 rounded-full blur-md" />
        <div className="absolute -bottom-5 -left-2.5 w-20 h-20 bg-white/5 rounded-full blur-sm" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="size-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center ring-2 ring-white/30">
            <User className="size-8 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg">
              {user?.name || "Пользователь"}
            </p>
            <p className="text-primary-100 flex items-center gap-1.5 text-sm mt-0.5">
              <Phone className="size-3.5" />
              {user?.phone_number}
            </p>
            {user?.is_verified && (
              <div className="flex items-center gap-1 text-green-200 text-xs mt-1.5 font-medium">
                <CheckCircle className="size-3.5" />
                Верифицирован
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="size-10 bg-primary-50 rounded-xl flex items-center justify-center mb-2.5">
            <Shield className="size-5 text-primary-600" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Статус</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">
            {user?.is_verified ? "✅ Активный" : "Не верифицирован"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="size-10 bg-purple-50 rounded-xl flex items-center justify-center mb-2.5">
            <CalendarDays className="size-5 text-purple-600" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Дата регистрации</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Edit3 className="size-4 text-primary-500" />
            Личные данные
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Редактировать
            </button>
          )}
        </div>

        <div className="p-4 space-y-4">
          {isEditing ? (
            <>
              <Input
                label="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
              />
              <div className="flex gap-3">
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
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-medium">Имя</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {user?.name || "Не указано"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Телефон</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
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
        className="w-full flex items-center justify-center gap-2 py-3.5 text-danger-500 font-semibold hover:bg-danger-50 rounded-2xl transition-colors border-2 border-danger-100"
      >
        <LogOut className="size-4" />
        Выйти из аккаунта
      </button>
    </div>
  );
}
