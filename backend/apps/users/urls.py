"""
URL configuration for users app.
"""

from django.urls import path

from .views import (
    CompleteRegistrationView,
    LogoutView,
    PasswordLoginView,
    PasswordResetConfirmView,
    PasswordResetSendOTPView,
    PasswordResetVerifyOTPView,
    RefreshTokenView,
    SendOTPView,
    UserProfileView,
    VerifyOTPView,
)

urlpatterns = [
    path("send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("complete-registration/", CompleteRegistrationView.as_view(), name="complete-registration"),
    path("login/", PasswordLoginView.as_view(), name="password-login"),
    path("password-reset/send-otp/", PasswordResetSendOTPView.as_view(), name="password-reset-send-otp"),
    path("password-reset/verify-otp/", PasswordResetVerifyOTPView.as_view(), name="password-reset-verify-otp"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", RefreshTokenView.as_view(), name="token-refresh"),
    path("me/", UserProfileView.as_view(), name="user-profile"),
]
