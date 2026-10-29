import { describe, it, expect } from 'vitest';
import DevRequestSortingService from '$lib/services/DevRequestSortingService';
import type { DevRequest } from '$lib/types/dev_request';

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

const service = new DevRequestSortingService();
const ids = (requests: DevRequest[]) => requests.map((r) => r.id);

describe('sort', () => {
	it('orders by score descending', () => {
		const requests = [
			request({ id: 1, score: 2 }),
			request({ id: 2, score: 10 }),
			request({ id: 3, score: -3 })
		];
		expect(ids(service.sort(requests))).toEqual([2, 1, 3]);
	});

	it('uses priority descending as the tie-breaker for equal scores', () => {
		const requests = [
			request({ id: 1, score: 5, priority: 2 }),
			request({ id: 2, score: 5, priority: 4 }),
			request({ id: 3, score: 7, priority: 1 })
		];
		expect(ids(service.sort(requests))).toEqual([3, 2, 1]);
	});

	it('treats a null priority as 0', () => {
		const requests = [
			request({ id: 1, score: 5, priority: null }),
			request({ id: 2, score: 5, priority: 1 })
		];
		expect(ids(service.sort(requests))).toEqual([2, 1]);
	});

	it('puts cancelled after open and completed after cancelled, regardless of score', () => {
		const requests = [
			request({ id: 1, status: 'completed', score: 100 }),
			request({ id: 2, status: 'cancelled', score: 50 }),
			request({ id: 3, status: 'in-progress', score: 1 }),
			request({ id: 4, status: 'backlog', score: 2 })
		];
		expect(ids(service.sort(requests))).toEqual([4, 3, 2, 1]);
	});

	it('orders by score within the completed and cancelled groups', () => {
		const requests = [
			request({ id: 1, status: 'completed', score: 1 }),
			request({ id: 2, status: 'completed', score: 9 }),
			request({ id: 3, status: 'cancelled', score: 1 }),
			request({ id: 4, status: 'cancelled', score: 9 })
		];
		expect(ids(service.sort(requests))).toEqual([4, 3, 2, 1]);
	});

	it('does not mutate the input array', () => {
		const requests = [request({ id: 1, score: 1 }), request({ id: 2, score: 2 })];
		service.sort(requests);
		expect(ids(requests)).toEqual([1, 2]);
	});
});
