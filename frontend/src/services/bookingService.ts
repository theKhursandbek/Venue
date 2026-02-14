import api from "./api";
import type {
  BookingCreateRequest,
  Booking,
  BookingListResponse,
} from "@/types";

export const bookingService = {
  list: (page?: number) =>
    api.get<BookingListResponse>("/bookings/", { params: { page } }),

  create: (data: BookingCreateRequest) =>
    api.post<Booking>("/bookings/", data),

  detail: (id: number) => api.get<Booking>(`/bookings/${id}/`),

  cancel: (id: number) => api.post<Booking>(`/bookings/${id}/cancel/`),
};
