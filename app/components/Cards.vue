<script setup lang="ts">
import { type SortKey, SORT_OPTIONS } from "~/types/drinks";

defineProps<{
  currencySymbol: string;
  paginatedDrinks: Drink[];
}>();

const emit = defineEmits<{
  sort: [key: SortKey, dir: "asc" | "desc"];
}>();

const selectedSort = ref(SORT_OPTIONS[0]);

function onSortChange(e: Event) {
  const idx = parseInt((e.target as HTMLSelectElement).value);
  selectedSort.value = SORT_OPTIONS[idx];
  emit("sort", selectedSort.value!.key, selectedSort.value!.dir);
}
</script>

<template>
  <div>
    <!-- Sort dropdown -->
    <div class="border-border flex items-center gap-3 border-b py-4">
      <label
        for="card-sort"
        class="text-muted text-xs font-semibold tracking-widest whitespace-nowrap uppercase"
      >
        Sort by
      </label>
      <div class="grid">
        <svg
          class="text-cream pointer-events-none relative right-2 z-10 col-start-1 row-start-1 h-4 w-4 self-center justify-self-end"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
        </svg>
        <select
          id="card-sort"
          class="bg-search-bg border-border focus:border-amber text-cream col-start-1 row-start-1 min-w-0 appearance-none rounded-lg border px-3 py-2 pr-8 text-sm focus:outline-none"
          @change="onSortChange"
        >
          <option
            v-for="(option, i) in SORT_OPTIONS"
            :key="i"
            :value="i"
            :selected="selectedSort === option"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Cards -->
    <div class="flex flex-col gap-3 py-4">
      <div
        v-for="(drink, i) in paginatedDrinks"
        :key="i"
        class="border-border bg-bg-alt rounded-lg border p-4"
      >
        <div class="mb-3">
          <p class="text-cream text-base leading-snug font-semibold">
            {{ drink.itemName }}
          </p>
          <p class="text-muted mt-0.5 text-xs">{{ drink.optionName }}</p>
        </div>

        <div class="text-muted mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span
            ><span class="text-cream font-medium"
              >{{ drink.abv?.toFixed(1) }}%</span
            >
            ABV</span
          >
          <span class="text-cream font-medium">{{ drink.volumeMl }}ml</span>
          <span class="text-cream font-medium"
            >{{ currencySymbol }}{{ drink.price?.toFixed(2) }}</span
          >
        </div>

        <p class="text-cream text-sm font-semibold tabular-nums">
          {{ currencySymbol }}{{ drink.costPerUnit?.toFixed(2) }} per unit
        </p>
      </div>
    </div>
  </div>
</template>
