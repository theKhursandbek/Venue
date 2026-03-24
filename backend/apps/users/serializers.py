"""
Serializers for users app.
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from core.utils import validate_uzbekistan_phone

from .models import User


PHONE_FORMAT_ERROR = "Invalid phone number format. Expected: +998XXXXXXXXX"


class PhoneNumberSerializer(serializers.Serializer):
    """
    Serializer for phone number input (send OTP).
    """
    
    phone_number = serializers.CharField(max_length=15)
    
    def validate_phone_number(self, value):
        """Validate Uzbekistan phone number format."""
        if not validate_uzbekistan_phone(value):
            raise serializers.ValidationError(PHONE_FORMAT_ERROR)
        return value


class OTPVerifySerializer(serializers.Serializer):
    """
    Serializer for OTP verification.
    """
    
    phone_number = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6, min_length=6)
    
    def validate_phone_number(self, value):
        """Validate Uzbekistan phone number format."""
        if not validate_uzbekistan_phone(value):
            raise serializers.ValidationError(PHONE_FORMAT_ERROR)
        return value
    
    def validate_otp(self, value):
        """Validate OTP is numeric."""
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
        return value


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    """
    
    class Meta:
        model = User
        fields = (
            "id",
            "phone_number",
            "name",
            "is_active",
            "is_verified",
            "is_registration_completed",
            "created_at",
        )
        read_only_fields = (
            "id",
            "phone_number",
            "is_active",
            "is_verified",
            "is_registration_completed",
            "created_at",
        )


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    """
    
    class Meta:
        model = User
        fields = ("name",)


class TokenResponseSerializer(serializers.Serializer):
    """
    Serializer for token response (documentation purposes).
    """
    
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()
    requires_registration = serializers.BooleanField()


class RegistrationVerifyOTPResponseSerializer(serializers.Serializer):
    """
    Serializer for registration OTP verification response.
    """

    registration_token = serializers.CharField()
    phone_number = serializers.CharField()


class CompleteRegistrationSerializer(serializers.Serializer):
    """
    Serializer for completing registration after OTP verification.
    """

    registration_token = serializers.CharField()
    name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
        validate_password(value)
        return value


class PasswordLoginSerializer(serializers.Serializer):
    """
    Serializer for phone + password login.
    """

    phone_number = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True)

    def validate_phone_number(self, value):
        """Validate Uzbekistan phone number format."""
        if not validate_uzbekistan_phone(value):
            raise serializers.ValidationError(PHONE_FORMAT_ERROR)
        return value


class PasswordResetVerifyOTPResponseSerializer(serializers.Serializer):
    """
    Serializer for password reset OTP verification response.
    """

    reset_token = serializers.CharField()
    phone_number = serializers.CharField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for setting a new password after password reset OTP verification.
    """

    reset_token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logout request.
    """

    refresh = serializers.CharField()
