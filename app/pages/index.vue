<script setup lang="ts">
import { type SortKey } from "~/types/drinks";
// ── URL state ──────────────────────────────────────────────────────────────
// venueRef lives in the query string (?v=532) so results are shareable.
const route = useRoute();
const router = useRouter();

function getVenueRefFromRoute(): number | null {
  const v = route.query.v;
  const n = parseInt(Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));
  return isNaN(n) ? null : n;
}

// ── SEO ────────────────────────────────────────────────────────────────────
useSeoMeta({
  title: "Pintchecker - Find the cheapest pint at Wetherspoons",
  description:
    "Find the cheapest drinks at any Wetherspoons. Every drink ranked by cost per unit of alcohol.",
  ogTitle: "Pintchecker - Find the cheapest pint at Wetherspoons",
  ogDescription:
    "Find the cheapest drinks at any Wetherspoons. Every drink ranked by cost per unit of alcohol.",
  ogUrl: "https://pintchecker.co.uk/",
  twitterTitle: "Pintchecker - Find the cheapest pint at Wetherspoons",
  twitterDescription:
    "Find the cheapest drinks at any Wetherspoons. Every drink ranked by cost per unit of alcohol.",
});
useHead({ link: [{ rel: "canonical", href: "https://pintchecker.co.uk/" }] });
defineOgImage(
  "PintChecker",
  {
    title: "Find the cheapest pint.",
    description: "Every drink, ranked by cost per unit of alcohol.",
  },
  [
    { key: "og" },
    // Square for WhatsApp
    { key: "whatsapp", width: 800, height: 800 },
  ],
);

// ── Types ──────────────────────────────────────────────────────────────────
interface VenueSummary {
  venueRef: number;
  name: string;
  franchise: string;
  isClosed: boolean;
  address: { town: string; county: string; postcode: string; country: string };
}

interface VenueResult {
  venue: {
    venueRef: number;
    name: string;
    address: { town: string; postcode: string };
    currency: { symbol: string };
  };
  drinks: Drink[];
  cachedAt: string | null;
}

// ── Venue search ───────────────────────────────────────────────────────────
const { data: venues } = await useFetch<VenueSummary[]>("/api/venues");
const query = ref("");
const selectedVenue = ref<VenueSummary | null>(null);
const showDropdown = ref(false);

const filtered = computed(() => {
  if (!query.value.trim() || !venues.value) return [];
  const q = query.value.toLowerCase();
  return venues.value
    .filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.address.town.toLowerCase().includes(q) ||
        v.address.postcode.toLowerCase().includes(q),
    )
    .slice(0, 12);
});

function selectVenue(venue: VenueSummary) {
  selectedVenue.value = venue;
  query.value = venue.name;
  showDropdown.value = false;
  router.push({ query: { v: venue.venueRef } });
  loadDrinks(venue.venueRef);
}

function onInput() {
  selectedVenue.value = null;
  result.value = null;
  showDropdown.value = true;
  router.replace({ query: {} });
}

function onBlur() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 150);
}

// ── Drinks ─────────────────────────────────────────────────────────────────
const result = ref<VenueResult | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function loadDrinks(venueRef: number) {
  loading.value = true;
  error.value = null;
  result.value = null;
  try {
    result.value = await $fetch<VenueResult>(`/api/venues/${venueRef}`);
  } catch {
    error.value =
      "Could not load drinks for this venue. It may be closed or have no menu available.";
  } finally {
    loading.value = false;
  }
}

// Load from URL on first render
const initialVenueRef = getVenueRefFromRoute();
if (initialVenueRef !== null) {
  await loadDrinks(initialVenueRef);
  // Pre-fill the search box if we have venue data
  if (result.value && venues.value) {
    const match = venues.value.find((v) => v.venueRef === initialVenueRef);
    if (match) {
      selectedVenue.value = match;
      query.value = match.name;
    }
  }
}

// ── Sorting ────────────────────────────────────────────────────────────────
const sortKey = ref<SortKey>("costPerUnit");
const sortDir = ref<"asc" | "desc">("asc");
const filterName = ref("");

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

function onCardSort(key: SortKey, dir: "asc" | "desc") {
  sortKey.value = key;
  sortDir.value = dir;
}

function sortIcon(key: SortKey) {
  if (sortKey.value !== key) return "↕";
  return sortDir.value === "asc" ? "↑" : "↓";
}

const filteredDrinks = computed(() => {
  if (!result.value) return [];
  let drinks = [...result.value.drinks];
  if (filterName.value.trim()) {
    const q = filterName.value.toLowerCase();
    drinks = drinks.filter((d) => d.itemName.toLowerCase().includes(q));
  }
  drinks.sort((a, b) => {
    const av = a[sortKey.value] as number | string;
    const bv = b[sortKey.value] as number | string;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir.value === "asc" ? cmp : -cmp;
  });
  return drinks;
});

// ── Pagination ─────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 20, 50, null] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

const pageSize = ref<PageSize>(10);
const page = ref(1);

const totalPages = computed(() =>
  pageSize.value === null
    ? 1
    : Math.ceil(filteredDrinks.value.length / pageSize.value),
);

const paginatedDrinks = computed(() => {
  if (pageSize.value === null) return filteredDrinks.value;
  const start = (page.value - 1) * pageSize.value;
  return filteredDrinks.value.slice(start, start + pageSize.value);
});

watch([filteredDrinks, pageSize], () => {
  page.value = 1;
});

const currencySymbol = computed(
  () => result.value?.venue.currency.symbol ?? "£",
);

function pageSizeLabel(size: PageSize) {
  return size === null ? "Show all" : `Show ${size}`;
}

const cachedAtLabel = computed(() => {
  if (!result.value?.cachedAt) return "just now";
  const date = new Date(result.value.cachedAt);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>

<template>
  <main class="min-h-dvh">
    <!-- ── Hero ── -->
    <header class="flex flex-col items-center gap-6 px-6 pt-20 pb-16">
      <HeroHeading />

      <!-- Search -->
      <div class="relative w-full max-w-lg">
        <div class="relative flex items-center">
          <svg
            class="text-muted pointer-events-none absolute left-4 h-4 w-4 shrink-0"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8.5"
              cy="8.5"
              r="5.5"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M13 13l3.5 3.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <input
            v-model="query"
            type="text"
            placeholder="Search by pub name, town or postcode…"
            autocomplete="off"
            spellcheck="false"
            class="text-cream placeholder:text-muted bg-search-bg border-border focus:border-amber w-full rounded-lg border border-solid p-4 pl-10 focus:outline-none"
            @input="onInput"
            @focus="showDropdown = true"
            @blur="onBlur"
            aria-label="Search for a Wetherspoons venue"
            aria-autocomplete="list"
            :aria-expanded="showDropdown && filtered.length > 0"
          />
        </div>

        <ul
          v-if="showDropdown && filtered.length > 0"
          class="border-border bg-search-bg divide-border absolute z-50 mt-2 w-full divide-y divide-solid overflow-hidden rounded-lg border shadow-lg"
          role="listbox"
        >
          <li
            v-for="venue in filtered"
            :key="venue.venueRef"
            role="option"
            class="hover:bg-bg-hover flex cursor-pointer items-baseline gap-2 px-4 py-3"
            @mousedown.prevent="selectVenue(venue)"
          >
            <span
              class="text-cream flex-1 overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap"
            >
              {{ venue.name }}
            </span>
            <span class="text-muted text-xs whitespace-nowrap">
              {{ venue.address.town }}, {{ venue.address.postcode }}
            </span>
          </li>
        </ul>

        <p
          v-if="query.length > 1 && filtered.length === 0 && !selectedVenue"
          class="text-muted mt-2 text-left text-sm"
        >
          No venues found for "{{ query }}"
        </p>
      </div>

      <!-- Nav links -->
      <nav class="flex items-center gap-6 text-sm">
        <NuxtLink
          to="/about"
          class="text-muted hover:text-cream transition-colors"
          >About</NuxtLink
        >
        <NuxtLink
          to="/support"
          class="text-amber hover:text-cream transition-colors"
          >Support the site ☕</NuxtLink
        >
      </nav>
    </header>

    <!-- ── Loading ── -->
    <section
      v-if="loading"
      class="text-muted flex flex-col items-center gap-4 px-6 py-16 text-sm"
    >
      <div
        class="border-border border-t-amber h-8 w-8 animate-spin rounded-full border-2"
        aria-label="Loading drinks…"
      />
      <p>Pulling the menu…</p>
    </section>

    <!-- ── Error ── -->
    <section
      v-else-if="error"
      class="text-danger flex flex-col items-center gap-4 px-6 py-16 text-sm"
    >
      <p>{{ error }}</p>
    </section>

    <!-- ── Results ── -->
    <section v-else-if="result" class="mx-auto max-w-5xl px-6 pb-16">
      <div
        class="border-border mb-6 flex flex-wrap items-start justify-between gap-6 border-b pb-6"
      >
        <div>
          <h2 class="font-display text-cream text-2xl leading-tight font-bold">
            {{ result.venue.name }}, {{ result.venue.address.town }},
            {{ result.venue.address.postcode }}
          </h2>
          <p class="text-muted mt-1 text-xs">
            {{ filteredDrinks.length }} drink{{
              filteredDrinks.length === 1 ? "" : "s"
            }}
            · prices fetched {{ cachedAtLabel }}
          </p>
        </div>
        <input
          v-model="filterName"
          type="text"
          placeholder="Filter by drink name…"
          class="bg-search-bg border-border focus:border-amber text-cream placeholder:text-muted rounded-lg border border-solid px-3 py-2 text-sm focus:outline-none"
          aria-label="Filter drinks by name"
        />
      </div>

      <!-- Table (md+) / Cards (mobile) -->
      <div class="overflow-x-auto">
        <Table
          :currencySymbol="currencySymbol"
          :paginatedDrinks="paginatedDrinks"
          :toggleSort="toggleSort"
          :sortIcon="sortIcon"
          class="hidden md:block"
        />
        <Cards
          :currencySymbol="currencySymbol"
          :paginatedDrinks="paginatedDrinks"
          class="md:hidden"
          @sort="onCardSort"
        />
        <p
          v-if="filteredDrinks.length === 0"
          class="text-muted px-4 py-8 text-center text-sm"
        >
          No drinks match your filters.
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredDrinks.length > 0"
        class="border-border mt-4 flex flex-wrap items-center justify-between gap-4 border-t pt-4"
      >
        <div class="flex gap-1">
          <button
            v-for="size in PAGE_SIZE_OPTIONS"
            :key="size ?? 'all'"
            class="hover:text-cream hover:border-amber cursor-pointer rounded-md border border-solid px-3 py-2 text-xs"
            :class="
              pageSize === size
                ? 'bg-active-button border-amber text-cream'
                : 'border-border text-muted bg-transparent'
            "
            @click="pageSize = size"
          >
            {{ pageSizeLabel(size) }}
          </button>
        </div>

        <div
          v-if="pageSize !== null && totalPages > 1"
          class="flex items-center gap-3"
        >
          <button
            class="border-border text-cream enabled:hover:bg-bg-hover enabled:hover:border-amber flex size-8 cursor-pointer items-center justify-center rounded-md border border-solid bg-transparent text-lg disabled:cursor-default disabled:opacity-30"
            :disabled="page === 1"
            @click="page--"
            aria-label="Previous page"
          >
            ‹
          </button>
          <span class="text-muted min-w-16 text-center text-sm tabular-nums"
            >{{ page }} / {{ totalPages }}</span
          >
          <button
            class="border-border text-cream enabled:hover:bg-bg-hover enabled:hover:border-amber flex size-8 cursor-pointer items-center justify-center rounded-md border border-solid bg-transparent text-lg disabled:cursor-default disabled:opacity-30"
            :disabled="page === totalPages"
            @click="page++"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
