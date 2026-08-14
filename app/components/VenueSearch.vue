<script setup lang="ts">
interface VenueSummary {
  venueRef: number;
  name: string;
  isClosed: boolean;
  address: { town: string; county: string; postcode: string; country: string };
}

const { data: venues } = await useFetch<VenueSummary[]>("/api/venues");

const query = ref("");
const selectedVenueRef = ref<number | null>(null);
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
  query.value = venue.name;
  selectedVenueRef.value = venue.venueRef;
  showDropdown.value = false;
  navigateTo(`/venue/${venue.venueRef}`);
}

function onBlur() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 150);
}

// Allow parent to pre-fill the search box (e.g. on the venue page)
const props = defineProps<{ initialQuery?: string }>();
if (props.initialQuery) query.value = props.initialQuery;
</script>

<template>
  <header class="flex flex-col items-center gap-6 px-6 pt-20 pb-16">
    <HeroHeading />

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
          @input="showDropdown = true"
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
        v-if="query.length > 1 && filtered.length === 0 && !selectedVenueRef"
        class="text-muted mt-2 text-left text-sm"
      >
        No venues found for "{{ query }}"
      </p>
    </div>

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
</template>
