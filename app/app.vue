<script setup lang="ts">
// Global defaults - individual pages override with useSeoMeta/useHead
useSeoMeta({
  ogType: "website",
  ogSiteName: "Wetherspoons Price Checker",
  twitterCard: "summary_large_image",
  robots: "index,follow",
});

useHead({
  htmlAttrs: { lang: "en-GB" },
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "theme-color", content: "#1a2e1a" },
    { name: "mobile-web-app-capable", content: "yes" },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black-translucent",
    },
    { name: "format-detection", content: "telephone=no" },
  ],
  link: [{ rel: "icon", href: "/favicon.ico" }],
});
</script>

<template>
  <div>
    <NuxtPage class="bg-bg font-body color-cream min-h-dvh antialiased" />
  </div>
</template>
