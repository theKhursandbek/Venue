"""
OTP service for handling OTP generation, storage, and verification.
"""

import logging
import secrets

from django.conf import settings
from django.core.cache import cache

from core.exceptions import OTPExpiredException, OTPInvalidException, OTPRateLimitException
from core.utils import generate_otp

logger = logging.getLogger(__name__)


class OTPService:
    """
    Service class for OTP operations.
    """
    
    @staticmethod
    def _otp_key(phone_number: str, purpose: str) -> str:
        return f"otp:{purpose}:{phone_number}"

    @staticmethod
    def _attempt_key(phone_number: str, purpose: str) -> str:
        return f"otp_attempts:{purpose}:{phone_number}"

    @staticmethod
    def _session_key(prefix: str, token: str) -> str:
        return f"{prefix}:{token}"

    @staticmethod
    def send_otp(phone_number: str, purpose: str = "register") -> str:
        """
        Generate and send OTP to the given phone number.
        
        Args:
            phone_number: Phone number to send OTP to
            
        Returns:
            Generated OTP (for development/testing)
            
        Raises:
            OTPRateLimitException: If rate limit is exceeded
        """
        # Check rate limit
        attempt_key = OTPService._attempt_key(phone_number, purpose)
        attempts = cache.get(attempt_key, 0)
        
        max_attempts = getattr(settings, "OTP_MAX_ATTEMPTS", 3)
        rate_limit_minutes = getattr(settings, "OTP_RATE_LIMIT_MINUTES", 10)
        
        if attempts >= max_attempts:
            raise OTPRateLimitException(
                f"Too many OTP requests. Please try again after {rate_limit_minutes} minutes."
            )
        
        # Generate OTP
        otp = generate_otp()
        
        # Store OTP in cache
        otp_key = OTPService._otp_key(phone_number, purpose)
        expiry_seconds = getattr(settings, "OTP_EXPIRY_SECONDS", 300)
        cache.set(otp_key, otp, timeout=expiry_seconds)
        
        # Update attempt counter
        cache.set(attempt_key, attempts + 1, timeout=rate_limit_minutes * 60)
        
        # Log OTP to console (mock SMS)
        logger.info(f"[MOCK SMS][{purpose}] OTP for {phone_number}: {otp}")
        print(f"\n{'='*50}")
        print(f"[MOCK SMS][{purpose}] OTP for {phone_number}: {otp}")
        print(f"{'='*50}\n")
        
        return otp
    
    @staticmethod
    def verify_otp(phone_number: str, otp: str, purpose: str = "register") -> bool:
        """
        Verify the OTP for the given phone number.
        
        Args:
            phone_number: Phone number to verify OTP for
            otp: OTP to verify
            
        Returns:
            True if OTP is valid
            
        Raises:
            OTPExpiredException: If OTP has expired or doesn't exist
            OTPInvalidException: If OTP is invalid
        """
        otp_key = OTPService._otp_key(phone_number, purpose)
        stored_otp = cache.get(otp_key)
        
        if stored_otp is None:
            raise OTPExpiredException()
        
        if stored_otp != otp:
            raise OTPInvalidException()
        
        # Delete OTP after successful verification
        cache.delete(otp_key)
        
        # Clear attempt counter
        attempt_key = OTPService._attempt_key(phone_number, purpose)
        cache.delete(attempt_key)
        
        return True

    @staticmethod
    def create_registration_token(phone_number: str) -> str:
        """Create a short-lived token proving registration OTP verification."""
        token = secrets.token_urlsafe(32)
        expiry_seconds = getattr(settings, "OTP_EXPIRY_SECONDS", 300)
        cache.set(OTPService._session_key("register_session", token), phone_number, timeout=expiry_seconds)
        return token

    @staticmethod
    def consume_registration_token(token: str) -> str | None:
        """Consume and return phone number for registration token."""
        key = OTPService._session_key("register_session", token)
        phone_number = cache.get(key)
        if phone_number:
            cache.delete(key)
        return phone_number

    @staticmethod
    def create_reset_token(phone_number: str) -> str:
        """Create a short-lived token proving reset OTP verification."""
        token = secrets.token_urlsafe(32)
        expiry_seconds = getattr(settings, "OTP_EXPIRY_SECONDS", 300)
        cache.set(OTPService._session_key("reset_session", token), phone_number, timeout=expiry_seconds)
        return token

    @staticmethod
    def consume_reset_token(token: str) -> str | None:
        """Consume and return phone number for reset token."""
        key = OTPService._session_key("reset_session", token)
        phone_number = cache.get(key)
        if phone_number:
            cache.delete(key)
        return phone_number
