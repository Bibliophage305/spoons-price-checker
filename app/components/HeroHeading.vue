<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
}>();
</script>

<template>
  <div
    class="font-body flex flex-col items-center justify-center gap-3 text-center"
  >
    <p class="text-amber text-xs font-semibold tracking-widest uppercase">
      Wetherspoons
    </p>
    <h1
      class="font-display text-cream text-4xl leading-[1.05] font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
    >
      {{ title ?? "Find the cheapest pint." }}
    </h1>
    <p class="text-muted text-base">
      {{ subtitle ?? "Every drink, ranked by cost per unit of alcohol." }}
    </p>
    <slot />
  </div>
</template>
