import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ["@nuxt/scripts"],
  routeRules: {
    "/support": {
      redirect: {
        to: "https://buymeacoffee.com/bibliophage305",
        statusCode: 302,
      },
    },
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
