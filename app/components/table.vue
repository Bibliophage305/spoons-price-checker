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

const props = defineProps<{
  currencySymbol: string;
  paginatedDrinks: Drink[];
  toggleSort: (key: keyof Drink) => void;
  sortIcon: (key: keyof Drink) => string;
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
              @click="props.toggleSort('itemName')"
            >
              Drink {{ props.sortIcon("itemName") }}
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
              @click="props.toggleSort('abv')"
            >
              ABV {{ props.sortIcon("abv") }}
            </button>
          </th>
          <th
            class="text-muted w-20 px-1 text-right font-semibold whitespace-nowrap"
          >
            <button
              class="font-inherit hover:text-cream w-full cursor-pointer border-none bg-transparent px-2 py-3 text-right text-inherit"
              @click="props.toggleSort('volumeMl')"
            >
              Vol {{ props.sortIcon("volumeMl") }}
            </button>
          </th>
          <th
            class="text-muted w-20 px-1 text-right font-semibold whitespace-nowrap"
          >
            <button
              class="font-inherit hover:text-cream w-full cursor-pointer border-none bg-transparent px-2 py-3 text-right text-inherit"
              @click="props.toggleSort('price')"
            >
              Price {{ props.sortIcon("price") }}
            </button>
          </th>
          <th
            class="text-muted w-20 px-1 text-left font-semibold whitespace-nowrap"
          >
            <button
              class="font-inherit hover:text-cream w-full cursor-pointer border-none bg-transparent px-2 py-3 text-left text-inherit"
              @click="props.toggleSort('costPerUnit')"
            >
              {{ props.currencySymbol }}/unit
              {{ props.sortIcon("costPerUnit") }}
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(drink, i) in props.paginatedDrinks"
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
            {{ props.currencySymbol }}{{ drink.price?.toFixed(2) }}
          </td>
          <td class="text-cream w-20 px-3 py-3 text-right align-middle">
            {{ props.currencySymbol }}{{ drink.costPerUnit?.toFixed(2) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
