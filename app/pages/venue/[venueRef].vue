<script setup lang="ts">
import { type VenueResult } from "~/types/drinks";

interface VenueSummary {
  venueRef: number;
  name: string;
  address: { town: string; postcode: string };
}

const route = useRoute();
const venueRef = parseInt(route.params.venueRef as string);

// Fetch the venue name from the cached summary list — edge-cached so near-instant.
// This lets the page render immediately with the correct venue name.
const { data: venues } = await useFetch<VenueSummary[]>("/api/venues");
const summary = computed(() =>
  venues.value?.find((v) => v.venueRef === venueRef),
);
const venueName = computed(() => summary.value?.name ?? "");
const venueAddress = computed(() =>
  summary.value
    ? `${summary.value.address.town}, ${summary.value.address.postcode}`
    : "",
);

// Fetch drinks without await so the page renders immediately.
const {
  data: result,
  status,
  error,
} = useFetch<VenueResult>(`/api/venues/${venueRef}`);

const loading = computed(() => status.value === "pending");
const errorMessage = computed(() =>
  error.value
    ? "Could not load drinks for this venue. It may be closed or have no menu available."
    : null,
);

useSeoMeta({
  title: computed(() =>
    venueName.value ? `${venueName.value} — Pintchecker` : "Pintchecker",
  ),
  description: computed(() =>
    venueName.value
      ? `Find the cheapest drinks at ${venueName.value}. Every drink ranked by cost per unit of alcohol.`
      : "Find the cheapest drinks at any Wetherspoons. Every drink ranked by cost per unit of alcohol.",
  ),
  ogTitle: computed(() =>
    venueName.value ? `${venueName.value} — Pintchecker` : "Pintchecker",
  ),
  ogDescription: computed(() =>
    venueName.value
      ? `Find the cheapest drinks at ${venueName.value}. Every drink ranked by cost per unit of alcohol.`
      : "Find the cheapest drinks at any Wetherspoons. Every drink ranked by cost per unit of alcohol.",
  ),
  ogUrl: `https://pintchecker.co.uk/venue/${venueRef}`,
});
useHead({
  link: [
    { rel: "canonical", href: `https://pintchecker.co.uk/venue/${venueRef}` },
  ],
});
defineOgImage("PintChecker", {
  title: computed(() => venueName.value || "Find the cheapest pint."),
  description: "Find the cheapest drink, ranked by cost per unit of alcohol.",
});
</script>

<template>
  <main class="min-h-dvh">
    <VenueSearch :initialQuery="venueName" />

    <DrinkResults
      :result="result ?? null"
      :loading="loading"
      :error="errorMessage"
    >
      <template #venue-name>
        <h2 class="font-display text-cream text-2xl leading-tight font-bold">
          {{ venueName }}
          <span
            v-if="venueAddress"
            class="text-muted ml-1 text-lg font-normal"
            >{{ venueAddress }}</span
          >
        </h2>
      </template>
    </DrinkResults>
  </main>
</template>
