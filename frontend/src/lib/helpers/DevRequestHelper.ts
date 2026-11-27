import type { DevRequestStatus } from '$lib/types/dev_request';
import type { DevRecords } from '$lib/types/translation';

export const DEV_REQUEST_STATUSES: DevRequestStatus[] = [
	'backlog',
	'pending',
	'in-progress',
	'waiting-for-deployment',
	'waiting-for-user',
	'completed',
	'cancelled'
];

export function devRequestStatusLabels(t: DevRecords['requests']): Record<DevRequestStatus, string> {
	return {
		backlog: t.status_backlog,
		pending: t.status_pending,
		'in-progress': t.status_in_progress,
		'waiting-for-deployment': t.status_waiting_for_deployment,
		'waiting-for-user': t.status_waiting_for_user,
		completed: t.status_completed,
		cancelled: t.status_cancelled
	};
}
