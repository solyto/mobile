import { desktopOrder, mobileDefaultOrder, pinnedNavItem, type FeatureType } from '$lib/config/navigation';
import type { NavigationSettings } from '$lib/types/navigation';

type LegacyNavigationSettings = Partial<Record<FeatureType, boolean>>;

interface StoredNavigationSettings {
	visible: LegacyNavigationSettings;
	desktop?: unknown;
	mobile?: unknown;
}

export default class NavigationSettingsService {
	parse(raw: string, defaults: Record<FeatureType, boolean>): NavigationSettings | null {
		const parsed = JSON.parse(raw) as LegacyNavigationSettings | StoredNavigationSettings | null;

		if (!parsed) {
			return null;
		}

		if (!('visible' in parsed)) {
			return { visible: this.knownVisibility(parsed, defaults), desktop: null, mobile: null };
		}

		return {
			visible: this.knownVisibility(parsed.visible, defaults),
			desktop: this.completeOrder(parsed.desktop, desktopOrder),
			mobile: this.completeOrder(parsed.mobile, mobileDefaultOrder)
		};
	}

	build(settings: NavigationSettings): string {
		return JSON.stringify(settings);
	}

	// Only features this build knows are kept: unknown keys would render as
	// untitled toggles and be saved back.
	private knownVisibility(
		stored: LegacyNavigationSettings,
		defaults: Record<FeatureType, boolean>
	): Record<FeatureType, boolean> {
		const visible = { ...defaults };
		for (const feature of Object.keys(defaults) as FeatureType[]) {
			if (typeof stored?.[feature] === 'boolean') visible[feature] = stored[feature];
		}
		return visible;
	}

	private completeOrder(saved: unknown, defaults: string[]): string[] | null {
		if (!Array.isArray(saved)) {
			return null;
		}

		const known = saved.filter(
			(slug, index) => slug !== pinnedNavItem && defaults.includes(slug) && saved.indexOf(slug) === index
		);
		const missing = defaults.filter((slug) => slug !== pinnedNavItem && !known.includes(slug));

		return [pinnedNavItem, ...known, ...missing];
	}
}
