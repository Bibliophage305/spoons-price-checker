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
  maxAgeMs?: number,
): Promise<CachedResponseData | null> {
  const requestHash = makeRequestHash(request);

  const cached = await prisma.cachedResponse.findFirst({
    where: {
      cachedRequest: { requestHash },
      ...(maxAgeMs !== undefined && {
        createdAt: { gte: new Date(Date.now() - maxAgeMs) },
      }),
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
 * Used when the caller needs to inspect multiple entries (e.g. fallback logic).
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
