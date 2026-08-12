export default defineEventHandler(async (event) => {
  setResponseHeader(
    event,
    "Cache-Control",
    "public, max-age=3600, s-maxage=3600",
  );
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
