import { request } from "../api";
import {
  type Venue,
  type VenueSummary,
  parseVenue,
  parseVenueSummary,
} from "../models/venue";

export async function allVenues(maxAgeMs?: number): Promise<VenueSummary[]> {
  const response = (await request("venues", { maxAgeMs })) as {
    data: unknown[];
  };
  return response.data.map(parseVenueSummary);
}

export async function getVenue(
  venue: VenueSummary,
  maxAgeMs?: number,
): Promise<Venue> {
  const response = (await request(`venues/${venue.venueRef}`, {
    maxAgeMs,
  })) as {
    data: unknown;
  };
  return parseVenue(response.data);
}
