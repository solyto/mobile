import type { User } from '$lib/types/auth';

export type DevRequestType = 'feature' | 'bug';
export type DevRequestStatus = 'backlog' | 'pending' | 'in-progress' | 'cancelled' | 'completed';
export type DevRequestPriority = 1 | 2 | 3 | 4 | 5;

export type DevRequestVote = 'up' | 'down';

export interface DevRequest {
	id: number;
	type: DevRequestType;
	status: DevRequestStatus;
	priority: DevRequestPriority | null;
	title: string;
	description: string;
	screenshot: string;
	url: string;
	created_at: string;
	updated_at: string;
	upvotes: number;
	downvotes: number;
	score: number;
	user_vote: DevRequestVote;
	comment_count: number;
	created_by_user_id: string | null;
	created_by_user: {
		id: string;
		name: string;
	};
}

export interface DevRequestComment {
	id: number;
	content: string;
	created_at: string;
	user: {
		id: string;
		name: string;
	};
}

export interface CreateDevRequestRequest {
	type: DevRequestType;
	priority: DevRequestPriority;
	title: string;
	description: string;
	screenshot?: string | null;
	screenshot_name?: string | null;
	url?: string;
	created_by_user_id: string | null;
}

export interface UpdateDevRequestRequest {
	type?: DevRequestType;
	status?: DevRequestStatus;
	priority?: DevRequestPriority;
	title?: string;
	description?: string;
	screenshot?: string;
	url?: string;
}

export interface DevRequestForm {
	type: string;
	priority: string;
	title: string;
	description: string;
	screenshot: string;
	screenshot_name: string;
	url: string;
}
