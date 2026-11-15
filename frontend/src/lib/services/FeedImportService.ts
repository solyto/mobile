import type { FeedImportEntry, FeedImportState } from '$lib/types/feed';

export type FeedImportFailureReason = 'unreachable' | 'not_a_feed' | 'limit_reached';

export interface FeedImportFailure {
	url: string;
	title: string;
	reason: FeedImportFailureReason;
}

export interface FeedImportResult {
	added: FeedImportEntry[];
	alreadySubscribed: FeedImportEntry[];
	failed: FeedImportFailure[];
}

export default class FeedImportService {
	initialSelection(state: FeedImportState): string[] {
		return state.feeds.filter((feed) => !feed.already_subscribed).map((feed) => feed.url);
	}

	allSelected(state: FeedImportState, selected: string[]): boolean {
		return this.initialSelection(state).every((url) => selected.includes(url));
	}

	toggleAll(state: FeedImportState, selected: string[]): string[] {
		return this.allSelected(state, selected) ? [] : this.initialSelection(state);
	}

	toggle(selected: string[], url: string): string[] {
		return selected.includes(url) ? selected.filter((selectedUrl) => selectedUrl !== url) : [...selected, url];
	}

	group(state: FeedImportState): FeedImportResult {
		const result: FeedImportResult = { added: [], alreadySubscribed: [], failed: [] };

		for (const feed of state.feeds) {
			switch (feed.status) {
				case 'subscribed':
					result.added.push(feed);
					break;
				case 'already_subscribed':
					result.alreadySubscribed.push(feed);
					break;
				case 'unreachable':
				case 'not_a_feed':
				case 'limit_reached':
					result.failed.push({ url: feed.url, title: feed.title, reason: feed.status });
					break;
			}
		}

		return result;
	}

	progress(state: FeedImportState): number {
		return state.total === 0 ? 0 : state.processed / state.total;
	}
}
