import type { DevRequest, DevRequestStatus } from '$lib/types/dev_request';

export default class DevRequestSortingService {
	sort(requests: DevRequest[]): DevRequest[] {
		const rank = (status: DevRequestStatus) => {
			if (status === 'completed') return 2;
			if (status === 'cancelled') return 1;
			return 0;
		};

		return [...requests].sort((a, b) => {
			if (rank(a.status) !== rank(b.status)) return rank(a.status) - rank(b.status);
			if (a.score !== b.score) return b.score - a.score;
			return (b.priority ?? 0) - (a.priority ?? 0);
		});
	}
}
