"""
Admin configuration for bookings app.
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import Booking, BookingStatus


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """
    Admin configuration for Booking model.
    """
    
    list_display = (
        "id",
        "user",
        "venue",
        "booking_date",
        "start_time",
        "end_time",
        "total_price",
        "status",
        "created_at",
    )
    list_filter = ("status", "booking_date", "created_at", "venue")
    search_fields = (
        "user__phone_number",
        "user__name",
        "venue__name",
    )
    readonly_fields = ("total_price", "created_at", "updated_at")
    ordering = ("-created_at",)
    date_hierarchy = "booking_date"
    
    fieldsets = (
        (None, {
            "fields": ("user", "venue"),
        }),
        (_("Booking Details"), {
            "fields": ("booking_date", "start_time", "end_time", "total_price"),
        }),
        (_("Status"), {
            "fields": ("status",),
        }),
        (_("Timestamps"), {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )
    
    actions = ["mark_confirmed", "mark_completed", "mark_cancelled"]
    
    @admin.action(description=_("Mark selected bookings as confirmed"))
    def mark_confirmed(self, request, queryset):
        updated = queryset.filter(
            status__in=[BookingStatus.PENDING]
        ).update(status=BookingStatus.CONFIRMED)
        self.message_user(request, f"{updated} booking(s) marked as confirmed.")
    
    @admin.action(description=_("Mark selected bookings as completed"))
    def mark_completed(self, request, queryset):
        updated = queryset.filter(
            status__in=[BookingStatus.PENDING, BookingStatus.CONFIRMED]
        ).update(status=BookingStatus.COMPLETED)
        self.message_user(request, f"{updated} booking(s) marked as completed.")
    
    @admin.action(description=_("Mark selected bookings as cancelled"))
    def mark_cancelled(self, request, queryset):
        updated = queryset.filter(
            status__in=[BookingStatus.PENDING, BookingStatus.CONFIRMED]
        ).update(status=BookingStatus.CANCELLED)
        self.message_user(request, f"{updated} booking(s) marked as cancelled.")
