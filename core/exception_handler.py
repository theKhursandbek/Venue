"""
Custom exception handlers for the venue-booking-backend project.
Provides consistent error response format across all endpoints.
"""

import logging

from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def _build_error_response(code: str, message: str, details=None, http_status=None):
    """Build a standardized error response."""
    error_data = {"code": code, "message": message}
    if details is not None:
        error_data["details"] = details
    return Response({"error": error_data}, status=http_status)


def _handle_http404():
    """Handle Http404 exception."""
    return _build_error_response(
        "not_found",
        "The requested resource was not found.",
        http_status=status.HTTP_404_NOT_FOUND,
    )


def _handle_permission_denied():
    """Handle PermissionDenied exception."""
    return _build_error_response(
        "permission_denied",
        "You do not have permission to perform this action.",
        http_status=status.HTTP_403_FORBIDDEN,
    )


def _handle_django_validation_error(exc):
    """Handle Django ValidationError."""
    details = exc.message_dict if hasattr(exc, "message_dict") else str(exc)
    return _build_error_response(
        "validation_error",
        "Validation error occurred.",
        details=details,
        http_status=status.HTTP_400_BAD_REQUEST,
    )


def _handle_unexpected_exception(exc, request, view):
    """Handle unexpected exceptions with logging."""
    view_name = view.__class__.__name__ if view else "Unknown"
    logger.exception(
        "Unhandled exception in %s: %s",
        view_name,
        exc,
        extra={
            "request_path": request.path if request else None,
            "request_method": request.method if request else None,
        },
    )
    return _build_error_response(
        "server_error",
        "An unexpected error occurred. Please try again later.",
        http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _handle_non_drf_exception(exc, request, view):
    """Handle exceptions not caught by DRF's default handler."""
    handlers = {
        Http404: lambda e: _handle_http404(),
        PermissionDenied: lambda e: _handle_permission_denied(),
        DjangoValidationError: _handle_django_validation_error,
    }

    for exc_type, handler in handlers.items():
        if isinstance(exc, exc_type):
            return handler(exc)

    return _handle_unexpected_exception(exc, request, view)


def _format_drf_exception(exc, response):
    """Format DRF exceptions consistently."""
    if isinstance(exc, DRFValidationError):
        response.data = {
            "error": {
                "code": "validation_error",
                "message": "Validation error occurred.",
                "details": response.data,
            }
        }
    elif isinstance(exc, APIException):
        response.data = {
            "error": {
                "code": getattr(exc, "default_code", "api_error"),
                "message": str(exc.detail) if hasattr(exc, "detail") else str(exc),
            }
        }
    return response


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error format.

    Response format:
    {
        "error": {
            "code": "error_code",
            "message": "Human readable message",
            "details": {...}  # Optional, for validation errors
        }
    }
    """
    response = drf_exception_handler(exc, context)
    request = context.get("request")
    view = context.get("view")

    if response is None:
        response = _handle_non_drf_exception(exc, request, view)
    else:
        response = _format_drf_exception(exc, response)

    # Add request ID if available (useful for debugging)
    if response is not None and request and hasattr(request, "request_id"):
        response.data["error"]["request_id"] = request.request_id

    return response
