export interface FeedSubscription {
	id: string;
	feed_id: string;
	title: string;
	url: string;
	whitelist: string;
	blacklist: string;
	created_at: string;
	updated_at: string;
}

export interface CreateFeedSubscriptionRequest {
	title: string;
	url: string;
	whitelist?: string;
	blacklist?: string;
}

export interface UpdateFeedSubscriptionRequest {
	title?: string;
	whitelist?: string;
	blacklist?: string;
}

export interface FeedItem {
	id: string;
	title: string;
	description: string;
	image_url: string | null;
	feed_id: string;
	link: string;
	published_at: string;
	saved_link_id: string | null;
}

export interface FeedTestItem {
	id: string;
	title: string;
	link: string;
	published_at: string;
}

export interface Feed {
	id: string;
	title: string;
	url: string;
	subscriber_count?: number;
}

export interface FriendFeed {
	id: string;
	title: string;
	url: string;
	subscriber_count: number;
	friend_names: string[];
}

export type FeedEntrySize = 'compact' | 'comfortable' | 'card';

export type FeedImportStage = 'parsed' | 'running' | 'finished';

export type FeedImportStatus = 'pending' | 'subscribed' | 'already_subscribed' | 'unreachable' | 'not_a_feed' | 'limit_reached';

export interface FeedImportEntry {
	url: string;
	title: string;
	already_subscribed: boolean;
	status: FeedImportStatus | null;
}

export interface FeedImportState {
	stage: FeedImportStage;
	total: number;
	processed: number;
	feeds: FeedImportEntry[];
}

export interface FeedImportResponse {
	ok: boolean;
	status: number;
}

export type FeedImportPollError = 'network' | 'rate_limited';
