import { getCachedResponse, cacheResponse } from "./cache";

const API_ENDPOINT = "https://ca.jdw-apps.net/api/v0.1/";
const API_HEADERS = {
	Authorization: "Bearer 1|SFS9MMnn5deflq0BMcUTSijwSMBB4mc7NSG2rOhqb2765466",
	"User-Agent": "Wetherspoons API Client",
};

const RETRYABLE_STATUS_CODES = new Set([403, 429]);
const RETRY_ATTEMPTS = 3;
const RETRY_MIN_MS = 5_000;
const RETRY_MAX_MS = 50_000;

function retryDelay(attempt: number): number {
	// Exponential backoff: 5s, 10s, 20s... capped at 50s
	return Math.min(RETRY_MIN_MS * 2 ** attempt, RETRY_MAX_MS);
}

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function request(
	slug: string,
	{
		verb = "GET",
		params,
		useCache = true,
		maxAgeMs,
	}: {
		verb?: string;
		params?: Record<string, string | number>;
		useCache?: boolean;
		maxAgeMs?: number;
	} = {},
): Promise<unknown> {
	const normalised = slug.replace(/^\//, "");
	const url = new URL(normalised, API_ENDPOINT);

	if (params) {
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, String(value));
		}
	}

	const requestInit = { method: verb, url: url.toString() };

	if (useCache) {
		const cached = await getCachedResponse(requestInit, maxAgeMs);
		if (cached !== null) {
			if (cached.status >= 400) {
				throw new Error(`Cached error response: ${cached.status}`);
			}
			return cached.body;
		}
	}

	let lastError: Error | null = null;

	for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
		if (attempt > 0) {
			await sleep(retryDelay(attempt - 1));
		}

		const response = await fetch(url.toString(), {
			method: verb,
			headers: API_HEADERS,
		});

		if (RETRYABLE_STATUS_CODES.has(response.status)) {
			lastError = new Error(`HTTP ${response.status}`);
			continue;
		}

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${url.toString()}`);
		}

		const body = await response.json();

		await cacheResponse(requestInit, {
			status: response.status,
			headers: Object.fromEntries(response.headers.entries()),
			body,
		});

		return body;
	}

	throw lastError ?? new Error(`Request failed after ${RETRY_ATTEMPTS} attempts`);
}