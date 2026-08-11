<script setup lang="ts">
// Global defaults — individual pages override with useSeoMeta/useHead
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
    { name: "apple-mobile-web-app-capable", content: "yes" },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black-translucent",
    },
    { name: "format-detection", content: "telephone=no" },
  ],
  link: [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap",
    },
  ],
});
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
body {
  background-color: var(--color-bg);
  color: var(--color-cream);
  font-family: var(--font-body);
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
}
</style>
