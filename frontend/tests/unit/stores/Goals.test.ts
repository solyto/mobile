import { describe, it, expect, beforeEach } from 'vitest';
import { Goals } from '$lib/state/Goals.svelte';
import { api, auth, resetStoreMocks } from '../setup/storeMocks';
import { goal } from '../helpers/factories';

beforeEach(() => {
	resetStoreMocks();
});

describe('Goals store', () => {
	it('loads the goals', async () => {
		api.list.mockResolvedValue({ data: [goal()] });
		const s = new Goals();

		await s.load();

		expect(s.loaded).toBe(true);
		expect(s.goals).toEqual([goal()]);
	});

	it('stays unloaded when loading fails', async () => {
		api.list.mockResolvedValue(null);
		const s = new Goals();

		await s.load();

		expect(s.loaded).toBe(false);
	});

	it('finds a tracker\'s goal', () => {
		const s = new Goals();
		s.goals = [goal(), goal({ id: 2, check_in_tracker_id: 4 })];

		expect(s.forTracker(4)?.id).toBe(2);
		expect(s.forTracker(9)).toBeNull();
	});

	it('creates, updates and deletes on their URLs, then reloads and tells the widgets', async () => {
		api.create.mockResolvedValue({ data: goal() });
		api.put.mockResolvedValue(true);
		api.delete.mockResolvedValue(true);
		api.list.mockResolvedValue({ data: [] });
		const s = new Goals();
		const request = { source: 'check_in_tracker', check_in_tracker_id: 3, period: 'week', comparison: 'at_least', target: 3, notify_when_reached: true } as const;

		expect(await s.create(request)).toBe(true);
		expect(await s.update(goal({ id: 5 }), { target: 4 })).toBe(true);
		expect(await s.delete(goal({ id: 5 }))).toBe(true);

		expect(api.create).toHaveBeenCalledWith(expect.stringMatching(/\/goals$/), request);
		expect(api.put).toHaveBeenCalledWith(expect.stringMatching(/\/goals\/5$/), { target: 4 });
		expect(api.delete).toHaveBeenCalledWith(expect.stringMatching(/\/goals\/%d$/), 5);
		expect(api.list).toHaveBeenCalledTimes(3);
		expect(auth.widgetBridge.notifyChanged).toHaveBeenCalledTimes(3);
	});

	it('does not reload when a change is rejected', async () => {
		api.put.mockResolvedValue(false);
		const s = new Goals();

		expect(await s.update(goal(), { target: 4 })).toBe(false);
		expect(api.list).not.toHaveBeenCalled();
	});
});
