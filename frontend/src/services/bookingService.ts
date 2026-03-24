import api from "./api";
import type {
  BookingCreateRequest,
  BookingDetail,
  BookingListResponse,
} from "@/types";

export const bookingService = {
  list: (page?: number) =>
    api.get<BookingListResponse>("/bookings/", { params: { page } }),

  create: (data: BookingCreateRequest) =>
    api.post<BookingDetail>("/bookings/", data),

  detail: (id: number) => api.get<BookingDetail>(`/bookings/${id}/`),

  cancel: (id: number) => api.patch<BookingDetail>(`/bookings/${id}/cancel/`),
};
