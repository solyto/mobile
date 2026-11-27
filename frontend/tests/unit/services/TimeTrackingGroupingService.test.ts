import { describe, it, expect } from 'vitest';
import TimeTrackingGroupingService, {
	FALLBACK_PROJECT_COLOR
} from '$lib/services/TimeTrackingGroupingService';
import { timeTrackingCategory, timeTrackingEntry, timeTrackingProject as project } from '../helpers/factories';

const service = new TimeTrackingGroupingService();

function entry(projectId: string | null, durationMinutes: number, overrides: Parameters<typeof timeTrackingEntry>[0] = {}) {
	return timeTrackingEntry({
		id: `e-${Math.random()}`,
		duration_minutes: durationMinutes,
		project: projectId ? project({ id: projectId, title: projectId }) : null,
		...overrides
	});
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
				categories: [timeTrackingCategory({ id: 1, title: 'Cat', color: '#00ff00' })]
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

describe('groupFinishedSince', () => {
	const since = new Date('2026-10-12T00:00:00.000Z');

	it('groups only finished entries started at or after the given moment', () => {
		const projects = [project({ id: 'p1', title: 'One' })];
		const result = service.groupFinishedSince(
			[
				entry('p1', 30, { started_at: '2026-10-12T00:00:00.000Z' }),
				entry('p1', 20, { started_at: '2026-10-11T23:59:59.000Z' }),
				entry('p1', 40, { started_at: '2026-10-13T08:00:00.000Z', stopped_at: null })
			],
			projects,
			since
		);

		expect(result).toEqual([expect.objectContaining({ projectId: 'p1', minutes: 30 })]);
	});
});

describe('groupByCategory', () => {
	it('adds each project total to all of its categories, largest first', () => {
		const design = timeTrackingCategory({ id: 1, title: 'Design' });
		const code = timeTrackingCategory({ id: 2, title: 'Code' });
		const projects = [
			project({ id: 'p1', categories: [design, code] }),
			project({ id: 'p2', categories: [code] })
		];
		const statistics = [
			{ project_id: 'p1', project_title: 'One', color: null, total_minutes: 30 },
			{ project_id: 'p2', project_title: 'Two', color: null, total_minutes: 45 },
			{ project_id: 'gone', project_title: 'Deleted', color: null, total_minutes: 99 }
		];

		expect(service.groupByCategory(statistics, projects)).toEqual([
			{ title: 'Code', minutes: 75 },
			{ title: 'Design', minutes: 30 }
		]);
	});
});

describe('groupByDay', () => {
	it('groups entries under their day label in first-seen order', () => {
		const first = entry('p1', 10, { started_at: '2026-10-14T08:00:00.000Z' });
		const second = entry('p1', 20, { started_at: '2026-10-13T08:00:00.000Z' });
		const third = entry('p1', 30, { started_at: '2026-10-14T18:00:00.000Z' });

		const result = service.groupByDay([first, second, third], (startedAt) => startedAt.slice(0, 10));

		expect(result).toEqual([
			{ date: '2026-10-14', entries: [first, third] },
			{ date: '2026-10-13', entries: [second] }
		]);
	});
});

describe('totalMinutes', () => {
	it('sums the minutes of a breakdown', () => {
		expect(service.totalMinutes([{ minutes: 30 }, { minutes: 15 }])).toBe(45);
		expect(service.totalMinutes([])).toBe(0);
	});
});
