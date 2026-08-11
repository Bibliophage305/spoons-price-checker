function menuSlug(venue: Venue, menuSummaryId?: number): string {
  const base = `${venue.franchise}/venues/${venue.venueRef}/sales-areas/${venue.salesAreas[0].id}/menus`;
  return menuSummaryId !== undefined ? `${base}/${menuSummaryId}` : base;
}

function parseSummaries(body: unknown): MenuSummary[] {
  return ((body as { data?: unknown[] })?.data ?? []).map(parseMenuSummary);
}

function parseMenuBody(body: unknown): Menu {
  return parseMenu((body as { data: unknown }).data);
}

function menuIsNotEmpty(menu: Menu): boolean {
  for (const category of menu.categories) {
    for (const itemGroup of category.itemGroups) {
      if (itemGroup.items.length > 0) return true;
    }
  }
  return false;
}

function menuHasAlcohol(menu: Menu): boolean {
  for (const category of menu.categories) {
    for (const itemGroup of category.itemGroups) {
      for (const item of itemGroup.items) {
        if (item.itemType === "ale") return true;
        if (item.itemType === "product" && item.ageRestriction > 0) return true;
      }
    }
  }
  return false;
}

/**
 * Fetches all menu summaries for a venue with staleness-aware fallback.
 * A result is considered useful if the menus it yields contain at least one
 * alcoholic item (an ale, or a product with an age restriction).
 */
export async function allMenus(
  venue: Venue,
  maxAgeMs: number = CACHE_MAX_AGE_MS,
): Promise<{ summaries: MenuSummary[]; cachedAt: Date | null }> {
  const slug = menuSlug(venue);
  const requestInit = { method: "GET", url: slugToUrl(slug) };

  const response = await getCachedResponseWithFallback(
    requestInit,
    makeFreshFetcher(slug),
    async (r) => {
      const summaries = parseSummaries(r.body);
      for (const ms of summaries) {
        const { menu } = await getMenu(venue, ms, maxAgeMs);
        if (menuHasAlcohol(menu)) {
          return true;
        }
      }
      return false;
    },
    maxAgeMs,
  );

  return {
    summaries: parseSummaries(response.body),
    cachedAt: response.createdAt,
  };
}

/**
 * Fetches a single full menu with staleness-aware fallback.
 * A result is considered useful if the menu contains at least one alcoholic item.
 */
export async function getMenu(
  venue: Venue,
  menuSummary: MenuSummary,
  maxAgeMs: number = CACHE_MAX_AGE_MS,
): Promise<{ menu: Menu; cachedAt: Date | null }> {
  const slug = menuSlug(venue, menuSummary.id);
  const requestInit = { method: "GET", url: slugToUrl(slug) };

  const response = await getCachedResponseWithFallback(
    requestInit,
    makeFreshFetcher(slug),
    async (r) => menuIsNotEmpty(parseMenuBody(r.body)),
    maxAgeMs,
  );

  return {
    menu: parseMenuBody(response.body),
    cachedAt: response.createdAt,
  };
}
