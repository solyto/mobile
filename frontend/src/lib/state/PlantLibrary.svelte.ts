import type { Plant, CreatePlantRequest, UpdatePlantRequest, PlantLocation } from '$lib/types/library_plant';
import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import LibraryFilterService from '$lib/services/LibraryFilterService';
import type { LibraryConfig } from '$lib/types/library';

export class PlantLibrary {
	config: LibraryConfig = {
		type: 'plants',
		hasCovers: true,
		hasRatings: false,
		hasViewSwitcher: true,
		hasFilters: true,
		hasGenres: false,
		hasRecommender: false,
		hasWishlist: false,
		hasExternalLinks: true,
		hasReleases: false,
		hasShelf: false,
		entriesAreLinks: false
	};
	loaded = $state<boolean>(false);
	entries = $state<Plant[]>([]);
	filteredEntries = $state<Plant[]>([]);
	createModalVisible = $state<boolean>(false);
	detailModalVisible = $state<boolean>(false);
	searchVisible = $state<boolean>(false);
	activeEntry = $state<Plant | null>(null);
	locationFilter = $state<PlantLocation | null>(null);
	unidentifiedFilter = $state<boolean>(false);
	searchTerm = $state<string>('');
	view = $state<'list' | 'cards'>('cards');
	auth = getAuth();
	filterService = new LibraryFilterService();
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.libraries.plants.list);
		if (res) {
			this.entries = res.data as Plant[];
			this.filteredEntries = this.entries;
			this.loaded = true;
		}
	}

	search(): void {
		this.filteredEntries = this.filterService.search(this.entries, this.searchTerm, [
			'name',
			'latin_name'
		]);
	}

	addLocationFilter(location: PlantLocation | null): void {
		this.locationFilter = location;
		this.filteredEntries = this.filterService.byLocation(this.entries, location);
	}

	filterByUnidentified(): void {
		this.unidentifiedFilter = true;
		this.locationFilter = null;
		this.filteredEntries = this.filterService.byUnidentified(this.entries);
	}

	clearFilters(): void {
		this.locationFilter = null;
		this.unidentifiedFilter = false;
		this.filteredEntries = this.entries;
	}

	openCreateModal(entry?: Plant): void {
		if (entry) this.activeEntry = entry;
		this.createModalVisible = true;
		this.searchVisible = false;
	}

	closeCreateModal(): void {
		this.activeEntry = null;
		this.createModalVisible = false;
	}

	openDetailModal(entry: Plant) {
		this.activeEntry = entry;
		this.detailModalVisible = true;
		this.searchVisible = false;
	}

	closeDetailModal(): void {
		this.detailModalVisible = false;
		this.activeEntry = null;
	}

	switchView(): void {
		this.view = this.view === 'list' ? 'cards' : 'list';
	}

	async create(request: CreatePlantRequest, coverFile?: File): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.libraries.plants.create, request);
		if (!res) return false;
		if (coverFile) {
			const plant = res.data as Plant;
			await this.uploadCover(plant.id, coverFile);
		}
		await this.load();
		return true;
	}

	async uploadCover(plantId: string, file: File): Promise<boolean> {
		const formData = new FormData();
		formData.append('file', file);
		const res = await this.apiService.uploadFile(
			apiRoutes.libraries.plants.uploadCover,
			plantId,
			formData
		);
		if (res) await this.load();
		return res !== null;
	}

	async update(entry: Plant, request: UpdatePlantRequest): Promise<boolean> {
		const res = await this.apiService.update(apiRoutes.libraries.plants.update, entry.id, request);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async delete(entry: Plant): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.libraries.plants.delete, entry.id);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}
}

const PLANT_LIBRARY_KEY = Symbol('SOLYTO_PLANT_LIBRARY');

export function setPlantLibrary(): PlantLibrary {
	return setContext(PLANT_LIBRARY_KEY, new PlantLibrary());
}

export function getPlantLibrary(): PlantLibrary {
	return getContext<PlantLibrary>(PLANT_LIBRARY_KEY);
}
