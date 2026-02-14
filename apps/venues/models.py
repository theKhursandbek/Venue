"""
Venue models for the venue-booking-backend project.
"""

from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models import ActiveManager, ActiveModel, AllObjectsManager, TimeStampedModel


class Venue(TimeStampedModel, ActiveModel):
    """
    Venue model representing a bookable space.
    Fields name, address, description, and amenities are translatable.
    """
    
    name = models.CharField(_("name"), max_length=255)
    address = models.TextField(_("address"))
    description = models.TextField(_("description"), blank=True)
    price_per_hour = models.DecimalField(
        _("price per hour"),
        max_digits=10,
        decimal_places=2,
        help_text=_("Price in local currency per hour"),
    )
    images = ArrayField(
        models.URLField(max_length=500),
        blank=True,
        default=list,
        verbose_name=_("images"),
        help_text=_("List of image URLs"),
    )
    amenities = ArrayField(
        models.CharField(max_length=100),
        blank=True,
        default=list,
        verbose_name=_("amenities"),
        help_text=_("List of amenities"),
    )
    
    # Managers
    objects = ActiveManager()
    all_objects = AllObjectsManager()
    
    class Meta:
        verbose_name = _("venue")
        verbose_name_plural = _("venues")
        ordering = ["-created_at"]
    
    def __str__(self):
        return self.name
    
    @property
    def image_count(self):
        return len(self.images)
