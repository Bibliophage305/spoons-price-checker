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
</script>

<template>
  <main class="min-h-dvh">
    <VenueSearch />
  </main>
</template>
