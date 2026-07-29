<script setup lang="ts">
	interface VenueSummary {
		venueRef: number;
		name: string;
		franchise: string;
		isClosed: boolean;
		address: {
			town: string;
			county: string;
			postcode: string;
			country: string;
		};
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

	interface VenueResult {
		venue: {
			venueRef: number;
			name: string;
			address: object;
			currency: { symbol: string };
		};
		drinks: Drink[];
	}

	// Venue search
	const { data: venues } = await useFetch<VenueSummary[]>("/api/venues");
	const query = ref("");
	const selectedVenue = ref<VenueSummary | null>(null);
	const searchEl = ref<HTMLInputElement | null>(null);
	const showDropdown = ref(false);

	const filtered = computed(() => {
		if (!query.value.trim() || !venues.value) return [];
		const q = query.value.toLowerCase();
		return venues.value
			.filter(
				(v) =>
					v.name.toLowerCase().includes(q) ||
					v.address.town.toLowerCase().includes(q) ||
					v.address.postcode.toLowerCase().includes(q),
			)
			.slice(0, 12);
	});

	function selectVenue(venue: VenueSummary) {
		selectedVenue.value = venue;
		query.value = venue.name;
		showDropdown.value = false;
		loadDrinks(venue.venueRef);
	}

	function onInput() {
		selectedVenue.value = null;
		result.value = null;
		showDropdown.value = true;
	}

	function onBlur() {
		setTimeout(() => {
			showDropdown.value = false;
		}, 150);
	}

	// Drinks
	const result = ref<VenueResult | null>(null);
	const loading = ref(false);
	const error = ref<string | null>(null);

	async function loadDrinks(venueRef: number) {
		loading.value = true;
		error.value = null;
		result.value = null;
		try {
			result.value = await $fetch<VenueResult>(`/api/venues/${venueRef}`);
		} catch {
			error.value =
				"Could not load drinks for this venue. It may be closed or have no menu available.";
		} finally {
			loading.value = false;
		}
	}

	// Table controls
	const sortKey = ref<keyof Drink>("costPerUnit");
	const sortDir = ref<"asc" | "desc">("asc");
	const filterName = ref("");

	function toggleSort(key: keyof Drink) {
		if (sortKey.value === key) {
			sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
		} else {
			sortKey.value = key;
			sortDir.value = "asc";
		}
	}

	const filteredDrinks = computed(() => {
		if (!result.value) return [];
		let drinks = [...result.value.drinks];

		if (filterName.value.trim()) {
			const q = filterName.value.toLowerCase();
			drinks = drinks.filter((d) => d.itemName.toLowerCase().includes(q));
		}

		drinks.sort((a, b) => {
			const av = a[sortKey.value] as number | string;
			const bv = b[sortKey.value] as number | string;
			const cmp = av < bv ? -1 : av > bv ? 1 : 0;
			return sortDir.value === "asc" ? cmp : -cmp;
		});

		return drinks;
	});

	// Pagination
	const PAGE_SIZE_OPTIONS = [10, 20, 50, null] as const;
	type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

	const pageSize = ref<PageSize>(10);
	const page = ref(1);

	const totalPages = computed(() =>
		pageSize.value === null
			? 1
			: Math.ceil(filteredDrinks.value.length / pageSize.value),
	);

	const paginatedDrinks = computed(() => {
		if (pageSize.value === null) return filteredDrinks.value;
		const start = (page.value - 1) * pageSize.value;
		return filteredDrinks.value.slice(start, start + pageSize.value);
	});

	// Reset to page 1 when filters or page size change
	watch([filteredDrinks, pageSize], () => {
		page.value = 1;
	});

	const maxCostPerUnit = computed(() =>
		result.value
			? Math.max(...result.value.drinks.map((d) => d.costPerUnit))
			: 1,
	);

	const currencySymbol = computed(
		() => result.value?.venue.currency.symbol ?? "£",
	);

	function sortIcon(key: keyof Drink) {
		if (sortKey.value !== key) return "↕";
		return sortDir.value === "asc" ? "↑" : "↓";
	}

	function pageSizeLabel(size: PageSize) {
		return size === null ? "Show all" : `Show ${size}`;
	}
</script>

<template>
	<main>
		<header class="hero">
			<p class="eyebrow">Wetherspoons</p>
			<h1>Find the cheapest pint.</h1>
			<p class="subtitle">Every drink, ranked by cost per unit of alcohol.</p>

			<div class="search-wrap">
				<div class="search-box">
					<svg
						class="search-icon"
						viewBox="0 0 20 20"
						fill="none"
						aria-hidden="true"
					>
						<circle
							cx="8.5"
							cy="8.5"
							r="5.5"
							stroke="currentColor"
							stroke-width="1.5"
						/>
						<path
							d="M13 13l3.5 3.5"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</svg>
					<input
						ref="searchEl"
						v-model="query"
						type="search"
						placeholder="Search by pub name, town or postcode…"
						autocomplete="off"
						spellcheck="false"
						@input="onInput"
						@focus="showDropdown = true"
						@blur="onBlur"
						aria-label="Search for a Wetherspoons venue"
						aria-autocomplete="list"
						:aria-expanded="showDropdown && filtered.length > 0"
					/>
				</div>

				<ul
					v-if="showDropdown && filtered.length > 0"
					class="dropdown"
					role="listbox"
				>
					<li
						v-for="venue in filtered"
						:key="venue.venueRef"
						role="option"
						:class="{ closed: venue.isClosed }"
						@mousedown.prevent="selectVenue(venue)"
					>
						<span class="venue-name">{{ venue.name }}</span>
						<span class="venue-meta"
							>{{ venue.address.town }}, {{ venue.address.postcode }}</span
						>
						<span
							v-if="venue.isClosed"
							class="closed-badge"
							>Closed</span
						>
					</li>
				</ul>

				<p
					v-if="query.length > 1 && filtered.length === 0 && !selectedVenue"
					class="no-results"
				>
					No venues found for "{{ query }}"
				</p>
			</div>
		</header>

		<section
			v-if="loading"
			class="state-message"
		>
			<div
				class="spinner"
				aria-label="Loading drinks…"
			/>
			<p>Pulling the menu…</p>
		</section>

		<section
			v-else-if="error"
			class="state-message error"
		>
			<p>{{ error }}</p>
		</section>

		<section
			v-else-if="result"
			class="results"
		>
			<div class="results-header">
				<div>
					<h2>
						{{ result.venue.name }}, {{ result.venue.address.town }},
						{{ result.venue.address.postcode }}
					</h2>
					<p class="results-meta">
						{{ filteredDrinks.length }} drink{{
							filteredDrinks.length === 1 ? "" : "s"
						}}
					</p>
				</div>

				<div class="filters">
					<input
						v-model="filterName"
						type="search"
						placeholder="Filter by drink name…"
						class="filter-input"
						aria-label="Filter drinks by name"
					/>
				</div>
			</div>

			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th class="col-name">
								<button @click="toggleSort('itemName')">
									Drink {{ sortIcon("itemName") }}
								</button>
							</th>
							<th class="col-option">Size</th>
							<th class="col-abv">
								<button @click="toggleSort('abv')">
									ABV {{ sortIcon("abv") }}
								</button>
							</th>
							<th class="col-vol">
								<button @click="toggleSort('volumeMl')">
									Vol {{ sortIcon("volumeMl") }}
								</button>
							</th>
							<th class="col-price">
								<button @click="toggleSort('price')">
									Price {{ sortIcon("price") }}
								</button>
							</th>
							<th class="col-cpu">
								<button @click="toggleSort('costPerUnit')">
									£/unit {{ sortIcon("costPerUnit") }}
								</button>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="(drink, i) in paginatedDrinks"
							:key="i"
						>
							<td class="col-name">{{ drink.itemName }}</td>
							<td class="col-option">{{ drink.optionName }}</td>
							<td class="col-abv">{{ drink.abv.toFixed(1) }}%</td>
							<td class="col-vol">{{ drink.volumeMl }}ml</td>
							<td class="col-price">
								{{ currencySymbol }}{{ drink.price.toFixed(2) }}
							</td>
							<td class="col-cpu">
								<div class="cpu-cell">
									<div
										class="cpu-bar"
										:style="{
											width:
												(Math.log10(drink.costPerUnit + 1) /
													Math.log10(maxCostPerUnit + 1)) *
													100 +
												'%',
										}"
										aria-hidden="true"
									/>
									<span class="cpu-value"
										>{{ currencySymbol
										}}{{ drink.costPerUnit.toFixed(2) }}</span
									>
								</div>
							</td>
						</tr>
					</tbody>
				</table>

				<p
					v-if="filteredDrinks.length === 0"
					class="empty"
				>
					No drinks match your filters.
				</p>
			</div>

			<div
				v-if="filteredDrinks.length > 0"
				class="pagination"
			>
				<div class="page-size-picker">
					<button
						v-for="size in PAGE_SIZE_OPTIONS"
						:key="size ?? 'all'"
						:class="{ active: pageSize === size }"
						@click="pageSize = size"
					>
						{{ pageSizeLabel(size) }}
					</button>
				</div>

				<div
					v-if="pageSize !== null && totalPages > 1"
					class="page-nav"
				>
					<button
						class="page-btn"
						:disabled="page === 1"
						@click="page--"
						aria-label="Previous page"
					>
						‹
					</button>
					<span class="page-indicator">{{ page }} / {{ totalPages }}</span>
					<button
						class="page-btn"
						:disabled="page === totalPages"
						@click="page++"
						aria-label="Next page"
					>
						›
					</button>
				</div>
			</div>
		</section>
	</main>
</template>

<style scoped>
	main {
		min-height: 100dvh;
	}

	/* ── Hero ── */
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 5rem 1.5rem 4rem;
		gap: 0.75rem;
	}

	.eyebrow {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--amber);
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 7vw, 5rem);
		font-weight: 900;
		line-height: 1.05;
		color: var(--cream);
		letter-spacing: -0.02em;
	}

	.subtitle {
		font-size: 1rem;
		color: var(--muted);
		margin-bottom: 1.5rem;
	}

	/* ── Search ── */
	.search-wrap {
		position: relative;
		width: 100%;
		max-width: 540px;
	}

	.search-box {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		width: 1.1rem;
		height: 1.1rem;
		color: var(--muted);
		pointer-events: none;
		flex-shrink: 0;
	}

	input[type="search"] {
		width: 100%;
		padding: 0.9rem 1rem 0.9rem 2.75rem;
		background: #243624;
		border: 1.5px solid var(--border);
		border-radius: 8px;
		color: var(--cream);
		font-family: var(--font-body);
		font-size: 1rem;
		transition: border-color 0.15s;
	}

	input[type="search"]:focus {
		outline: none;
		border-color: var(--amber);
	}

	input[type="search"]::placeholder {
		color: var(--muted);
	}
	input[type="search"]::-webkit-search-cancel-button {
		display: none;
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		background: #243624;
		border: 1.5px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		list-style: none;
		z-index: 50;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	.dropdown li {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.65rem 1rem;
		cursor: pointer;
		transition: background 0.1s;
		border-bottom: 1px solid var(--border);
	}

	.dropdown li:last-child {
		border-bottom: none;
	}

	.dropdown li:hover,
	.dropdown li:focus {
		background: #2d4d2d;
	}

	.dropdown li.closed {
		opacity: 0.5;
	}

	.venue-name {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--cream);
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.venue-meta {
		font-size: 0.8rem;
		color: var(--muted);
		white-space: nowrap;
	}

	.closed-badge {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--red);
		white-space: nowrap;
	}

	.no-results {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: var(--muted);
		text-align: left;
	}

	/* ── State messages ── */
	.state-message {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 4rem 1.5rem;
		color: var(--muted);
		font-size: 0.95rem;
	}

	.state-message.error {
		color: var(--red);
	}

	.spinner {
		width: 2rem;
		height: 2rem;
		border: 2px solid var(--border);
		border-top-color: var(--amber);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ── Results ── */
	.results {
		padding: 0 1.5rem 4rem;
		max-width: 1100px;
		margin: 0 auto;
	}

	.results-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.5rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	h2 {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--cream);
	}

	.results-meta {
		font-size: 0.8rem;
		color: var(--muted);
		margin-top: 0.25rem;
	}

	/* ── Filters ── */
	.filters {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.filter-input {
		padding: 0.5rem 0.75rem;
		background: #243624;
		border: 1.5px solid var(--border);
		border-radius: 6px;
		color: var(--cream);
		font-family: var(--font-body);
		font-size: 0.875rem;
		transition: border-color 0.15s;
	}

	.filter-input:focus {
		outline: none;
		border-color: var(--amber);
	}

	.filter-input::placeholder {
		color: var(--muted);
	}
	.filter-input::-webkit-search-cancel-button {
		display: none;
	}

	/* ── Table ── */
	.table-wrap {
		overflow-x: auto;
		border-radius: 8px;
		border: 1px solid var(--border);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	thead {
		background: #1e291e;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	thead tr {
		border-bottom: 1.5px solid var(--border);
	}

	th {
		padding: 0 0.25rem;
		font-weight: 600;
		color: var(--muted);
		text-align: left;
		white-space: nowrap;
	}

	th button {
		background: none;
		border: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
		padding: 0.75rem 0.5rem;
		width: 100%;
		text-align: left;
		transition: color 0.1s;
	}

	th button:hover {
		color: var(--cream);
	}

	tbody tr {
		border-bottom: 1px solid var(--border);
		transition: background 0.1s;
	}

	tbody tr:last-child {
		border-bottom: none;
	}

	tbody tr:nth-child(even) {
		background: var(--bg-alt);
	}

	tbody tr:hover {
		background: #2d4d2d;
	}

	td {
		padding: 0.65rem 0.75rem;
		color: var(--cream);
		vertical-align: middle;
	}

	/* Column widths */
	.col-name {
		min-width: 200px;
	}
	.col-option {
		min-width: 100px;
		color: var(--muted);
	}
	.col-abv {
		width: 60px;
		text-align: right;
	}
	.col-vol {
		width: 70px;
		text-align: right;
	}
	.col-price {
		width: 70px;
		text-align: right;
	}
	.col-cpu {
		width: 140px;
	}

	th.col-abv button,
	th.col-vol button,
	th.col-price button {
		text-align: right;
	}

	/* ── Signature: cost-per-unit bar ── */
	.cpu-cell {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.15rem 0;
	}

	.cpu-bar {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: var(--amber-dim);
		border-right: 2px solid var(--amber);
		border-radius: 2px;
		transition: width 0.3s ease;
		min-width: 2px;
	}

	.cpu-value {
		position: relative;
		z-index: 1;
		font-weight: 600;
		color: var(--cream);
		padding-left: 0.35rem;
		font-variant-numeric: tabular-nums;
	}

	/* ── Pagination ── */
	.pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.page-size-picker {
		display: flex;
		gap: 0.25rem;
	}

	.page-size-picker button {
		padding: 0.35rem 0.75rem;
		border-radius: 6px;
		border: 1.5px solid var(--border);
		background: transparent;
		color: var(--muted);
		font-family: var(--font-body);
		font-size: 0.8rem;
		cursor: pointer;
		transition:
			background 0.1s,
			color 0.1s,
			border-color 0.1s;
	}

	.page-size-picker button:hover {
		color: var(--cream);
		border-color: var(--cream);
	}

	.page-size-picker button.active {
		background: var(--amber-dim);
		border-color: var(--amber);
		color: var(--cream);
	}

	.page-nav {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.page-btn {
		width: 2rem;
		height: 2rem;
		border-radius: 6px;
		border: 1.5px solid var(--border);
		background: transparent;
		color: var(--cream);
		font-size: 1.1rem;
		line-height: 1;
		cursor: pointer;
		transition:
			background 0.1s,
			border-color 0.1s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.page-btn:hover:not(:disabled) {
		background: #2d4d2d;
		border-color: var(--amber);
	}

	.page-btn:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.page-indicator {
		font-size: 0.875rem;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
		min-width: 4rem;
		text-align: center;
	}

	.empty {
		padding: 2rem 1rem;
		text-align: center;
		color: var(--muted);
		font-size: 0.9rem;
	}

	/* ── Responsive ── */
	@media (max-width: 640px) {
		.hero {
			padding: 3rem 1rem 2.5rem;
		}
		.results-header {
			flex-direction: column;
		}
		.filters {
			width: 100%;
		}
		.filter-input {
			flex: 1;
		}
		.pagination {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
