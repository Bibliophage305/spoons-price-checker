import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: [
    "@nuxt/scripts",
    "@nuxtjs/robots",
    "@nuxtjs/sitemap",
    "nuxt-schema-org",
    "nuxt-seo-utils",
    "nuxt-og-image",
    "@nuxt/fonts",
  ],
  routeRules: {
    "/support": {
      redirect: {
        to: "https://buymeacoffee.com/bibliophage305",
        statusCode: 302,
      },
    },
  },
  fonts: {
    families: [
      {
        name: "Playfair Display",
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        global: true,
      },
      {
        name: "Inter",
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        global: true,
      },
    ],
  },
  $production: {
    scripts: {
      registry: {
        clarity: {
          trigger: "onNuxtReady",
        },
      },
    },
  },
});
