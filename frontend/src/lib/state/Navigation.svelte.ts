import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import type { FeatureType, FeatureUsage } from '$lib/config/navigation';
import { env } from '$env/dynamic/public';
import LocalStorageService from '$lib/services/LocalStorageService';
import { mobileDefaultOrder, mobileVisibleCount, navItems } from '$lib/config/navigation';

export class Navigation {
	static readonly LS_USAGE_KEY: string = 'navigation_usage';
	static readonly LS_MOBILE_ORDER_KEY: string = 'navigation_mobile_order';

	loaded = $state<boolean>(false);
	auth = getAuth();
	features = $state<Record<FeatureType, boolean>>({
		calendar: true,
		todos: true,
		notes: true,
		libraries: true,
		contacts: true,
		checkIn: true,
		finances: true,
		feeds: true,
		clipboard: true,
		dev_requests: true,
		timeTracking: true
	});
	usage = $state<FeatureUsage>({});
	mobileOrder = $state<string[]>([...mobileDefaultOrder]);
	apiService: ApiService;
	localStorage = new LocalStorageService();

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
		void Promise.all([this.loadActiveFeatures(), this.loadUsage(), this.loadMobileOrder()]);
	}

	async loadUsage(): Promise<void> {
		this.usage = this.localStorage.getJson(Navigation.LS_USAGE_KEY) as FeatureUsage ?? {};
	}

	saveUsage(): void {
		this.localStorage.setJson(Navigation.LS_USAGE_KEY, this.usage);
	}

	addUsage(feature: FeatureType): void {
		this.usage[feature] = (this.usage[feature] ?? 0) + 1;
		this.saveUsage();
	}

	async loadMobileOrder(): Promise<void> {
		const saved = this.localStorage.getJson(Navigation.LS_MOBILE_ORDER_KEY) as string[] | null;
		if (saved) this.mobileOrder = saved;
	}

	saveMobileOrder(): void {
		this.localStorage.setJson(Navigation.LS_MOBILE_ORDER_KEY, this.mobileOrder);
	}

	promoteMobileItem(slug: string): void {
		const order = [...this.mobileOrder];
		const submenuIndex = order.indexOf(slug);
		if (submenuIndex < mobileVisibleCount) return;

		const barItems = order.slice(0, mobileVisibleCount).filter(s => s !== 'home');
		const leastUsed = barItems.reduce((a, b) => {
			const aUsage = navItems[a]?.featureFlag ? (this.usage[navItems[a].featureFlag!] ?? 0) : 0;
			const bUsage = navItems[b]?.featureFlag ? (this.usage[navItems[b].featureFlag!] ?? 0) : 0;
			return aUsage <= bUsage ? a : b;
		});

		const leastUsedIndex = order.indexOf(leastUsed);
		order[leastUsedIndex] = slug;
		order[submenuIndex] = leastUsed;

		this.mobileOrder = order;
		this.saveMobileOrder();
	}

	async loadActiveFeatures(): Promise<void> {
		if (this.auth.user?.settings?.navigation !== undefined) {
			const loadedFeatures: Record<FeatureType, boolean> = JSON.parse(
				this.auth.user.settings.navigation
			);

			if (!loadedFeatures) {
				await this.save();
				return;
			}

			for (const type of Object.keys(this.features)) {
				if (!(type in loadedFeatures)) {
					loadedFeatures[type as FeatureType] = true;
				}
			}

			this.features = loadedFeatures;
		}

		if (env.PUBLIC_DISABLE_DEV_REQUESTS === 'true') {
			this.features.dev_requests = false;
		}
	}

	async save(): Promise<void> {
		const features = JSON.stringify(this.features);
		this.auth.user!.settings.navigation = features;
		await this.auth.updateNavigation(features);
		await this.auth.loadAdditionalData();
	}
}

const NAVIGATION_KEY = Symbol('SOLYTO_NAVIGATION');

export function setNavigation(): Navigation {
	return setContext(NAVIGATION_KEY, new Navigation());
}

export function getNavigation(): Navigation {
	return getContext<Navigation>(NAVIGATION_KEY);
}
