import type { DevRequest, DevRequestFilter, DevRequestStatus } from '$lib/types/dev_request';

const STATUSES: Record<Exclude<DevRequestFilter, 'all'>, DevRequestStatus[]> = {
	'backlog': ['backlog'],
	'open': ['backlog', 'pending'],
	'in-progress': ['in-progress'],
	'waiting-for-deployment': ['waiting-for-deployment']
};

export default class DevRequestFilterService {
	filter(requests: DevRequest[], filter: DevRequestFilter): DevRequest[] {
		if (filter === 'all') return requests;
		return requests.filter((r) => STATUSES[filter].includes(r.status));
	}
}
