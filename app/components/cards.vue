<script setup lang="ts">
interface Drink {
  costPerUnit: number;
  itemName: string;
  optionName: string;
  abv: number;
  price: number;
  currency: string;
  volumeMl: number;
}

type SortKey = keyof Pick<
  Drink,
  "costPerUnit" | "itemName" | "abv" | "price" | "volumeMl"
>;

interface SortOption {
  label: string;
  key: SortKey;
  dir: "asc" | "desc";
}

const SORT_OPTIONS: SortOption[] = [
  { label: "Best value first", key: "costPerUnit", dir: "asc" },
  { label: "Worst value first", key: "costPerUnit", dir: "desc" },
  { label: "Drink name A-Z", key: "itemName", dir: "asc" },
  { label: "Drink name Z-A", key: "itemName", dir: "desc" },
  { label: "ABV lowest first", key: "abv", dir: "asc" },
  { label: "ABV highest first", key: "abv", dir: "desc" },
  { label: "Price lowest first", key: "price", dir: "asc" },
  { label: "Price highest first", key: "price", dir: "desc" },
  { label: "Volume smallest first", key: "volumeMl", dir: "asc" },
  { label: "Volume largest first", key: "volumeMl", dir: "desc" },
];

const props = defineProps<{
  currencySymbol: string;
  paginatedDrinks: Drink[];
  onCardSort: (key: SortOption) => void;
}>();

const emit = defineEmits<{
  sort: [key: SortKey, dir: "asc" | "desc"];
}>();

const selectedSort = ref<SortOption>(SORT_OPTIONS[0]);

function onSortChange(e: Event) {
  const idx = parseInt((e.target as HTMLSelectElement).value);
  selectedSort.value = SORT_OPTIONS[idx];
  props.onCardSort(selectedSort.value.key, selectedSort.value.dir);
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
      <select
        id="card-sort"
        class="bg-search-bg border-border focus:border-amber text-cream min-w-0 rounded-lg border border-solid px-3 py-2 text-sm focus:outline-none"
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

    <!-- Cards -->
    <div class="flex flex-col gap-3 py-4">
      <div
        v-for="(drink, i) in paginatedDrinks"
        :key="i"
        class="border-border bg-bg-alt rounded-lg border p-4"
      >
        <!-- Name + option -->
        <div class="mb-3">
          <p class="text-cream text-base leading-snug font-semibold">
            {{ drink.itemName }}
          </p>
          <p class="text-muted mt-0.5 text-xs">{{ drink.optionName }}</p>
        </div>

        <!-- Stats row -->
        <div class="text-muted mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span
            ><span class="text-cream font-medium"
              >{{ drink.abv?.toFixed(1) }}%</span
            >
            ABV</span
          >
          <span
            ><span class="text-cream font-medium"
              >{{ drink.volumeMl }}ml</span
            ></span
          >
          <span
            ><span class="text-cream font-medium"
              >{{ props.currencySymbol }}{{ drink.price?.toFixed(2) }}</span
            ></span
          >
        </div>

        <!-- Cost per unit -->
        <div class="relative flex items-center py-1">
          <span
            class="text-cream relative z-10 pl-2 text-sm font-semibold tabular-nums"
          >
            {{ props.currencySymbol }}{{ drink.costPerUnit?.toFixed(2) }} per
            unit
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
