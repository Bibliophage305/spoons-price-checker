import { type CachedResponseData } from "../cache";
import { slugToUrl } from "../api";
import {
  type Venue,
  type VenueSummary,
  parseVenue,
  parseVenueSummary,
} from "../models/venue";

const VENUE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function makeFreshFetcher(slug: string): () => Promise<CachedResponseData> {
  return async () => {
    const body = await request(slug, { useCache: false });
    return { status: 200, headers: {}, body, createdAt: new Date() };
  };
}

export async function allVenues(
  maxAgeMs: number = VENUE_MAX_AGE_MS,
): Promise<VenueSummary[]> {
  const slug = "venues";
  const requestInit = { method: "GET", url: slugToUrl(slug) };

  const response = await getCachedResponseWithFallback(
    requestInit,
    makeFreshFetcher(slug),
    async (r) => {
      const data = (r.body as { data?: unknown[] })?.data;
      return Array.isArray(data) && data.length > 0;
    },
    maxAgeMs,
  );

  return (response.body as { data: unknown[] }).data.map(parseVenueSummary);
}

export async function getVenue(
  venue: VenueSummary,
  maxAgeMs: number = VENUE_MAX_AGE_MS,
): Promise<Venue> {
  const slug = `venues/${venue.venueRef}`;
  const requestInit = { method: "GET", url: slugToUrl(slug) };

  const response = await getCachedResponseWithFallback(
    requestInit,
    makeFreshFetcher(slug),
    async (r) => {
      const data = (r.body as { data?: { salesAreas?: unknown[] } })?.data;
      return Array.isArray(data?.salesAreas) && data.salesAreas.length > 0;
    },
    maxAgeMs,
  );

  return parseVenue((response.body as { data: unknown }).data);
}
