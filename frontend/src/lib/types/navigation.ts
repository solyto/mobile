import type { FeatureType } from '$lib/config/navigation';

export type NavigationLayout = 'desktop' | 'mobile';

export interface NavigationSettings {
	visible: Record<FeatureType, boolean>;
	desktop: string[] | null;
	mobile: string[] | null;
}
