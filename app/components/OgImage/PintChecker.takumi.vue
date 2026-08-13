<!-- app/components/OgImage/PintChecker.takumi.vue -->
<!-- OG image template. Props passed via defineOgImage() in each page. -->
<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<template>
  <div
    class="flex h-full w-full flex-col items-center justify-center gap-6 px-16 py-12"
    style="
      background-color: #1a2e1a;
      font-family: &quot;Playfair Display&quot;, Georgia, serif;
    "
  >
    <!-- Top label -->
    <p
      style="
        color: #c8861a;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        font-family: &quot;Inter&quot;, system-ui, sans-serif;
      "
    >
      Wetherspoons
    </p>

    <!-- Main title -->
    <h1
      style="
        color: #f5eedc;
        font-size: 64px;
        font-weight: 900;
        line-height: 1.05;
        letter-spacing: -0.02em;
        text-align: center;
        margin: 0;
      "
    >
      {{ title ?? "Find the cheapest pint." }}
    </h1>

    <!-- Description -->
    <p
      style="
        color: #8fa88f;
        font-size: 24px;
        text-align: center;
        margin: 0;
        font-family: &quot;Inter&quot;, system-ui, sans-serif;
        font-weight: 400;
      "
    >
      {{ description ?? "Every drink, ranked by cost per unit of alcohol." }}
    </p>

    <!-- Divider -->
    <div
      style="
        width: 80px;
        height: 3px;
        background-color: #c8861a;
        border-radius: 2px;
        margin-top: 8px;
      "
    />

    <!-- URL -->
    <p
      style="
        color: #3d5c3d;
        font-size: 18px;
        font-family: &quot;Inter&quot;, system-ui, sans-serif;
        margin-top: 4px;
      "
    >
      pintchecker.co.uk
    </p>
  </div>
</template>
