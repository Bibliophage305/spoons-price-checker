export async function allVenues(
  maxAgeMs: number = CACHE_MAX_AGE_MS,
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
  maxAgeMs: number = CACHE_MAX_AGE_MS,
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
