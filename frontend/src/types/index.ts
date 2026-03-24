// ============================================
// API Types matching Django REST Framework
// ============================================

// Auth
export interface SendOTPRequest {
  phone_number: string;
}

export interface SendOTPResponse {
  message: string;
  phone_number: string;
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp: string;
}

export interface VerifyOTPResponse {
  phone_number: string;
  registration_token: string;
}

export interface PasswordLoginRequest {
  phone_number: string;
  password: string;
}

export interface CompleteRegistrationRequest {
  registration_token: string;
  name: string;
  password: string;
}

export interface PasswordResetConfirmRequest {
  reset_token: string;
  new_password: string;
}

export interface PasswordResetVerifyResponse {
  phone_number: string;
  reset_token: string;
}

export interface AuthSuccessResponse {
  access: string;
  refresh: string;
  user: User;
  requires_registration: boolean;
}

export interface LogoutRequest {
  refresh: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

// User
export interface User {
  id: number;
  phone_number: string;
  name: string | null;
  is_active?: boolean;
  is_verified: boolean;
  is_registration_completed: boolean;
  created_at: string;
  date_joined?: string;
}

// Venue
export interface Venue {
  id: number;
  name: string;
  address: string;
  description?: string;
  price_per_hour: string;
  images: string[];
  amenities: string[];
  is_active: boolean;
  image_count?: number;
  primary_image?: string | null;
  all_image_urls?: string[];
  all_images?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface VenueListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Venue[];
}

// Availability
export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface AvailabilityResponse {
  venue_id: number;
  date: string;
  venue_name?: string;
  operating_hours?: {
    start: string;
    end: string;
  };
  time_slots: TimeSlot[];
}

// Booking
export interface Booking {
  id: number;
  venue: number;
  venue_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  updated_at?: string;
}

export interface BookingDetail {
  id: number;
  venue: Venue;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  duration_hours: number;
  can_cancel: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingCreateRequest {
  venue: number;
  booking_date: string;
  start_time: string;
  end_time: string;
}

export interface BookingListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Booking[];
}

// API Error
export interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
