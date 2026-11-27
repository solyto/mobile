import { describe, it, expect } from 'vitest';
import DevRequestFilterService from '$lib/services/DevRequestFilterService';
import type { DevRequest, DevRequestFilter, DevRequestStatus } from '$lib/types/dev_request';
import { devRequest as request } from '../helpers/factories';

const service = new DevRequestFilterService();
const ids = (requests: DevRequest[]) => requests.map((r) => r.id);

const statuses: DevRequestStatus[] = ['backlog', 'pending', 'in-progress', 'waiting-for-deployment', 'cancelled', 'completed', 'waiting-for-user'];
const requests = statuses.map((status, index) => request({ id: index + 1, status }));
const filters: DevRequestFilter[] = ['all', 'backlog', 'open', 'in-progress', 'waiting-for-deployment', 'waiting-for-user'];

describe('filter', () => {
	it('returns everything for "all"', () => {
		expect(ids(service.filter(requests, 'all'))).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('includes only backlog and pending for "open"', () => {
		expect(ids(service.filter(requests, 'open'))).toEqual([1, 2]);
	});

	it('matches a single status for the status filters', () => {
		expect(ids(service.filter(requests, 'backlog'))).toEqual([1]);
		expect(ids(service.filter(requests, 'in-progress'))).toEqual([3]);
		expect(ids(service.filter(requests, 'waiting-for-deployment'))).toEqual([4]);
		expect(ids(service.filter(requests, 'waiting-for-user'))).toEqual([7]);
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
		const mixed = [...requests, request({ id: 8, status: 'backlog' }), request({ id: 9, status: 'pending' })];
		const counts = Object.fromEntries(filters.map((f) => [f, service.filter(mixed, f).length]));
		expect(counts).toEqual({ 'all': 9, 'backlog': 2, 'open': 4, 'in-progress': 1, 'waiting-for-deployment': 1, 'waiting-for-user': 1 });
	});
});

describe('resolved and unresolved', () => {
	const mixed = [
		request({ id: 1, status: 'backlog' }),
		request({ id: 2, status: 'completed' }),
		request({ id: 3, status: 'waiting-for-user' }),
		request({ id: 4, status: 'cancelled' })
	];

	it('splits completed and rejected requests from the rest, keeping the order', () => {
		expect(ids(service.unresolved(mixed))).toEqual([1, 3]);
		expect(ids(service.resolved(mixed))).toEqual([2, 4]);
	});
});
