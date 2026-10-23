import type { TimeTrackingEntry, TimeTrackingProject } from '$lib/types/time_tracking';

export interface ProjectBreakdown {
	projectId: string;
	title: string;
	color: string;
	minutes: number;
}

export const FALLBACK_PROJECT_COLOR = 'var(--color-c-neutral-4)';

export default class TimeTrackingGroupingService {
	/**
	 * Groups entries by their project, summing durations and taking each
	 * project's own colour. Entries without a project are ignored: the contract
	 * requires every entry to belong to a project.
	 */
	groupByProject(
		entries: TimeTrackingEntry[],
		projects: TimeTrackingProject[]
	): ProjectBreakdown[] {
		const projectsById = new Map(projects.map((p) => [p.id, p]));
		const groups = new Map<string, ProjectBreakdown>();

		for (const entry of entries) {
			const projectId = entry.project?.id;
			if (!projectId) continue;

			const existing = groups.get(projectId);
			if (existing) {
				existing.minutes += entry.duration_minutes;
				continue;
			}

			const project = projectsById.get(projectId) ?? entry.project;
			groups.set(projectId, {
				projectId,
				title: project?.title ?? '',
				color: project?.color ?? FALLBACK_PROJECT_COLOR,
				minutes: entry.duration_minutes
			});
		}

		return [...groups.values()].sort((a, b) => b.minutes - a.minutes);
	}
}
