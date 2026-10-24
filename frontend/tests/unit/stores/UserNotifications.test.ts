import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserNotifications } from '$lib/state/UserNotifications.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';
import type { UserNotification } from '$lib/types/user_notification';

function notification(overrides: Partial<UserNotification> = {}): UserNotification {
	return {
		id: 'n1',
		title: 'Title',
		body: 'Body',
		link: null,
		read_at: null,
		created_at: '2026-08-01T10:00:00Z',
		...overrides
	};
}

beforeEach(() => {
	resetStoreMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe('UserNotifications store', () => {
	describe('getUnread', () => {
		it('returns only unread notifications', () => {
			const s = new UserNotifications();
			s.notifications = [
				notification(),
				notification({ id: 'n2', read_at: '2026-08-02T00:00:00Z' })
			];
			expect(s.getUnread().map((n) => n.id)).toEqual(['n1']);
		});
	});

	describe('markRead', () => {
		it('calls the mark-read endpoint with the id', async () => {
			api.update.mockResolvedValue(true);
			const s = new UserNotifications();
			await s.markRead(notification());
			// the %s placeholder is replaced inside ApiService, not the store
			expect(api.update).toHaveBeenCalledWith(
				expect.stringContaining('/notifications/%s/read'),
				'n1',
				{}
			);
		});
	});

	describe('markAllRead', () => {
		it('marks every notification as read locally', async () => {
			api.create.mockResolvedValue(true);
			const s = new UserNotifications();
			s.notifications = [notification(), notification({ id: 'n2' })];
			await s.markAllRead();
			expect(api.create).toHaveBeenCalledWith(expect.stringContaining('/read-all'), {});
			expect(s.notifications.every((n) => n.read_at !== null)).toBe(true);
		});

		it('keeps the existing read timestamps', async () => {
			api.create.mockResolvedValue(true);
			const s = new UserNotifications();
			const read = notification({ id: 'n1', read_at: '2026-08-02T00:00:00Z' });
			s.notifications = [read];
			await s.markAllRead();
			expect(s.notifications[0].read_at).toBe('2026-08-02T00:00:00Z');
		});
	});

	describe('load and polling', () => {
		it('fetches the notifications and registers the visibility handler', async () => {
			const addEventListener = vi.fn();
			vi.stubGlobal('document', {
				hidden: false,
				addEventListener,
				removeEventListener: vi.fn()
			});
			api.list.mockResolvedValue({ data: [notification()] });

			const s = new UserNotifications();
			await s.load();

			expect(s.loaded).toBe(true);
			expect(s.notifications).toHaveLength(1);
			expect(addEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
		});

		it('polls for new notifications on an interval', async () => {
			vi.useFakeTimers();
			const addEventListener = vi.fn();
			vi.stubGlobal('document', {
				hidden: false,
				addEventListener,
				removeEventListener: vi.fn()
			});
			api.list.mockResolvedValue({ data: [] });

			const s = new UserNotifications();
			await s.load();
			expect(api.list).toHaveBeenCalledTimes(1);

			vi.advanceTimersByTime(5 * 60 * 1000);
			expect(api.list).toHaveBeenCalledTimes(2);

			s.destroy();
			vi.advanceTimersByTime(5 * 60 * 1000);
			expect(api.list).toHaveBeenCalledTimes(2);
		});

		it('destroy removes the visibility handler and stops polling', async () => {
			const addEventListener = vi.fn();
			const removeEventListener = vi.fn();
			vi.stubGlobal('document', { hidden: false, addEventListener, removeEventListener });
			api.list.mockResolvedValue({ data: [] });

			const s = new UserNotifications();
			await s.load();
			s.destroy();

			expect(removeEventListener).toHaveBeenCalledWith(
				'visibilitychange',
				expect.any(Function)
			);
			expect(s.destroy).toBeDefined();
		});
	});
});
