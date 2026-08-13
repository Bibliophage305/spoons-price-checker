<script setup lang="ts">
import { type SortKey, SORT_OPTIONS } from "~/types/drinks";

defineProps<{
  currencySymbol: string;
  paginatedDrinks: Drink[];
  toggleSort: (key: SortKey) => void;
  sortIcon: (key: SortKey) => string;
}>();
</script>

<template>
  <div>
    <table class="w-full border-collapse text-sm">
      <thead class="bg-bg-alt sticky top-0 z-10">
        <tr class="border-border border-b">
          <th
            class="text-muted min-w-48 px-1 text-left font-semibold whitespace-nowrap"
          >
            <button
              class="font-inherit hover:text-cream w-full cursor-pointer border-none bg-transparent px-2 py-3 text-left text-inherit"
              @click="toggleSort('itemName')"
            >
              Drink {{ sortIcon("itemName") }}
            </button>
          </th>
          <th
            class="text-muted min-w-24 px-3 text-left font-semibold whitespace-nowrap"
          >
            Option
          </th>
          <th
            class="text-muted w-16 px-1 text-right font-semibold whitespace-nowrap"
          >
            <button
              class="font-inherit hover:text-cream w-full cursor-pointer border-none bg-transparent px-2 py-3 text-right text-inherit"
              @click="toggleSort('abv')"
            >
              ABV {{ sortIcon("abv") }}
            </button>
          </th>
          <th
            class="text-muted w-20 px-1 text-right font-semibold whitespace-nowrap"
          >
            <button
              class="font-inherit hover:text-cream w-full cursor-pointer border-none bg-transparent px-2 py-3 text-right text-inherit"
              @click="toggleSort('volumeMl')"
            >
              Vol {{ sortIcon("volumeMl") }}
            </button>
          </th>
          <th
            class="text-muted w-20 px-1 text-right font-semibold whitespace-nowrap"
          >
            <button
              class="font-inherit hover:text-cream w-full cursor-pointer border-none bg-transparent px-2 py-3 text-right text-inherit"
              @click="toggleSort('price')"
            >
              Price {{ sortIcon("price") }}
            </button>
          </th>
          <th
            class="text-muted w-20 px-1 text-left font-semibold whitespace-nowrap"
          >
            <button
              class="font-inherit hover:text-cream w-full cursor-pointer border-none bg-transparent px-2 py-3 text-left text-inherit"
              @click="toggleSort('costPerUnit')"
            >
              {{ currencySymbol }}/unit {{ sortIcon("costPerUnit") }}
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(drink, i) in paginatedDrinks"
          :key="i"
          class="border-border even:bg-bg-alt hover:bg-bg-hover border-b transition-colors duration-100 last:border-b-0"
        >
          <td class="text-cream min-w-48 px-3 py-3 align-middle">
            {{ drink.itemName }}
          </td>
          <td class="text-muted min-w-24 px-3 py-3 align-middle">
            {{ drink.optionName }}
          </td>
          <td class="text-cream w-16 px-3 py-3 text-right align-middle">
            {{ drink.abv?.toFixed(1) }}%
          </td>
          <td class="text-cream w-20 px-3 py-3 text-right align-middle">
            {{ drink.volumeMl }}ml
          </td>
          <td class="text-cream w-20 px-3 py-3 text-right align-middle">
            {{ currencySymbol }}{{ drink.price?.toFixed(2) }}
          </td>
          <td class="text-cream w-20 px-3 py-3 text-right align-middle">
            {{ currencySymbol }}{{ drink.costPerUnit?.toFixed(2) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
