import type { Menu, ProductItem, AleItem, Item } from "../../utils/models/menu";
// import { getAbv } from "../../utils/models/menu";

const SPRITZ_ABV_OVERRIDES: Record<string, number> = {
  "Hugo Spritz": (100 * (0.413 * 25 + 0.11 * 125)) / 150,
  "Mango & Passionfruit Spritz": (100 * (0.35 * 25 + 0.11 * 125)) / 150,
  "Classic Aperol Spritz": (100 * (0.11 * 50 + 0.11 * 125)) / 175,
  "Peach Blush Spritz": (100 * (0.18 * 25 + 0.115 * 125)) / 150,
  "Limoncello Spritz": (100 * (0.3 * 50 + 0.11 * 125)) / 175,
};

const SPRITZ_VOLUME_OVERRIDES: Record<string, number> = {
  "Hugo Spritz": 150,
  "Mango & Passionfruit Spritz": 150,
  "Peach Blush Spritz": 150,
  "Classic Aperol Spritz": 175,
  "Limoncello Spritz": 175,
};

const SERVE_SIZE_KEYWORDS: [string, number][] = [
  ["half pint", 284],
  ["third pint", 189],
  ["pint", 568],
  ["half", 284],
  ["third", 189],
  ["single", 25],
  ["double", 50],
];

const VOLUME_FROM_DESCRIPTION_KEYWORDS = [
  "standard",
  "can",
  "bottle",
  "glass",
  "pitcher",
];
const KNOWN_VOLUMES = [
  25, 50, 125, 175, 250, 284, 330, 440, 500, 568, 750, 1000,
];

function extractMl(text: string): number | null {
  const match = text.toLowerCase().match(/(\d+\.?\d*)(?=ml)/);
  return match ? parseInt(match[1]) : null;
}

function extractUnits(description: string): number | null {
  const match = description.toLowerCase().match(/(\d+\.?\d*)(?= unit)/);
  return match ? parseFloat(match[1]) : null;
}

function resolveAbv(item: ProductItem): number {
  return SPRITZ_ABV_OVERRIDES[item.name] ?? getAbv(item);
}

function resolveVolumeMl(
  item: ProductItem,
  categoryName: string,
  itemGroupName: string,
  optionName: string,
  abv: number,
): number | null {
  const lower = optionName.toLowerCase();

  const mlFromOption = extractMl(optionName);
  if (mlFromOption !== null) return mlFromOption;

  if (item.name in SPRITZ_VOLUME_OVERRIDES)
    return SPRITZ_VOLUME_OVERRIDES[item.name];

  for (const [keyword, volume] of SERVE_SIZE_KEYWORDS) {
    if (lower.includes(keyword)) return volume;
  }

  if (VOLUME_FROM_DESCRIPTION_KEYWORDS.some((k) => lower.includes(k))) {
    const mlFromDesc = extractMl(item.description);
    if (mlFromDesc !== null) return mlFromDesc;
  }

  const units = extractUnits(item.description);
  if (units !== null) {
    const estimate = (units * 1000) / abv;
    return KNOWN_VOLUMES.reduce((a, b) =>
      Math.abs(a - estimate) < Math.abs(b - estimate) ? a : b,
    );
  }

  if (itemGroupName.toLowerCase() === "classic cocktails") return 125;
  if (
    categoryName.toLowerCase() === "includes a drink" &&
    itemGroupName.toLowerCase() === "spritz cocktails"
  )
    return 125;

  return null;
}

function costPerUnit(price: number, abv: number, volumeMl: number): number {
  return (1000 * price) / (abv * volumeMl);
}

interface Drink {
  costPerUnit: number;
  itemName: string;
  optionName: string;
  abv: number;
  price: number;
  currency: string;
  volumeMl: number;
}

function buildAlePriceMap(
  menus: Menu[],
): Record<number, Record<string, number>> {
  const map: Record<number, Record<string, number>> = {};

  for (const menu of menus) {
    for (const category of menu.categories) {
      for (const itemGroup of category.itemGroups) {
        for (const item of itemGroup.items) {
          if (item.itemType !== "product") continue;
          for (const option of item.options.portion.options) {
            const checkoutId = item.checkout.id;
            const optionName = option.value.name;
            const price = option.value.price.value;
            if (!map[checkoutId]) map[checkoutId] = {};
            map[checkoutId][optionName] = price;
          }
        }
      }
    }
  }

  return map;
}

function extractDrinks(menus: Menu[]): Drink[] {
  const drinks = new Map<string, Drink>();
  const alePriceMap = buildAlePriceMap(menus);

  const addDrink = (drink: Drink) => {
    const key = `${drink.itemName}|${drink.optionName}`;
    if (!drinks.has(key)) drinks.set(key, drink);
  };

  for (const menu of menus) {
    for (const category of menu.categories) {
      for (const itemGroup of category.itemGroups) {
        for (const item of itemGroup.items) {
          if (item.itemType === "product") {
            const abv = resolveAbv(item);
            if (abv === 0) continue;

            for (const option of item.options.portion.options) {
              const volumeMl = resolveVolumeMl(
                item,
                category.name,
                itemGroup.name ?? "",
                option.value.name,
                abv,
              );
              if (volumeMl === null) continue;

              addDrink({
                costPerUnit: costPerUnit(
                  option.value.price.value,
                  abv,
                  volumeMl,
                ),
                itemName: item.name,
                optionName: option.value.name,
                abv,
                price: option.value.price.value,
                currency: option.value.price.currency,
                volumeMl,
              });

              for (const linked of item.options.linked ?? []) {
                const tokens = linked.name.toLowerCase().split(" ");
                const multiplier = parseInt(tokens.find(token => /^\d+$/.test(token)), 10);
                const multiplePrice = parseFloat(
                  tokens[tokens.length - 1].slice(1),
                );
                addDrink({
                  costPerUnit: costPerUnit(
                    multiplePrice,
                    abv,
                    volumeMl * multiplier,
                  ),
                  itemName: item.name,
                  optionName: linked.name,
                  abv,
                  price: multiplePrice,
                  currency: option.value.price.currency,
                  volumeMl: volumeMl * multiplier,
                });
              }
            }
          } else if (item.itemType === "ale") {
            const abv = item.abv;
            if (abv === 0) continue;

            const options = alePriceMap[item.checkout.id] ?? {};
            for (const [optionName, price] of Object.entries(options)) {
              const volumeMl = resolveVolumeMl(
                // ales don't have a description volume, but they do hit
                // the pint/half pint keyword branches fine
                {
                  description: "",
                  name: item.fullName,
                } as unknown as ProductItem,
                category.name,
                itemGroup.name ?? "",
                optionName,
                abv,
              );
              if (volumeMl === null) continue;

              addDrink({
                costPerUnit: costPerUnit(price, abv, volumeMl),
                itemName: item.fullName,
                optionName,
                abv,
                price,
                currency: "GBP",
                volumeMl,
              });
            }
          }
        }
      }
    }
  }

  return [...drinks.values()].sort((a, b) => a.costPerUnit - b.costPerUnit);
}

export default defineEventHandler(async (event) => {
  const venueRef = parseInt(getRouterParam(event, "venueRef") ?? "");
  if (isNaN(venueRef))
    throw createError({ statusCode: 400, message: "Invalid venueRef" });

  // Get the venue summary from the full list so we have the franchise
  const venueSummaries = await allVenues();
  const summary = venueSummaries.find((v) => v.venueRef === venueRef);
  if (!summary)
    throw createError({ statusCode: 404, message: "Venue not found" });

  const venue = await getVenue(summary);
  const menuSummaries = await allMenus(venue);
  const menus = await Promise.all(
    menuSummaries.map((ms) => getMenu(venue, ms)),
  );

  const drinks = extractDrinks(menus);

  return {
    venue: {
      venueRef: venue.venueRef,
      name: venue.name,
      address: venue.address,
      currency: venue.currency,
    },
    drinks,
  };
});
