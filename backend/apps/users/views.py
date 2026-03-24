"""
Views for users app.
"""

from typing import cast

from django.contrib.auth import authenticate
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from core.exceptions import (
    InvalidCredentialsException,
    RegistrationNotCompletedException,
    RegistrationTokenInvalidException,
    ResetTokenInvalidException,
    UserAlreadyRegisteredException,
    UserNotFoundException,
)

from .models import User
from .serializers import (
    CompleteRegistrationSerializer,
    LogoutSerializer,
    OTPVerifySerializer,
    PasswordLoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetVerifyOTPResponseSerializer,
    PhoneNumberSerializer,
    RegistrationVerifyOTPResponseSerializer,
    TokenResponseSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from .services import OTPService


def _build_auth_response(user: User, refresh: RefreshToken) -> dict:
    """Build a consistent auth response payload."""
    requires_registration = not user.is_registration_completed
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
        "requires_registration": requires_registration,
    }


class SendOTPView(APIView):
    """
    Send OTP for registration.
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        request=PhoneNumberSerializer,
        responses={
            200: OpenApiResponse(description="OTP sent successfully"),
            400: OpenApiResponse(description="Invalid phone number"),
            429: OpenApiResponse(description="Rate limit exceeded"),
        },
        summary="Send OTP",
        description="Send registration OTP to provided phone number.",
    )
    def post(self, request):
        serializer = PhoneNumberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]

        existing_user = User.objects.filter(phone_number=phone_number).first()
        if existing_user and existing_user.is_registration_completed:
            raise UserAlreadyRegisteredException

        OTPService.send_otp(phone_number, purpose="register")
        
        return Response(
            {"message": "OTP sent successfully", "phone_number": phone_number},
            status=status.HTTP_200_OK,
        )


class VerifyOTPView(APIView):
    """
    Verify registration OTP and return short-lived registration token.
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        request=OTPVerifySerializer,
        responses={
            200: RegistrationVerifyOTPResponseSerializer,
            400: OpenApiResponse(description="Invalid OTP or phone number"),
        },
        summary="Verify Registration OTP",
        description="Verify registration OTP and receive registration token.",
    )
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]
        otp = serializer.validated_data["otp"]

        # Verify OTP
        OTPService.verify_otp(phone_number, otp, purpose="register")

        existing_user = User.objects.filter(phone_number=phone_number).first()
        if existing_user and existing_user.is_registration_completed:
            raise UserAlreadyRegisteredException

        registration_token = OTPService.create_registration_token(phone_number)
        return Response(
            {
                "registration_token": registration_token,
                "phone_number": phone_number,
            },
            status=status.HTTP_200_OK,
        )


class CompleteRegistrationView(APIView):
    """
    Complete registration after OTP verification.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=CompleteRegistrationSerializer,
        responses={200: UserSerializer},
        summary="Complete Registration",
        description="Complete registration by setting name and password with registration token.",
    )
    def post(self, request):
        serializer = CompleteRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        registration_token = serializer.validated_data["registration_token"]
        phone_number = OTPService.consume_registration_token(registration_token)
        if not phone_number:
            raise RegistrationTokenInvalidException

        user, _ = User.objects.get_or_create(phone_number=phone_number)
        user.name = serializer.validated_data["name"]
        user.set_password(serializer.validated_data["password"])
        user.is_verified = True
        user.is_registration_completed = True
        user.save()

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class PasswordLoginView(APIView):
    """
    Login with phone number and password.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordLoginSerializer,
        responses={
            200: TokenResponseSerializer,
            400: OpenApiResponse(description="Registration not completed"),
            401: OpenApiResponse(description="Invalid credentials"),
        },
        summary="Login with Password",
        description="Login using phone number and password.",
    )
    def post(self, request):
        serializer = PasswordLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]
        password = serializer.validated_data["password"]

        authenticated_user = authenticate(
            request=request,
            phone_number=phone_number,
            password=password,
        )
        if authenticated_user is None:
            raise InvalidCredentialsException

        user = cast(User, authenticated_user)

        if not user.is_registration_completed:
            raise RegistrationNotCompletedException

        refresh = RefreshToken.for_user(user)
        return Response(_build_auth_response(user, refresh), status=status.HTTP_200_OK)


class PasswordResetSendOTPView(APIView):
    """
    Send OTP for password reset.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=PhoneNumberSerializer,
        responses={
            200: OpenApiResponse(description="OTP sent successfully"),
            400: OpenApiResponse(description="User not found"),
        },
        summary="Send Password Reset OTP",
        description="Send OTP for password reset.",
    )
    def post(self, request):
        serializer = PhoneNumberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]

        user = User.objects.filter(phone_number=phone_number, is_registration_completed=True).first()
        if not user:
            raise UserNotFoundException

        OTPService.send_otp(phone_number, purpose="reset")
        return Response(
            {"message": "OTP sent successfully", "phone_number": phone_number},
            status=status.HTTP_200_OK,
        )


class PasswordResetVerifyOTPView(APIView):
    """
    Verify password reset OTP and return reset token.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=OTPVerifySerializer,
        responses={
            200: PasswordResetVerifyOTPResponseSerializer,
            400: OpenApiResponse(description="Invalid OTP or phone number"),
        },
        summary="Verify Password Reset OTP",
        description="Verify password reset OTP and receive reset token.",
    )
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data["phone_number"]
        otp = serializer.validated_data["otp"]

        OTPService.verify_otp(phone_number, otp, purpose="reset")

        user = User.objects.filter(phone_number=phone_number, is_registration_completed=True).first()
        if not user:
            raise UserNotFoundException

        reset_token = OTPService.create_reset_token(phone_number)
        return Response(
            {
                "reset_token": reset_token,
                "phone_number": phone_number,
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    Set a new password after password reset OTP verification.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses={200: OpenApiResponse(description="Password reset successful")},
        summary="Confirm Password Reset",
        description="Set a new password using reset token.",
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = OTPService.consume_reset_token(serializer.validated_data["reset_token"])
        if not phone_number:
            raise ResetTokenInvalidException

        user = User.objects.filter(phone_number=phone_number, is_registration_completed=True).first()
        if not user:
            raise UserNotFoundException

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Logout by blacklisting refresh token.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=LogoutSerializer,
        responses={200: OpenApiResponse(description="Logged out successfully")},
        summary="Logout",
        description="Invalidate the provided refresh token.",
    )
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(APIView):
    """
    Refresh access token using refresh token.
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        request={"type": "object", "properties": {"refresh": {"type": "string"}}},
        responses={
            200: {"type": "object", "properties": {"access": {"type": "string"}}},
            401: OpenApiResponse(description="Invalid refresh token"),
        },
        summary="Refresh Token",
        description="Get a new access token using refresh token.",
    )
    def post(self, request):
        refresh_token = request.data.get("refresh")
        
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response(
                {"access": str(refresh.access_token)},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"error": "Invalid refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user's profile.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return UserUpdateSerializer
        return UserSerializer
    
    def get_object(self):
        return self.request.user
    
    @extend_schema(
        responses={200: UserSerializer},
        summary="Get User Profile",
        description="Get current authenticated user's profile.",
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        request=UserUpdateSerializer,
        responses={200: UserSerializer},
        summary="Update User Profile",
        description="Update current authenticated user's profile.",
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)
    
    def put(self, request, *args, **kwargs):
        """Disable PUT method, only PATCH allowed."""
        return Response(
            {"error": "Method not allowed. Use PATCH instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )
