<!-- app/components/DrinkResults.vue -->
<!-- Renders the filtered/sorted/paginated drinks table or cards. -->
<!-- Accepts loading and error as named slots so the parent controls those states. -->
<script setup lang="ts">
import { type SortKey, type VenueResult } from "~/types/drinks";

const props = defineProps<{
  result: VenueResult | null;
  loading: boolean;
  error: string | null;
}>();

// Sorting
const sortKey = ref<SortKey>("costPerUnit");
const sortDir = ref<"asc" | "desc">("asc");

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

// Filter
const filterName = ref("");
const filterDisabled = computed(() => props.loading || !props.result);

const filteredDrinks = computed(() => {
  if (!props.result) return [];
  let drinks = [...props.result.drinks];
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

// Pagination
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
  () => props.result?.venue.currency.symbol ?? "£",
);

function pageSizeLabel(size: PageSize) {
  return size === null ? "Show all" : `Show ${size}`;
}

const cachedAtLabel = computed(() => {
  if (!props.result?.cachedAt) return "just now";
  const date = new Date(props.result.cachedAt);
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
  <section class="mx-auto max-w-5xl px-6 pb-16">
    <div
      class="border-border mb-6 flex flex-wrap items-start justify-between gap-6 border-b pb-6"
    >
      <div>
        <slot name="venue-name" />
        <p v-if="result" class="text-muted mt-1 text-xs">
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
        :disabled="filterDisabled"
        class="bg-search-bg border-border focus:border-amber text-cream placeholder:text-muted rounded-lg border border-solid px-3 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Filter drinks by name"
      />
    </div>

    <div
      v-if="loading"
      class="text-muted flex flex-col items-center gap-4 py-16 text-sm"
    >
      <div
        class="border-border border-t-amber h-8 w-8 animate-spin rounded-full border-2"
        aria-label="Loading drinks…"
      />
      <p>Pulling the menu…</p>
    </div>

    <div
      v-else-if="error"
      class="text-danger flex flex-col items-center gap-4 py-16 text-sm"
    >
      <p>{{ error }}</p>
    </div>

    <!-- Results -->
    <template v-else-if="result">
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
    </template>
  </section>
</template>
