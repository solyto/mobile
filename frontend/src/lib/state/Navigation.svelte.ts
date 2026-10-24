import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import type { FeatureType, FeatureUsage, NavItem } from '$lib/config/navigation';
import type { NavigationLayout } from '$lib/types/navigation';
import { env } from '$env/dynamic/public';
import LocalStorageService from '$lib/services/LocalStorageService';
import NavigationSettingsService from '$lib/services/NavigationSettingsService';
import { desktopOrder, mobileDefaultOrder, mobileVisibleCount, navItems, pinnedNavItem } from '$lib/config/navigation';

export class Navigation {
	static readonly LS_USAGE_KEY: string = 'navigation_usage';
	static readonly LS_MOBILE_ORDER_KEY: string = 'navigation_mobile_order';

	loaded = $state<boolean>(false);
	auth: Auth;
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
	autoMobileOrder = $state<string[]>([...mobileDefaultOrder]);
	customOrders = $state<Record<NavigationLayout, string[] | null>>({ desktop: null, mobile: null });
	apiService: ApiService;
	localStorage: LocalStorageService;
	settingsService = new NavigationSettingsService();

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		localStorage: LocalStorageService = new LocalStorageService()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.localStorage = localStorage;
		void Promise.all([this.loadActiveFeatures(), this.loadUsage(), this.loadMobileOrder()]);
	}

	get desktopOrder(): string[] {
		return this.customOrders.desktop ?? desktopOrder;
	}

	get mobileOrder(): string[] {
		return this.customOrders.mobile ?? this.autoMobileOrder;
	}

	orderFor(layout: NavigationLayout): string[] {
		return layout === 'desktop' ? this.desktopOrder : this.mobileOrder;
	}

	mobileBarItems(): NavItem[] {
		return this.enabledItems(this.mobileOrder).slice(0, mobileVisibleCount);
	}

	mobileOverflowItems(): NavItem[] {
		return this.enabledItems(this.mobileOrder).slice(mobileVisibleCount);
	}

	isOrderCustomised(layout: NavigationLayout): boolean {
		return this.customOrders[layout] !== null;
	}

	async saveOrder(layout: NavigationLayout, order: string[]): Promise<void> {
		this.customOrders[layout] = order;
		await this.save();
	}

	async resetOrder(layout: NavigationLayout): Promise<void> {
		this.customOrders[layout] = null;
		await this.save();
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

	enabledItems(slugs: string[]): NavItem[] {
		return slugs
			.map((slug) => navItems[slug])
			.filter((item) => item.featureFlag === null || this.features[item.featureFlag]);
	}

	async loadMobileOrder(): Promise<void> {
		const saved = this.localStorage.getJson(Navigation.LS_MOBILE_ORDER_KEY) as string[] | null;
		if (saved) this.autoMobileOrder = saved;
	}

	saveMobileOrder(): void {
		this.localStorage.setJson(Navigation.LS_MOBILE_ORDER_KEY, this.autoMobileOrder);
	}

	promoteMobileItem(slug: string): void {
		if (this.isOrderCustomised('mobile')) return;

		const enabled = this.enabledItems(this.autoMobileOrder).map((item) => item.slug);
		if (enabled.indexOf(slug) < mobileVisibleCount) return;

		const barItems = enabled.slice(0, mobileVisibleCount).filter(s => s !== pinnedNavItem);
		const leastUsed = barItems.reduce((a, b) => {
			const aUsage = navItems[a]?.featureFlag ? (this.usage[navItems[a].featureFlag!] ?? 0) : 0;
			const bUsage = navItems[b]?.featureFlag ? (this.usage[navItems[b].featureFlag!] ?? 0) : 0;
			return aUsage <= bUsage ? a : b;
		});

		const order = [...this.autoMobileOrder];
		const submenuIndex = order.indexOf(slug);
		const leastUsedIndex = order.indexOf(leastUsed);
		order[leastUsedIndex] = slug;
		order[submenuIndex] = leastUsed;

		this.autoMobileOrder = order;
		this.saveMobileOrder();
	}

	async loadActiveFeatures(): Promise<void> {
		if (this.auth.user?.settings?.navigation !== undefined) {
			const settings = this.settingsService.parse(this.auth.user.settings.navigation, this.features);

			if (!settings) {
				await this.save();
				return;
			}

			this.features = settings.visible;
			this.customOrders = { desktop: settings.desktop, mobile: settings.mobile };
		}

		if (env.PUBLIC_DISABLE_DEV_REQUESTS === 'true') {
			this.features.dev_requests = false;
		}
	}

	async save(): Promise<void> {
		const navigation = this.settingsService.build({ visible: this.features, ...this.customOrders });
		this.auth.user!.settings.navigation = navigation;
		await this.auth.updateNavigation(navigation);
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
