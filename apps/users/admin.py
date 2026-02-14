"""
Admin configuration for users app.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin configuration for custom User model.
    """
    
    list_display = (
        "phone_number",
        "name",
        "is_active",
        "is_verified",
        "is_staff",
        "created_at",
    )
    list_filter = ("is_active", "is_verified", "is_staff", "is_superuser")
    search_fields = ("phone_number", "name")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at", "last_login")
    
    fieldsets = (
        (None, {"fields": ("phone_number",)}),
        (_("Personal info"), {"fields": ("name",)}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_verified",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "created_at", "updated_at")}),
    )
    
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("phone_number", "name", "is_verified", "is_staff"),
            },
        ),
    )
