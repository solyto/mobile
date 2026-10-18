import { describe, it, expect } from 'vitest';
import NavigationSettingsService from '$lib/services/NavigationSettingsService';
import { desktopOrder, mobileDefaultOrder, type FeatureType } from '$lib/config/navigation';

const service = new NavigationSettingsService();

const defaults: Record<FeatureType, boolean> = {
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
};

describe('NavigationSettingsService', () => {
	describe('parse', () => {
		it('returns null for a stored null', () => {
			expect(service.parse('null', defaults)).toBeNull();
		});

		it('reads the legacy flat format as visibility without custom orders', () => {
			const settings = service.parse(JSON.stringify({ calendar: false }), defaults);

			expect(settings).toEqual({ visible: { ...defaults, calendar: false }, desktop: null, mobile: null });
		});

		it('fills in features missing from the stored visibility', () => {
			const settings = service.parse(JSON.stringify({ visible: { notes: false } }), defaults);

			expect(settings!.visible.notes).toBe(false);
			expect(settings!.visible.timeTracking).toBe(true);
		});

		it('ignores unknown and non-boolean keys in both formats', () => {
			const legacy = service.parse(JSON.stringify({ calendar: false, tracker: true, plants: false }), defaults);
			const nested = service.parse(
				JSON.stringify({ visible: { notes: false, tracker: true, todos: 'yes' }, desktop: null }),
				defaults
			);

			expect(legacy!.visible).toEqual({ ...defaults, calendar: false });
			expect(nested!.visible).toEqual({ ...defaults, notes: false });
		});

		it('keeps a missing or null order as not customised', () => {
			const settings = service.parse(JSON.stringify({ visible: {}, mobile: null }), defaults);

			expect(settings!.desktop).toBeNull();
			expect(settings!.mobile).toBeNull();
		});

		it('keeps a complete stored order unchanged', () => {
			const mobile = ['home', ...mobileDefaultOrder.slice(1).reverse()];
			const settings = service.parse(JSON.stringify({ visible: {}, mobile }), defaults);

			expect(settings!.mobile).toEqual(mobile);
		});

		it('appends items missing from a stored order in their default order', () => {
			const settings = service.parse(JSON.stringify({ visible: {}, desktop: ['home', 'notes', 'todos'] }), defaults);

			expect(settings!.desktop).toEqual([
				'home',
				'notes',
				'todos',
				...desktopOrder.filter((slug) => !['home', 'notes', 'todos'].includes(slug))
			]);
		});

		it('drops unknown and duplicate slugs and pins home first', () => {
			const settings = service.parse(
				JSON.stringify({ visible: {}, desktop: ['notes', 'tracker', 'home', 'notes', 'dev-requests'] }),
				defaults
			);

			expect(settings!.desktop![0]).toBe('home');
			expect(settings!.desktop![1]).toBe('notes');
			expect(settings!.desktop).toHaveLength(desktopOrder.length);
			expect(settings!.desktop).not.toContain('tracker');
			expect(settings!.desktop).not.toContain('dev-requests');
		});
	});

	describe('build', () => {
		it('round-trips through parse', () => {
			const settings = {
				visible: { ...defaults, feeds: false },
				desktop: [...desktopOrder].reverse(),
				mobile: null
			};
			const parsed = service.parse(service.build(settings), defaults);

			expect(parsed!.visible).toEqual(settings.visible);
			expect(parsed!.mobile).toBeNull();
			expect(parsed!.desktop![0]).toBe('home');
			expect(parsed!.desktop!.slice(1)).toEqual([...desktopOrder].reverse().filter((slug) => slug !== 'home'));
		});
	});
});
