<!-- app/components/HeroHeading.vue -->
<!-- Used in both index.vue and the OG image template -->
<script setup lang="ts">
defineProps<{
  subtitle?: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center gap-3 text-center">
    <p class="text-amber text-xs font-semibold tracking-widest uppercase">
      Wetherspoons
    </p>
    <h1
      class="font-display text-cream font-black tracking-tight"
      style="font-size: clamp(2.5rem, 7vw, 5rem); line-height: 1.05"
    >
      Find the cheapest pint.
    </h1>
    <p class="text-muted text-base">
      {{ subtitle ?? "Every drink, ranked by cost per unit of alcohol." }}
    </p>
  </div>
</template>
