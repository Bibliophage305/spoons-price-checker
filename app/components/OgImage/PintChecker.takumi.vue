<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<template>
  <div
    class="bg-bg font-body flex flex-col items-center justify-center gap-3 text-center"
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
      {{ description ?? "Every drink, ranked by cost per unit of alcohol." }}
    </p>
    <!-- Divider -->
    <div class="bg-amber mt-2 h-0.75 w-20 rounded-xs" />

    <!-- URL -->
    <p class="text-muted mt-1 text-lg">pintchecker.co.uk</p>
  </div>
</template>
