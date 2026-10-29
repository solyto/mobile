import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Navigation } from '$lib/state/Navigation.svelte';
import { storage, auth, resetStoreMocks } from '../setup/storeMocks';

// the storeMocks auth user has `settings: {}`; navigation is a JSON string
// stored on those settings, so the tests reach it through a small cast
type SettingsWithNavigation = { navigation?: string };
const settings = () => auth.user.settings as SettingsWithNavigation;

beforeEach(() => {
	resetStoreMocks();
	delete settings().navigation;
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

	describe('mobile bar split', () => {
		it('fills the bar with five enabled items when a bar feature is disabled', () => {
			const s = new Navigation();
			s.features.calendar = false;

			expect(s.mobileBarItems().map((item) => item.slug)).toEqual([
				'home',
				'todos',
				'check-in',
				'libraries',
				'notes'
			]);
			expect(s.mobileOverflowItems()[0].slug).toBe('contacts');
			expect(s.mobileOverflowItems().map((item) => item.slug)).not.toContain('calendar');
		});

		it('promotes based on enabled items only', () => {
			const s = new Navigation();
			s.features.calendar = false;
			s.usage = { todos: 5, checkIn: 3, libraries: 2, notes: 4 };

			s.promoteMobileItem('notes');
			expect(storage.setJson).not.toHaveBeenCalled();

			s.promoteMobileItem('contacts');
			expect(s.mobileBarItems().map((item) => item.slug)).toContain('contacts');
			expect(s.mobileBarItems().map((item) => item.slug)).not.toContain('libraries');
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
			s.autoMobileOrder = ['home', 'notes'];
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

		it('applies saved custom orders', async () => {
			settings().navigation = JSON.stringify({
				visible: { notes: false },
				desktop: ['home', 'notes', 'todos'],
				mobile: null
			});
			const s = new Navigation();
			await s.loadActiveFeatures();
			expect(s.features.notes).toBe(false);
			expect(s.desktopOrder.slice(0, 3)).toEqual(['home', 'notes', 'todos']);
			expect(s.isOrderCustomised('desktop')).toBe(true);
			expect(s.isOrderCustomised('mobile')).toBe(false);
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

	describe('custom orders', () => {
		it('falls back to the default desktop order and the auto mobile order', () => {
			const s = new Navigation();
			s.autoMobileOrder = ['home', 'notes', 'todos'];
			expect(s.desktopOrder[1]).toBe('calendar');
			expect(s.mobileOrder).toEqual(['home', 'notes', 'todos']);
		});

		it('saveOrder stores the order for one layout and persists it', async () => {
			auth.updateNavigation.mockResolvedValue(undefined);
			auth.loadAdditionalData.mockResolvedValue(undefined);

			const s = new Navigation();
			await s.saveOrder('mobile', ['home', 'notes', 'todos']);

			expect(s.mobileOrder).toEqual(['home', 'notes', 'todos']);
			expect(s.desktopOrder[1]).toBe('calendar');
			expect(JSON.parse(settings().navigation!).mobile).toEqual(['home', 'notes', 'todos']);
		});

		it('resetOrder returns the layout to its default', async () => {
			auth.updateNavigation.mockResolvedValue(undefined);
			auth.loadAdditionalData.mockResolvedValue(undefined);

			const s = new Navigation();
			await s.saveOrder('desktop', ['home', 'notes']);
			await s.resetOrder('desktop');

			expect(s.isOrderCustomised('desktop')).toBe(false);
			expect(s.desktopOrder[1]).toBe('calendar');
		});

		it('a custom mobile order turns off auto-promotion', async () => {
			auth.updateNavigation.mockResolvedValue(undefined);
			auth.loadAdditionalData.mockResolvedValue(undefined);

			const s = new Navigation();
			await s.saveOrder('mobile', ['home', 'todos', 'calendar', 'check-in', 'libraries', 'notes']);
			storage.setJson.mockClear();
			s.promoteMobileItem('notes');

			expect(s.mobileOrder[5]).toBe('notes');
			expect(storage.setJson).not.toHaveBeenCalled();
		});
	});

	describe('save', () => {
		it('writes visibility and orders back through the auth store', async () => {
			auth.updateNavigation.mockResolvedValue(undefined);
			auth.loadAdditionalData.mockResolvedValue(undefined);

			const s = new Navigation();
			s.features.calendar = false;
			await s.save();

			const expected = JSON.stringify({ visible: s.features, desktop: null, mobile: null });
			expect(settings().navigation).toBe(expected);
			expect(auth.updateNavigation).toHaveBeenCalledWith(expected);
			expect(auth.loadAdditionalData).toHaveBeenCalled();
		});
	});
});
