// repositories/menus.ts

import { request } from "../api";
import {
  type Menu,
  type MenuSummary,
  parseMenu,
  parseMenuSummary,
} from "../models/menu";
import { type Venue } from "../models/venue";

export async function allMenus(
  venue: Venue,
  maxAgeMs?: number,
): Promise<MenuSummary[]> {
  const slug = `${venue.franchise}/venues/${venue.venueRef}/sales-areas/${venue.salesAreas[0].id}/menus`;
  const response = (await request(slug, { maxAgeMs })) as { data: unknown[] };
  return response.data.map(parseMenuSummary);
}

export async function getMenu(
  venue: Venue,
  menuSummary: MenuSummary,
  maxAgeMs?: number,
): Promise<Menu> {
  const slug = `${venue.franchise}/venues/${venue.venueRef}/sales-areas/${venue.salesAreas[0].id}/menus/${menuSummary.id}`;
  const response = (await request(slug, { maxAgeMs })) as { data: unknown };
  return parseMenu(response.data);
}
