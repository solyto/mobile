import { describe, it, expect } from 'vitest';
import { DEV_REQUEST_STATUSES, devRequestStatusLabels } from '$lib/helpers/DevRequestHelper';
import { en } from '$lib/i18n/en';

describe('devRequestStatusLabels', () => {
	it('labels every status, in the order the editor offers them', () => {
		const labels = devRequestStatusLabels(en.dev.requests);

		expect(DEV_REQUEST_STATUSES.map((status) => labels[status])).toEqual([
			'Backlog',
			'Pending',
			'In Progress',
			'Waiting for Deployment',
			'Waiting for User',
			'Completed',
			'Rejected'
		]);
	});
});
