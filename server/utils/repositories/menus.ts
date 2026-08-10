import {
  type Menu,
  type MenuSummary,
  parseMenu,
  parseMenuSummary,
} from "../models/menu";
import { type Venue } from "../models/venue";

const MENU_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function menuSlug(venue: Venue, menuSummaryId?: number): string {
  const base = `${venue.franchise}/venues/${venue.venueRef}/sales-areas/${venue.salesAreas[0].id}/menus`;
  return menuSummaryId !== undefined ? `${base}/${menuSummaryId}` : base;
}

function parseSummaries(body: unknown): MenuSummary[] {
  return ((body as { data?: unknown[] })?.data ?? []).map(parseMenuSummary);
}

async function fetchFresh(slug: string): Promise<unknown> {
  return request(slug, { useCache: false });
}

/**
 * Fetches all menus for a venue with fallback logic, delegating the
 * "is this result useful?" decision to the caller via `hasUsefulResult`.
 *
 * 1. Return the most recent cached response younger than 24h if useful.
 * 2. Otherwise refresh from the API. If the fresh response is useful, return it.
 * 3. Otherwise return the youngest cached response that is useful, regardless of age.
 * 4. If nothing in the cache is useful, return the youngest cached response.
 *
 * `hasUsefulResult` receives the parsed summaries so the caller can fetch
 * full menus and check for drinks, or apply any other domain logic.
 */
export async function allMenusWithFallback(
  venue: Venue,
  hasUsefulResult: (summaries: MenuSummary[]) => Promise<boolean>,
): Promise<{ summaries: MenuSummary[]; cachedAt: Date | null }> {
  const slug = menuSlug(venue);
  const requestInit = { method: "GET", url: slug };

  // Step 1: recent cache hit that produces a useful result
  const recent = await getCachedResponse(requestInit, MENU_MAX_AGE_MS);
  if (recent) {
    const summaries = parseSummaries(recent.body);
    if (await hasUsefulResult(summaries)) {
      return { summaries, cachedAt: recent.createdAt };
    }
  }

  // Step 2: refresh from the API
  const fresh = await fetchFresh(slug);
  const freshSummaries = parseSummaries(fresh);
  if (await hasUsefulResult(freshSummaries)) {
    return { summaries: freshSummaries, cachedAt: new Date() };
  }

  // Steps 3 & 4: dig through the full cache history
  const history = await getAllCachedResponses(requestInit);
  for (const entry of history) {
    const summaries = parseSummaries(entry.body);
    if (await hasUsefulResult(summaries)) {
      return { summaries, cachedAt: entry.createdAt };
    }
  }

  // Nothing useful anywhere — return the youngest entry we have
  const youngest = history[0];
  if (!youngest) return { summaries: [], cachedAt: null };
  return {
    summaries: parseSummaries(youngest.body),
    cachedAt: youngest.createdAt,
  };
}

export async function allMenus(
  venue: Venue,
  maxAgeMs?: number,
): Promise<MenuSummary[]> {
  const response = (await request(menuSlug(venue), { maxAgeMs })) as {
    data: unknown[];
  };
  return response.data.map(parseMenuSummary);
}

export async function getMenu(
  venue: Venue,
  menuSummary: MenuSummary,
  maxAgeMs?: number,
): Promise<Menu> {
  const response = (await request(menuSlug(venue, menuSummary.id), {
    maxAgeMs,
  })) as {
    data: unknown;
  };
  return parseMenu(response.data);
}
