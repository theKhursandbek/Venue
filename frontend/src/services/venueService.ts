import api from "./api";
import type {
  VenueListResponse,
  Venue,
  AvailabilityResponse,
} from "@/types";

interface VenueFilters {
  page?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  ordering?: string;
}

export const venueService = {
  list: (filters?: VenueFilters) =>
    api.get<VenueListResponse>("/venues/", { params: filters }),

  detail: (id: number) => api.get<Venue>(`/venues/${id}/`),

  availability: (id: number, date: string) =>
    api.get<AvailabilityResponse>(`/venues/${id}/availability/`, {
      params: { date },
    }),
};
