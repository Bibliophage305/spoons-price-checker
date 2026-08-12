export type FranchiseName =
  | "isle-of-man"
  | "levy"
  | "newcastle-uni"
  | "papas"
  | "jdw"
  | "guild-services"
  | "hull-uni";

export interface ClosureDates {
  closingDate: string | null;
  closingNotes: string | null;
  openingDate: string | null;
  openingNotes: string | null;
}

export interface Hotel {
  bookingUrl: string | null;
  closureDates: ClosureDates | null;
}

export interface SelectHandler {
  type: string;
}

export interface Country {
  name: string;
  code: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  distanceTolerance: number;
}

export interface Address {
  line1: string;
  line2: string | null;
  line3: string | null;
  town: string;
  county: string;
  postcode: string;
  country: Country;
  location: Location;
}

export interface VenueSummary {
  franchise: FranchiseName;
  id: number;
  venueRef: number;
  name: string;
  status: string;
  subType: string | null;
  address: Address;
  hotel: Hotel | null;
  type: string;
  isClosed: boolean;
  closureDates: ClosureDates | null;
  selectHandler: SelectHandler;
}

export interface ContactDetails {
  email: string | null;
  telephone: string | null;
  website: string | null;
}

export interface IncludeDrink {
  offset: number;
  wineOffset: number;
}

export interface Pricing {
  includeDrink: IncludeDrink;
}

export interface Currency {
  code: string;
  currencyCode: string;
  countryCode: string;
  symbol: string;
  htmlName: string;
  htmlNumber: string;
}

export interface OpeningTime {
  open: string | null;
  close: string | null;
  label: string | null;
  isClosed: boolean;
}

export interface OpeningDays {
  mon: OpeningTime;
  tue: OpeningTime;
  wed: OpeningTime;
  thu: OpeningTime;
  fri: OpeningTime;
  sat: OpeningTime;
  sun: OpeningTime;
}

export interface OpeningTimes {
  days: OpeningDays;
  dates: Record<string, OpeningTime> | null;
  children: OpeningTime;
}

export interface PaymentMethod {
  label: string;
  name: string;
  enabled: boolean;
}

export interface PaymentMethods {
  card: PaymentMethod;
  applePay: PaymentMethod;
  googlePay: PaymentMethod;
  paypal: PaymentMethod;
  payit: PaymentMethod;
}

export interface ApplePayConfig {
  merchantId: string;
}

export interface GooglePayConfig {
  merchantId: string;
  gateway: string;
  gatewayMerchantId: string;
}

export interface PaymentConfig {
  methods: PaymentMethods;
  applePay: ApplePayConfig;
  googlePay: GooglePayConfig;
}

export interface MenuURL {
  dairyFree: string | null;
  glutenFree: string | null;
}

export interface SalesArea {
  id: number;
  name: string;
  friendly: string | null;
  description: string | null;
}

export interface Venue extends VenueSummary {
  thumbnail: string;
  displayImages: string[];
  allergensUrl: string;
  canPlaceOrder: boolean;
  comingSoon: boolean;
  contactDetails: ContactDetails;
  pricing: Pricing;
  currency: Currency;
  facilities: string[];
  openingTimes: OpeningTimes;
  paymentConfig: PaymentConfig;
  menuUrl: MenuURL;
  salesAreas: SalesArea[];
  orderingEnabled: boolean;
}

export function parseVenueSummary(data: unknown): VenueSummary {
  return data as VenueSummary;
}

export function parseVenue(data: unknown): Venue {
  return data as Venue;
}
