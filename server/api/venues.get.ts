import { allVenues } from "../utils/repositories/venues";

export default defineEventHandler(async () => {
  const venueSummaries = await allVenues();
  return venueSummaries.map((v) => ({
    venueRef: v.venueRef,
    name: v.name,
    franchise: v.franchise,
    isClosed: v.isClosed,
    address: {
      town: v.address.town,
      county: v.address.county,
      postcode: v.address.postcode,
      country: v.address.country.name,
    },
  }));
});
