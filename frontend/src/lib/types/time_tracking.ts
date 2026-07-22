export interface TimeTrackingCategory {
	id: number;
	title: string;
	color: string | null;
	created_at: string;
	updated_at: string;
}

export interface TimeTrackingProject {
	id: string;
	title: string;
	description: string | null;
	categories: TimeTrackingCategory[];
	total_duration: number;
	created_at: string;
	updated_at: string;
}

export interface TimeTrackingEntry {
	id: string;
	description: string | null;
	started_at: string;
	stopped_at: string | null;
	duration_minutes: number;
	has_exact_times: boolean;
	project: TimeTrackingProject | null;
	created_at: string;
	updated_at: string;
}

export interface CreateTimeTrackingCategoryRequest {
	title: string;
	color?: string | null;
}

export interface UpdateTimeTrackingCategoryRequest {
	title?: string;
	color?: string | null;
}

export interface CreateTimeTrackingProjectRequest {
	title: string;
	description?: string | null;
	category_ids?: number[];
}

export interface UpdateTimeTrackingProjectRequest {
	title?: string;
	description?: string | null;
	category_ids?: number[];
}

export interface CreateTimeTrackingEntryRequest {
	description?: string | null;
	started_at: string;
	stopped_at: string;
	duration_minutes: number;
	has_exact_times: boolean;
	project_id: string;
}

export interface UpdateTimeTrackingEntryRequest {
	description?: string | null;
	started_at?: string;
	stopped_at?: string;
	duration_minutes?: number;
	project_id?: string;
}

export interface StartTimerRequest {
	project_id: string;
	description?: string | null;
}

export interface TimeTrackingStatisticsEntry {
	project_id: string;
	project_title: string;
	color: string | null;
	total_minutes: number;
}

export interface TimeTrackingStatistics {
	by_project: TimeTrackingStatisticsEntry[];
	total_minutes: number;
	from: string;
	to: string;
}
