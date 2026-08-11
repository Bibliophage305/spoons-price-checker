import { createHash } from "node:crypto";
import { prisma } from "./db";

interface CachedRequestInit {
  method: string;
  url: string;
  body?: Record<string, unknown> | null;
}

export interface CachedResponseData {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  createdAt: Date;
}

function makeRequestHash({ method, url, body }: CachedRequestInit): string {
  const canonical = JSON.stringify(
    {
      method: method.toUpperCase(),
      url,
      body: body ?? "",
    },
    Object.keys({ method, url, body: body ?? "" }).sort(),
  );
  return createHash("sha256").update(canonical).digest("hex");
}

export async function getCachedResponse(
  request: CachedRequestInit,
  maxAgeMs: number,
): Promise<CachedResponseData | null> {
  const requestHash = makeRequestHash(request);

  const cached = await prisma.cachedResponse.findFirst({
    where: {
      cachedRequest: { requestHash },
      createdAt: { gte: new Date(Date.now() - maxAgeMs) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!cached) return null;

  return {
    status: cached.statusCode,
    headers: cached.headers as Record<string, string>,
    body: cached.body,
    createdAt: cached.createdAt,
  };
}

/**
 * Returns all cached responses for a request, newest first.
 */
export async function getAllCachedResponses(
  request: CachedRequestInit,
): Promise<CachedResponseData[]> {
  const requestHash = makeRequestHash(request);

  const responses = await prisma.cachedResponse.findMany({
    where: { cachedRequest: { requestHash } },
    orderBy: { createdAt: "desc" },
  });

  return responses.map((r) => ({
    status: r.statusCode,
    headers: r.headers as Record<string, string>,
    body: r.body,
    createdAt: r.createdAt,
  }));
}

/**
 * Fetches a response with staleness-aware fallback logic, delegating the
 * "is this response useful?" decision to the caller.
 *
 * 1. Return the most recent cached response younger than maxAgeMs if useful.
 * 2. Otherwise fetch fresh from the API. If useful, return it.
 * 3. Otherwise return the youngest cached response that is useful, regardless of age.
 * 4. If nothing is useful, return the youngest cached response unconditionally.
 * 5. If the cache is empty and the fresh fetch wasn't useful, return the fresh response.
 *
 * The caller supplies:
 *   - `fetchFresh`: a function that fetches and caches a new response, returning it
 *   - `isUseful`: a predicate on CachedResponseData — return true to accept this response
 *   - `maxAgeMs`: how old a cached response can be before we try refreshing (default 24h)
 */
export async function getCachedResponseWithFallback(
  request: CachedRequestInit,
  fetchFresh: () => Promise<CachedResponseData>,
  isUseful: (response: CachedResponseData) => Promise<boolean>,
  maxAgeMs: number = 24 * 60 * 60 * 1000,
): Promise<CachedResponseData> {
  // Step 1: recent cache hit that is useful
  const recent = await getCachedResponse(request, maxAgeMs);
  if (recent && (await isUseful(recent))) return recent;

  // Step 2: fresh fetch
  const fresh = await fetchFresh();
  if (await isUseful(fresh)) return fresh;

  // Steps 3 & 4: dig through the full cache history
  const history = await getAllCachedResponses(request);
  for (const entry of history) {
    if (await isUseful(entry)) return entry;
  }

  // Step 5: nothing useful anywhere — youngest cache entry or the fresh response
  return history[0] ?? fresh;
}

export async function cacheResponse(
  request: CachedRequestInit,
  response: Omit<CachedResponseData, "createdAt">,
): Promise<void> {
  const requestHash = makeRequestHash(request);

  await prisma.$transaction(async (tx) => {
    const cachedRequest = await tx.cachedRequest.upsert({
      where: { requestHash },
      update: {},
      create: {
        requestHash,
        method: request.method.toUpperCase(),
        url: request.url,
      },
    });

    await tx.cachedResponse.create({
      data: {
        requestId: cachedRequest.id,
        statusCode: response.status,
        headers: response.headers,
        body: response.body as object,
      },
    });
  });
}
