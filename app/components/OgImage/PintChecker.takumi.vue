<script setup lang="ts">
const { title = "title", description = "description" } = defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<template>
  <HeroHeading :title="title" :subtitle="description" class="bg-bg">
    <!-- Divider -->
    <div class="bg-amber mt-2 h-0.75 w-20 rounded-xs" />

    <!-- URL -->
    <p class="text-muted mt-1 text-lg">pintchecker.co.uk</p>
  </HeroHeading>
</template>
