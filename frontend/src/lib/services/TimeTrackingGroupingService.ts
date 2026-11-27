import type {
	TimeTrackingEntry,
	TimeTrackingProject,
	TimeTrackingStatisticsEntry
} from '$lib/types/time_tracking';

export interface ProjectBreakdown {
	projectId: string;
	title: string;
	color: string;
	minutes: number;
}

export interface CategoryBreakdown {
	title: string;
	minutes: number;
}

export interface EntriesOfDay {
	date: string;
	entries: TimeTrackingEntry[];
}

export const FALLBACK_PROJECT_COLOR = 'var(--color-c-neutral-4)';

export default class TimeTrackingGroupingService {
	groupByProject(
		entries: TimeTrackingEntry[],
		projects: TimeTrackingProject[]
	): ProjectBreakdown[] {
		const projectsById = new Map(projects.map((p) => [p.id, p]));
		const groups = new Map<string, ProjectBreakdown>();

		for (const entry of entries) {
			const projectId = entry.project?.id;
			// The API contract requires every entry to belong to a project.
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

	groupFinishedSince(
		entries: TimeTrackingEntry[],
		projects: TimeTrackingProject[],
		since: Date
	): ProjectBreakdown[] {
		const finished = entries.filter((e) => e.stopped_at !== null && new Date(e.started_at) >= since);
		return this.groupByProject(finished, projects);
	}

	groupByCategory(
		statistics: TimeTrackingStatisticsEntry[],
		projects: TimeTrackingProject[]
	): CategoryBreakdown[] {
		const groups = new Map<number, CategoryBreakdown>();

		for (const stat of statistics) {
			const project = projects.find((p) => p.id === stat.project_id);
			for (const category of project?.categories ?? []) {
				const group = groups.get(category.id) ?? { title: category.title, minutes: 0 };
				group.minutes += stat.total_minutes;
				groups.set(category.id, group);
			}
		}

		return [...groups.values()].sort((a, b) => b.minutes - a.minutes);
	}

	groupByDay(entries: TimeTrackingEntry[], dayLabel: (startedAt: string) => string): EntriesOfDay[] {
		const groups: Record<string, TimeTrackingEntry[]> = {};

		for (const entry of entries) {
			(groups[dayLabel(entry.started_at)] ??= []).push(entry);
		}

		return Object.entries(groups).map(([date, entries]) => ({ date, entries }));
	}

	totalMinutes(items: { minutes: number }[]): number {
		return items.reduce((sum, item) => sum + item.minutes, 0);
	}
}
