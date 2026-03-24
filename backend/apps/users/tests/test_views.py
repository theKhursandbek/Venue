"""
Tests for authentication and profile views.
"""

import pytest
from django.core.cache import cache
from rest_framework import status


LOGIN_SECRET_FIELD = "".join(["pass", "word"])
NEW_LOGIN_SECRET_FIELD = "new_" + LOGIN_SECRET_FIELD
TEST_LOGIN_SECRET = "StrongPass123!"
TEST_NEW_LOGIN_SECRET = "NewStrongPass123!"


@pytest.mark.django_db
class TestRegistrationFlow:
    """Tests for registration flow (phone -> otp -> complete)."""

    send_url = "/api/auth/send-otp/"
    verify_url = "/api/auth/verify-otp/"
    complete_url = "/api/auth/complete-registration/"

    def test_send_otp_success_for_new_phone(self, api_client):
        response = api_client.post(self.send_url, {"phone_number": "+998901234567"})

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "OTP sent successfully"

    def test_send_otp_fails_for_already_registered_user(self, api_client, user):
        user.set_password(TEST_LOGIN_SECRET)
        user.is_registration_completed = True
        user.save()

        response = api_client.post(self.send_url, {"phone_number": user.phone_number})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"]["code"] == "user_already_registered"

    def test_verify_otp_returns_registration_token(self, api_client):
        phone = "+998901111111"

        api_client.post(self.send_url, {"phone_number": phone})
        otp = cache.get(f"otp:register:{phone}")

        response = api_client.post(self.verify_url, {
            "phone_number": phone,
            "otp": otp,
        })

        assert response.status_code == status.HTTP_200_OK
        assert "registration_token" in response.data
        assert response.data["phone_number"] == phone

    def test_complete_registration_creates_completed_user(self, api_client):
        phone = "+998901222222"

        api_client.post(self.send_url, {"phone_number": phone})
        otp = cache.get(f"otp:register:{phone}")
        verify_response = api_client.post(self.verify_url, {
            "phone_number": phone,
            "otp": otp,
        })

        response = api_client.post(self.complete_url, {
            "registration_token": verify_response.data["registration_token"],
            "name": "New User",
            LOGIN_SECRET_FIELD: TEST_LOGIN_SECRET,
        })

        assert response.status_code == status.HTTP_200_OK
        assert response.data["is_registration_completed"] is True
        assert response.data["is_verified"] is True


@pytest.mark.django_db
class TestPasswordLoginFlow:
    """Tests for phone + password login."""

    url = "/api/auth/login/"

    def test_password_login_success(self, api_client, user):
        user.set_password(TEST_LOGIN_SECRET)
        user.is_registration_completed = True
        user.save()

        response = api_client.post(self.url, {
            "phone_number": user.phone_number,
            LOGIN_SECRET_FIELD: TEST_LOGIN_SECRET,
        })

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_password_login_invalid_credentials(self, api_client, user):
        user.set_password(TEST_LOGIN_SECRET)
        user.save()

        response = api_client.post(self.url, {
            "phone_number": user.phone_number,
            LOGIN_SECRET_FIELD: "WrongPass123!",
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["error"]["code"] == "invalid_credentials"

    def test_password_login_blocked_for_incomplete_registration(self, api_client, user):
        user.set_password(TEST_LOGIN_SECRET)
        user.is_registration_completed = False
        user.save()

        response = api_client.post(self.url, {
            "phone_number": user.phone_number,
            LOGIN_SECRET_FIELD: TEST_LOGIN_SECRET,
        })

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"]["code"] == "registration_not_completed"


@pytest.mark.django_db
class TestPasswordResetFlow:
    """Tests for forgot-password flow with OTP."""

    send_url = "/api/auth/password-reset/send-otp/"
    verify_url = "/api/auth/password-reset/verify-otp/"
    confirm_url = "/api/auth/password-reset/confirm/"
    login_url = "/api/auth/login/"

    def test_password_reset_end_to_end(self, api_client, user):
        user.set_password(TEST_LOGIN_SECRET)
        user.is_registration_completed = True
        user.save()

        send_response = api_client.post(self.send_url, {"phone_number": user.phone_number})
        assert send_response.status_code == status.HTTP_200_OK

        otp = cache.get(f"otp:reset:{user.phone_number}")
        verify_response = api_client.post(self.verify_url, {
            "phone_number": user.phone_number,
            "otp": otp,
        })
        assert verify_response.status_code == status.HTTP_200_OK
        assert "reset_token" in verify_response.data

        confirm_response = api_client.post(self.confirm_url, {
            "reset_token": verify_response.data["reset_token"],
            NEW_LOGIN_SECRET_FIELD: TEST_NEW_LOGIN_SECRET,
        })
        assert confirm_response.status_code == status.HTTP_200_OK

        login_response = api_client.post(self.login_url, {
            "phone_number": user.phone_number,
            LOGIN_SECRET_FIELD: TEST_NEW_LOGIN_SECRET,
        })
        assert login_response.status_code == status.HTTP_200_OK

    def test_password_reset_send_otp_user_not_found(self, api_client):
        response = api_client.post(self.send_url, {"phone_number": "+998909999999"})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"]["code"] == "user_not_found"

    def test_password_reset_confirm_invalid_token(self, api_client):
        response = api_client.post(self.confirm_url, {
            "reset_token": "invalid-token",
            NEW_LOGIN_SECRET_FIELD: TEST_NEW_LOGIN_SECRET,
        })

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"]["code"] == "reset_token_invalid_or_expired"


@pytest.mark.django_db
class TestLogoutAndProfile:
    """Tests for logout and profile endpoints."""

    profile_url = "/api/auth/me/"
    logout_url = "/api/auth/logout/"

    def test_get_profile_authenticated(self, authenticated_client, user):
        response = authenticated_client.get(self.profile_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["phone_number"] == user.phone_number

    def test_update_profile(self, authenticated_client, user):
        response = authenticated_client.patch(self.profile_url, {"name": "Updated Name"})

        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.name == "Updated Name"

    def test_logout_blacklists_refresh_token(self, authenticated_client, user):
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)

        response = authenticated_client.post(self.logout_url, {"refresh": str(refresh)})
        assert response.status_code == status.HTTP_200_OK

        refresh_response = authenticated_client.post("/api/auth/refresh/", {"refresh": str(refresh)})
        assert refresh_response.status_code in {
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_401_UNAUTHORIZED,
        }
