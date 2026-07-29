// models/menu.ts

export interface MenuSummary {
	canOrder: boolean;
	franchise: string;
	id: number;
	name: string;
	salesAreaId: number;
	venueRef: number;
}

export interface Checkout {
	id: number;
	name: string;
	menuId: number | null;
	messages: unknown[];
}

export interface Price {
	initialValue: number;
	value: number;
	currency: string;
	discount: number;
}

export interface ValueChoice {
	choiceId: number;
	portionId: number;
	displayRecordId?: number;
}

export interface Value {
	id: number;
	name: string;
	description: string | null;
	calories: unknown;
	choices: ValueChoice[];
	price: Price;
	checkout: Checkout;
	hidden: boolean;
	isDefault: boolean;
}

export interface Option {
	label: string;
	value: Value;
	isDefault: boolean;
}

export interface Portion {
	id: string;
	title: string;
	options: Option[];
	description: string;
	required: boolean;
	singleChoice: boolean;
	sortOrder: number;
}

export interface Keyword {
	type: string;
	name: string;
	id: string;
	label: string;
	value: string | boolean | null;
	isFlag: boolean;
	isBadge: boolean;
	isAddOn: boolean;
	tags: Record<string, unknown> | unknown[];
	icon?: string;
	iconUrl?: string;
}

export interface Linked {
	name: string;
}

export interface Options {
	portion: Portion;
	choices: unknown[];
	swap: unknown;
	tillRequests: unknown[];
	tags: unknown[];
	addOns: unknown[];
	linked: Linked[];
}

export interface ProductItem {
	itemType: "product";
	id: number;
	name: string;
	description: string;
	checkout: Checkout;
	calories: number | null;
	isOutOfStock: boolean;
	keywords: Keyword[];
	courseId: number;
	displayRecordId: number;
	alerts: unknown;
	ageRestriction: number;
	related: number[];
	options: Options;
	sortOrder: number;
	showPrice: boolean;
	salesAreaId: number | null;
}

export interface TextItem {
	itemType: "text";
	text: string;
}

export interface DividerItem {
	itemType: "divider";
}

export interface AleType {
	key: string;
	label: string;
	hexColor: string;
}

export interface Allergens {
	cerealsContainingGluten: string;
}

export interface AleItem {
	itemType: "ale";
	id: number;
	brewery: string;
	name: string;
	fullName: string;
	type: AleType | null;
	priceBand: string;
	abv: number;
	units: number;
	checkout: Checkout;
	description: string;
	comingSoon: boolean;
	salesAreas: number[] | null;
	allergens: Allergens;
}

export type Item = ProductItem | TextItem | DividerItem | AleItem;

export interface ItemGroup {
	name: string | null;
	description: unknown;
	items: Item[];
	sortOrder: number;
}

export interface SubCategories {
	"WO::white": string;
	"WO::red": string;
	"WO::rose": string;
	"WO::spark"?: string;
}

export interface Category {
	id: number;
	name: string;
	hidden: boolean;
	sortOrder: number;
	itemGroups: ItemGroup[];
	subCategories: SubCategories | null;
}

export interface Menu extends MenuSummary {
	description: string | null;
	image: string;
	created: string;
	updated: string;
	categories: Category[];
	versionId: number;
	sortOrder: number;
	isSpecials: boolean;
}

// The abv property on ProductItem is derived from the description in Python.
// In TypeScript we expose it as a plain function to keep the interface a pure data shape.
export function getAbv(item: ProductItem): number {
	const match = item.description.toLowerCase().match(/(\d+\.?\d*)(?=% abv)/);
	return match ? parseFloat(match[1]) : 0;
}

export function parseMenuSummary(data: unknown): MenuSummary {
	return data as MenuSummary;
}

export function parseMenu(data: unknown): Menu {
	return data as Menu;
}
