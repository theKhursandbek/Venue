"""
Admin configuration for venues app.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from modeltranslation.admin import TranslationAdmin

from .models import Venue


@admin.register(Venue)
class VenueAdmin(TranslationAdmin):
    """
    Admin configuration for Venue model with translation support.
    """
    
    list_display = (
        "name",
        "address_short",
        "price_per_hour",
        "is_active",
        "image_count_display",
        "created_at",
    )
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "address", "description")
    readonly_fields = ("created_at", "updated_at", "images_preview")
    ordering = ("-created_at",)
    
    fieldsets = (
        (None, {
            "fields": ("name", "address", "description"),
        }),
        (_("Pricing"), {
            "fields": ("price_per_hour",),
        }),
        (_("Media"), {
            "fields": ("images", "images_preview"),
        }),
        (_("Amenities"), {
            "fields": ("amenities",),
        }),
        (_("Status"), {
            "fields": ("is_active",),
        }),
        (_("Timestamps"), {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )
    
    def address_short(self, obj):
        """Display truncated address."""
        if len(obj.address) > 50:
            return obj.address[:50] + "..."
        return obj.address
    address_short.short_description = _("address")
    
    def image_count_display(self, obj):
        """Display image count."""
        return obj.image_count
    image_count_display.short_description = _("images")
    
    def images_preview(self, obj):
        """Display image previews in admin."""
        if not obj.images:
            return _("No images")
        
        html = ""
        for url in obj.images[:5]:  # Show max 5 images
            html += f'<img src="{url}" style="max-width: 150px; max-height: 100px; margin: 5px;" />'
        
        if len(obj.images) > 5:
            html += f"<p>... and {len(obj.images) - 5} more</p>"
        
        return format_html(html)
    images_preview.short_description = _("images preview")
    
    def get_queryset(self, request):
        """Use all_objects manager to show inactive venues too."""
        return Venue.all_objects.all()
