<script setup lang="ts">
useSeoMeta({
  title: "About — Wetherspoons Price Checker",
  description:
    "How the Wetherspoons Price Checker works, where the data comes from, and why it exists.",
  ogTitle: "About — Wetherspoons Price Checker",
  ogDescription:
    "How the Wetherspoons Price Checker works, where the data comes from, and why it exists.",
  ogUrl: "https://pintchecker.co.uk/about",
  twitterTitle: "About — Wetherspoons Price Checker",
  twitterDescription:
    "How the Wetherspoons Price Checker works, where the data comes from, and why it exists.",
});

useHead({
  link: [{ rel: "canonical", href: "https://pintchecker.co.uk/about" }],
});
</script>

<template>
  <main class="min-h-dvh">
    <div class="mx-auto max-w-2xl px-6 pt-20 pb-24">
      <nav class="mb-10">
        <NuxtLink
          to="/"
          class="text-muted hover:text-cream inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <svg
            class="h-3.5 w-3.5"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M11.78 4.22a.75.75 0 0 1 0 1.06L8.06 9l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
              clip-rule="evenodd"
            />
          </svg>
          Back
        </NuxtLink>
      </nav>

      <header class="mb-10">
        <p
          class="text-amber mb-3 text-xs font-semibold tracking-widest uppercase"
        >
          Wetherspoons Price Checker
        </p>
        <h1
          class="font-display text-cream text-4xl font-black tracking-tight sm:text-5xl"
        >
          About
        </h1>
      </header>

      <div class="text-cream prose-spoons space-y-6 leading-relaxed">
        <section>
          <h2 class="font-display text-cream mb-3 text-xl font-bold">
            What is this?
          </h2>
          <p class="text-muted">
            Wetherspoons Price Checker lets you find the best value drink at any
            Wetherspoons venue in the UK and Ireland. Pick a pub, and every
            drink on the menu is ranked by cost per unit of alcohol — so you can
            see at a glance whether a pint of something 4% is a better deal than
            a glass of something 13%.
          </p>
        </section>

        <section>
          <h2 class="font-display text-cream mb-3 text-xl font-bold">
            Where does the data come from?
          </h2>
          <p class="text-muted">
            Prices and menus are fetched directly from the same API the
            Wetherspoons app uses. This is an unofficial integration — we're not
            affiliated with J D Wetherspoon plc in any way. Menu data is cached
            for up to 24 hours; if a venue is currently closed and no fresh data
            is available, we show the most recent populated menu we have on
            record.
          </p>
        </section>

        <section>
          <h2 class="font-display text-cream mb-3 text-xl font-bold">
            How is cost per unit calculated?
          </h2>
          <p class="text-muted">
            A unit of alcohol is 10ml of pure ethanol. For each drink, we take
            the price, the serving volume in ml, and the ABV percentage, and
            calculate:
          </p>
          <p
            class="bg-bg-alt border-border text-cream mt-3 rounded-lg border px-4 py-3 font-mono text-sm"
          >
            (price × 1000) ÷ (ABV × volume in ml)
          </p>
          <p class="text-muted mt-3">
            A lower number means better value. Guest ales use price band data
            cross-referenced with the main menu; a small number of mixed drinks
            (spritzes, cocktails) use manually verified ABV and volume figures
            where the API data is incomplete.
          </p>
        </section>

        <section>
          <h2 class="font-display text-cream mb-3 text-xl font-bold">
            Anything missing?
          </h2>
          <p class="text-muted">
            Pitcher deals, some guest ales at certain venues, and a handful of
            meal deal drinks may not appear or may have slightly inaccurate
            figures. We're working on it. If you spot something wrong, feel free
            to get in touch.
          </p>
        </section>

        <section>
          <h2 class="font-display text-cream mb-3 text-xl font-bold">
            Support the site
          </h2>
          <p class="text-muted">
            This is a free tool with no ads. If it's saved you money at the bar,
            you're welcome to buy the developer a coffee.
          </p>
          <NuxtLink
            to="/support"
            class="bg-amber text-bg mt-4 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Buy me a coffee ☕
          </NuxtLink>
        </section>
      </div>
    </div>
  </main>
</template>
