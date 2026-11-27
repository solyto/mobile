export interface IconPickerIcon {
	categories: string[];
	tags: string[];
}

export interface IconPickerData {
	lucideVersion: string;
	categories: string[];
	icons: Record<string, IconPickerIcon>;
}

// Categories in the order the picker offers them: the ones trackers are most often about first.
// Coding, cursor, layout and text-formatting icons stay out of browsing (they are still found by search).
export const ICON_PICKER_CATEGORIES = [
	'food-beverage', 'sports', 'medical', 'nature', 'people', 'emoji', 'home', 'animals', 'seasons', 'weather',
	'time', 'travel', 'transportation', 'multimedia', 'gaming', 'social', 'communication', 'science', 'finance',
	'shopping', 'buildings', 'photography', 'tools', 'sustainability', 'security', 'devices', 'connectivity',
	'accessibility', 'account', 'notifications', 'mail', 'files', 'charts', 'math', 'shapes', 'design',
	'navigation', 'arrows'
];

export const ICON_SEARCH_LIMIT = 240;

export default class IconPickerService {
	filter(data: IconPickerData, category: string, query: string): string[] {
		const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
		const names = Object.keys(data.icons);

		if (terms.length === 0) {
			return names.filter((name) => data.icons[name].categories.includes(category));
		}

		return names
			.filter((name) => terms.every((term) => this.matches(name, data.icons[name], term)))
			.slice(0, ICON_SEARCH_LIMIT);
	}

	private matches(name: string, icon: IconPickerIcon, term: string): boolean {
		return name.includes(term) || icon.tags.some((tag) => tag.toLowerCase().includes(term));
	}
}
