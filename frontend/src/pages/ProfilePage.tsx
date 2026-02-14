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
  Crown,
  Sparkles,
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
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Crown className="size-5 text-primary-400" />
          <span className="text-xs font-bold text-primary-500 tracking-widest uppercase">Account</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Мой <span className="gradient-text">профиль</span>
        </h1>
      </div>

      {/* ═══ Profile Hero Card ═══ */}
      <div className="relative bg-linear-to-br from-primary-600 via-primary-500 to-accent-500 rounded-[22px] p-6 shadow-2xl shadow-primary-500/25 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-morph" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-lg animate-morph" style={{ animationDelay: "-4s" }} />
        <div className="absolute top-1/2 right-4 w-20 h-20 bg-white/5 rounded-full blur-md" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <div className="absolute inset-[-3px] bg-white/20 rounded-2xl blur-sm" />
            <div className="relative size-[72px] bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center ring-2 ring-white/20">
              <User className="size-9 text-white drop-shadow-md" />
            </div>
            {user?.is_verified && (
              <div className="absolute -bottom-1.5 -right-1.5 size-7 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="size-4 text-success-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-xl truncate drop-shadow-sm">
              {user?.name || "Пользователь"}
            </p>
            <p className="text-white/70 flex items-center gap-1.5 text-sm mt-1 font-medium">
              <Phone className="size-3.5 shrink-0" />
              {user?.phone_number}
            </p>
            {user?.is_verified && (
              <div className="inline-flex items-center gap-1.5 text-emerald-200 text-xs mt-2 font-bold bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <Sparkles className="size-3" />
                Верифицирован
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Quick Stats ═══ */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[18px] border border-gray-100/80 p-4 shadow-sm card-premium">
          <div className="size-11 bg-linear-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mb-3">
            <Shield className="size-5 text-primary-600" />
          </div>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Статус</p>
          <p className="text-sm font-extrabold text-gray-900 mt-1">
            {user?.is_verified ? "✅ Активный" : "Не верифицирован"}
          </p>
        </div>
        <div className="bg-white rounded-[18px] border border-gray-100/80 p-4 shadow-sm card-premium">
          <div className="size-11 bg-linear-to-br from-accent-100 to-pink-50 rounded-2xl flex items-center justify-center mb-3">
            <CalendarDays className="size-5 text-accent-500" />
          </div>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Регистрация</p>
          <p className="text-sm font-extrabold text-gray-900 mt-1">
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
      <div className="bg-white rounded-[22px] border border-gray-100/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <div className="size-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <Edit3 className="size-3.5 text-primary-500" />
            </div>
            Личные данные
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-95"
            >
              Редактировать
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          {isEditing ? (
            <div className="animate-fade-in space-y-4">
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
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gray-50 rounded-xl px-4 py-3.5">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Имя</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {user?.name || "Не указано"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3.5">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Телефон</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
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
        className="w-full flex items-center justify-center gap-2.5 py-4 text-danger-500 font-bold hover:bg-danger-50 rounded-2xl transition-all duration-200 border-2 border-danger-100/60 active:scale-[0.97]"
      >
        <LogOut className="size-4.5" />
        Выйти из аккаунта
      </button>
    </div>
  );
}
