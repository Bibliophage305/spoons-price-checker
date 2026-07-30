<script setup lang="ts">
useHead({
  title: "Wetherspoons Price Checker",

  htmlAttrs: {
    lang: "en-GB",
  },

  meta: [
    {
      name: "description",
      content:
        "Search pubs and compare drink prices, ABV, volume and cost per unit to find the best value drinks in your local spoons.",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      name: "theme-color",
      content: "#1a2e1a",
    },
    {
      name: "robots",
      content: "index,follow",
    },

    // Open Graph
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:title",
      content: "Wetherspoons Price Checker",
    },
    {
      property: "og:description",
      content:
        "Search pubs and compare drink prices, ABV, volume and cost per unit to find the best value drinks in your local spoons.",
    },
    {
      property: "og:site_name",
      content: "Wetherspoons Price Checker",
    },

    // Twitter
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: "Wetherspoons Price Checker",
    },
    {
      name: "twitter:description",
      content:
        "Search pubs and compare drink prices, ABV, volume and cost per unit to find the best value drinks in your local spoons.",
    },

    // Mobile
    {
      name: "apple-mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black-translucent",
    },
    {
      name: "format-detection",
      content: "telephone=no",
    },
  ],

  link: [
    {
      rel: "icon",
      href: "/favicon.ico",
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
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap");

body {
  background-color: var(--color-bg);
  color: var(--color-cream);
  font-family: var(--font-body);
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
}
</style>
