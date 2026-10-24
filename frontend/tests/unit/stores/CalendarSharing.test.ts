import { describe, it, expect, beforeEach } from 'vitest';
import { Calendars } from '$lib/state/Calendars.svelte';
import { CalendarSharing } from '$lib/state/CalendarSharing.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';
import { apiRoutes } from '$lib/config/apiRoutes';

function sharing(): CalendarSharing {
	const calendars = new Calendars();
	return new CalendarSharing(calendars.auth, calendars.apiService, calendars);
}

beforeEach(() => {
	resetStoreMocks();
});

describe('CalendarSharing store', () => {
	it('revokeShare deletes the share of the given user', async () => {
		api.delete.mockResolvedValue(true);
		const s = sharing();

		await expect(s.revokeShare(3, 'user-9')).resolves.toBe(true);
		expect(api.delete).toHaveBeenCalledWith(
			apiRoutes.calendars.revokeShare.replace('%d', '3'),
			'user-9'
		);
	});

	it('unsubscribeFromCalendar unsubscribes and reloads calendars', async () => {
		api.delete.mockResolvedValue(true);
		api.list.mockResolvedValue({ data: [] });
		const s = sharing();

		await expect(s.unsubscribeFromCalendar(3)).resolves.toBe(true);
		expect(api.delete).toHaveBeenCalledWith(apiRoutes.calendars.unsubscribe, 3);
		expect(api.list).toHaveBeenCalledWith(apiRoutes.calendars.listCalendars);
	});

	it('unsubscribeFromCalendar does not reload calendars on failure', async () => {
		api.delete.mockResolvedValue(false);
		const s = sharing();

		await expect(s.unsubscribeFromCalendar(3)).resolves.toBe(false);
		expect(api.list).not.toHaveBeenCalled();
	});
});
