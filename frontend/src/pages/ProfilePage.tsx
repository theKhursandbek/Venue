import { useState, useEffect } from "react";
import { User, Phone, LogOut, Save } from "lucide-react";
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

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(!user);

  useEffect(() => {
    if (!user) {
      authService
        .getProfile()
        .then(({ data }) => {
          setUser(data);
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
        })
        .finally(() => setLoadingProfile(false));
    }
  }, [user, setUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authService.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      setUser(data);
      toast.success("Профиль обновлён");
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      toast.error(
        axiosErr.response?.data?.error?.message || "Ошибка сохранения"
      );
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    firstName.trim() !== (user?.first_name || "") ||
    lastName.trim() !== (user?.last_name || "");

  if (loadingProfile) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Профиль</h1>

      {/* Avatar + Phone */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
          <User className="size-7 text-primary-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {user?.first_name || user?.last_name
              ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
              : "Пользователь"}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <Phone className="size-3.5" />
            {user?.phone_number}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Личные данные</h3>

        <Input
          label="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Введите имя"
        />

        <Input
          label="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Введите фамилию"
        />

        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!hasChanges}
          className="w-full"
        >
          <Save className="size-4" />
          Сохранить
        </Button>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          toast.success("Вы вышли из аккаунта");
        }}
        className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-medium hover:bg-red-50 rounded-2xl transition-colors"
      >
        <LogOut className="size-4" />
        Выйти из аккаунта
      </button>
    </div>
  );
}
