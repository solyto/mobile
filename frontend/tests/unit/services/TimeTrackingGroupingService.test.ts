import { describe, it, expect } from 'vitest';
import TimeTrackingGroupingService, {
	FALLBACK_PROJECT_COLOR
} from '$lib/services/TimeTrackingGroupingService';
import type { TimeTrackingEntry, TimeTrackingProject } from '$lib/types/time_tracking';

const service = new TimeTrackingGroupingService();

function project(overrides: Partial<TimeTrackingProject> = {}): TimeTrackingProject {
	return {
		id: 'p1',
		title: 'Project',
		description: null,
		color: null,
		categories: [],
		total_duration: 0,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function entry(
	projectId: string | null,
	durationMinutes: number,
	overrides: Partial<TimeTrackingEntry> = {}
): TimeTrackingEntry {
	return {
		id: `e-${Math.random()}`,
		description: null,
		started_at: '2026-10-01T09:00:00.000Z',
		stopped_at: '2026-10-01T10:00:00.000Z',
		duration_minutes: durationMinutes,
		has_exact_times: false,
		project: projectId ? project({ id: projectId, title: projectId }) : null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

describe('groupByProject', () => {
	it('sums minutes per project and sorts descending', () => {
		const projects = [project({ id: 'p1', title: 'One' }), project({ id: 'p2', title: 'Two' })];
		const result = service.groupByProject(
			[entry('p1', 30), entry('p2', 10), entry('p1', 20)],
			projects
		);

		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({ projectId: 'p1', title: 'One', minutes: 50 });
		expect(result[1]).toMatchObject({ projectId: 'p2', title: 'Two', minutes: 10 });
	});

	it("uses the project's own colour, not its first category", () => {
		const projects = [
			project({
				id: 'p1',
				title: 'One',
				color: '#ff0000',
				categories: [
					{
						id: 1,
						title: 'Cat',
						color: '#00ff00',
						created_at: '',
						updated_at: ''
					}
				]
			})
		];
		const result = service.groupByProject([entry('p1', 30)], projects);

		expect(result[0].color).toBe('#ff0000');
	});

	it('falls back to the theme variable when a project has no colour', () => {
		const projects = [project({ id: 'p1', title: 'One', color: null })];
		const result = service.groupByProject([entry('p1', 30)], projects);

		expect(result[0].color).toBe(FALLBACK_PROJECT_COLOR);
	});

	it('ignores entries with no project', () => {
		const result = service.groupByProject([entry(null, 30)], []);
		expect(result).toHaveLength(0);
	});

	it('does not mutate the input entries', () => {
		const projects = [project({ id: 'p1', title: 'One' })];
		const entries = [entry('p1', 30), entry('p1', 15)];
		const original = entries.map((e) => e.duration_minutes);
		service.groupByProject(entries, projects);
		expect(entries.map((e) => e.duration_minutes)).toEqual(original);
	});
});
