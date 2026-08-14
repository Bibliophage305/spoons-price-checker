export type SortKey = keyof Pick<
  Drink,
  "costPerUnit" | "itemName" | "abv" | "price" | "volumeMl"
>;

export interface SortOption {
  label: string;
  key: SortKey;
  dir: "asc" | "desc";
}

export const SORT_OPTIONS: SortOption[] = [
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

export interface VenueResult {
  venue: {
    venueRef: number;
    name: string;
    address: { town: string; postcode: string };
    currency: { symbol: string };
  };
  drinks: Drink[];
  cachedAt: string | null;
}
