import { describe, it, expect } from 'vitest';
import DevRequestFilterService from '$lib/services/DevRequestFilterService';
import type { DevRequest, DevRequestFilter, DevRequestStatus } from '$lib/types/dev_request';

function request(overrides: Partial<DevRequest> = {}): DevRequest {
	return {
		id: 1,
		type: 'feature',
		status: 'pending',
		priority: null,
		title: 'Test request',
		description: '',
		screenshot: '',
		url: '',
		created_at: '',
		updated_at: '',
		upvotes: 0,
		downvotes: 0,
		score: 0,
		user_vote: 'up',
		comment_count: 0,
		fixed_in_version: null,
		created_by_user_id: null,
		created_by_user: { id: '', name: '' },
		...overrides
	};
}

const service = new DevRequestFilterService();
const ids = (requests: DevRequest[]) => requests.map((r) => r.id);

const statuses: DevRequestStatus[] = ['backlog', 'pending', 'in-progress', 'waiting-for-deployment', 'cancelled', 'completed'];
const requests = statuses.map((status, index) => request({ id: index + 1, status }));
const filters: DevRequestFilter[] = ['all', 'backlog', 'open', 'in-progress', 'waiting-for-deployment'];

describe('filter', () => {
	it('returns everything for "all"', () => {
		expect(ids(service.filter(requests, 'all'))).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('includes only backlog and pending for "open"', () => {
		expect(ids(service.filter(requests, 'open'))).toEqual([1, 2]);
	});

	it('matches a single status for the status filters', () => {
		expect(ids(service.filter(requests, 'backlog'))).toEqual([1]);
		expect(ids(service.filter(requests, 'in-progress'))).toEqual([3]);
		expect(ids(service.filter(requests, 'waiting-for-deployment'))).toEqual([4]);
	});

	it('never matches completed or cancelled for a status filter', () => {
		for (const filter of filters.filter((f) => f !== 'all')) {
			const result = service.filter(requests, filter);
			expect(result.some((r) => r.status === 'completed' || r.status === 'cancelled')).toBe(false);
		}
	});

	it('keeps the input order', () => {
		const unordered = [
			request({ id: 7, status: 'pending' }),
			request({ id: 3, status: 'in-progress' }),
			request({ id: 9, status: 'backlog' }),
			request({ id: 1, status: 'pending' })
		];
		expect(ids(service.filter(unordered, 'open'))).toEqual([7, 9, 1]);
	});

	it('gives counts that match the filtered lists', () => {
		const mixed = [...requests, request({ id: 7, status: 'backlog' }), request({ id: 8, status: 'pending' })];
		const counts = Object.fromEntries(filters.map((f) => [f, service.filter(mixed, f).length]));
		expect(counts).toEqual({ 'all': 8, 'backlog': 2, 'open': 4, 'in-progress': 1, 'waiting-for-deployment': 1 });
	});
});
