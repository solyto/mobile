import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Navigation } from '$lib/state/Navigation.svelte';
import { storage, auth, resetStoreMocks } from '../setup/storeMocks';

// the storeMocks auth user has `settings: {}`; navigation is a JSON string
// stored on those settings, so the tests reach it through a small cast
type SettingsWithNavigation = { navigation?: string };
const settings = () => auth.user.settings as SettingsWithNavigation;

beforeEach(() => {
	resetStoreMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Navigation store', () => {
	describe('usage tracking', () => {
		it('loadUsage reads the persisted usage', async () => {
			storage.getJson.mockReturnValue({ todos: 3 });
			const s = new Navigation();
			await s.loadUsage();
			expect(s.usage).toEqual({ todos: 3 });
		});

		it('addUsage increments and persists', () => {
			const s = new Navigation();
			s.addUsage('todos');
			s.addUsage('todos');
			s.addUsage('calendar');
			expect(s.usage).toEqual({ todos: 2, calendar: 1 });
			expect(storage.setJson).toHaveBeenCalledWith(Navigation.LS_USAGE_KEY, {
				todos: 2,
				calendar: 1
			});
		});
	});

	describe('promoteMobileItem', () => {
		it('does nothing for an item already in the visible bar', () => {
			const s = new Navigation();
			s.promoteMobileItem('todos');
			expect(s.mobileOrder[0]).toBe('home');
			expect(s.mobileOrder[1]).toBe('todos');
			expect(storage.setJson).not.toHaveBeenCalled();
		});

		it('swaps a submenu item with the least used bar item', () => {
			const s = new Navigation();
			// visible bar: home, todos, calendar, check-in, libraries (5)
			s.usage = { todos: 5, calendar: 4, checkIn: 3, libraries: 0 };
			s.promoteMobileItem('notes');

			// notes moved into the bar at the libraries slot, libraries pushed out
			expect(s.mobileOrder).toEqual([
				'home',
				'todos',
				'calendar',
				'check-in',
				'notes',
				'libraries',
				'contacts',
				'finances',
				'time-tracking',
				'feeds',
				'clipboard',
				'dev-requests'
			]);
			expect(storage.setJson).toHaveBeenCalledWith(
				Navigation.LS_MOBILE_ORDER_KEY,
				s.mobileOrder
			);
		});

		it('keeps home in the bar when swapping', () => {
			const s = new Navigation();
			s.usage = { todos: 5, calendar: 4, checkIn: 3, libraries: 2, notes: 0 };
			s.promoteMobileItem('notes');
			// home must never leave the bar
			expect(s.mobileOrder[0]).toBe('home');
			// the least used among todos/calendar/check-in/libraries is libraries
			expect(s.mobileOrder[4]).toBe('notes');
		});
	});

	describe('mobile order persistence', () => {
		it('loadMobileOrder restores a saved order', async () => {
			storage.getJson.mockReturnValue(['home', 'notes', 'todos']);
			const s = new Navigation();
			await s.loadMobileOrder();
			expect(s.mobileOrder).toEqual(['home', 'notes', 'todos']);
		});

		it('loadMobileOrder keeps the default when nothing is saved', async () => {
			storage.getJson.mockReturnValue(null);
			const s = new Navigation();
			await s.loadMobileOrder();
			expect(s.mobileOrder).toHaveLength(12);
		});

		it('saveMobileOrder persists the current order', () => {
			const s = new Navigation();
			s.mobileOrder = ['home', 'notes'];
			s.saveMobileOrder();
			expect(storage.setJson).toHaveBeenCalledWith(Navigation.LS_MOBILE_ORDER_KEY, [
				'home',
				'notes'
			]);
		});
	});

	describe('loadActiveFeatures', () => {
		it('defaults every feature to enabled without saved navigation settings', async () => {
			const s = new Navigation();
			await s.loadActiveFeatures();
			expect(s.features.todos).toBe(true);
			expect(s.features.dev_requests).toBe(true);
		});

		it('merges saved settings with defaults for missing features', async () => {
			settings().navigation = JSON.stringify({ calendar: false });
			const s = new Navigation();
			await s.loadActiveFeatures();
			expect(s.features.calendar).toBe(false);
			expect(s.features.todos).toBe(true);
			expect(s.features.notes).toBe(true);
		});

		it('persists and returns early when the saved settings parse to null', async () => {
			settings().navigation = 'null';
			auth.updateNavigation.mockResolvedValue(undefined);
			auth.loadAdditionalData.mockResolvedValue(undefined);

			const s = new Navigation();
			await s.loadActiveFeatures();

			expect(auth.updateNavigation).toHaveBeenCalled();
			expect(s.features.todos).toBe(true);
		});
	});

	describe('save', () => {
		it('writes the serialised features back through the auth store', async () => {
			auth.updateNavigation.mockResolvedValue(undefined);
			auth.loadAdditionalData.mockResolvedValue(undefined);

			const s = new Navigation();
			s.features.calendar = false;
			await s.save();

			expect(settings().navigation).toBe(JSON.stringify(s.features));
			expect(auth.updateNavigation).toHaveBeenCalledWith(JSON.stringify(s.features));
			expect(auth.loadAdditionalData).toHaveBeenCalled();
		});
	});
});
