"""
Serializers for venues app.
"""

from rest_framework import serializers

from .models import Venue


class VenueListSerializer(serializers.ModelSerializer):
    """
    Serializer for venue list view.
    Returns minimal venue information for listing.
    """
    
    class Meta:
        model = Venue
        fields = (
            "id",
            "name",
            "address",
            "price_per_hour",
            "images",
            "is_active",
        )


class VenueDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for venue detail view.
    Returns full venue information.
    """
    
    class Meta:
        model = Venue
        fields = (
            "id",
            "name",
            "address",
            "description",
            "price_per_hour",
            "images",
            "amenities",
            "is_active",
            "created_at",
            "updated_at",
        )


class VenueCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating venues (admin only).
    """
    
    class Meta:
        model = Venue
        fields = (
            "name",
            "address",
            "description",
            "price_per_hour",
            "images",
            "amenities",
            "is_active",
        )
    
    def validate_price_per_hour(self, value):
        """Ensure price is positive."""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
    
    def validate_images(self, value):
        """Validate image URLs."""
        if value:
            for url in value:
                if not url.startswith(("http://", "https://")):
                    raise serializers.ValidationError(
                        f"Invalid image URL: {url}. Must start with http:// or https://"
                    )
        return value


class TimeSlotSerializer(serializers.Serializer):
    """
    Serializer for available time slots.
    """
    
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    is_available = serializers.BooleanField()


class AvailabilityRequestSerializer(serializers.Serializer):
    """
    Serializer for availability check request.
    """
    
    date = serializers.DateField(required=True)


class VenueAvailabilitySerializer(serializers.Serializer):
    """
    Serializer for venue availability response.
    """
    
    venue_id = serializers.IntegerField()
    date = serializers.DateField()
    time_slots = TimeSlotSerializer(many=True)
