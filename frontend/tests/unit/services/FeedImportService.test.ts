import { describe, it, expect } from 'vitest';
import FeedImportService from '$lib/services/FeedImportService';
import { feedImportEntry, feedImportState } from '../helpers/factories';

const service = new FeedImportService();

describe('initialSelection', () => {
	it('selects every feed except the ones already subscribed', () => {
		const parsed = feedImportState({
			feeds: [
				feedImportEntry({ url: 'https://a.test/feed' }),
				feedImportEntry({ url: 'https://b.test/feed', already_subscribed: true }),
				feedImportEntry({ url: 'https://c.test/feed' })
			]
		});

		expect(service.initialSelection(parsed)).toEqual(['https://a.test/feed', 'https://c.test/feed']);
	});

	it('is empty when every feed is already subscribed', () => {
		const parsed = feedImportState({ feeds: [feedImportEntry({ already_subscribed: true })] });

		expect(service.initialSelection(parsed)).toEqual([]);
	});
});

describe('allSelected and toggleAll', () => {
	const parsed = feedImportState({
		feeds: [
			feedImportEntry({ url: 'https://a.test/feed' }),
			feedImportEntry({ url: 'https://b.test/feed', already_subscribed: true }),
			feedImportEntry({ url: 'https://c.test/feed' })
		]
	});

	it('counts as all selected when every importable feed is selected', () => {
		expect(service.allSelected(parsed, ['https://a.test/feed', 'https://c.test/feed'])).toBe(true);
	});

	it('does not count as all selected when one importable feed is missing', () => {
		expect(service.allSelected(parsed, ['https://a.test/feed'])).toBe(false);
	});

	it('selects none when all are selected', () => {
		expect(service.toggleAll(parsed, ['https://a.test/feed', 'https://c.test/feed'])).toEqual([]);
	});

	it('selects every importable feed when some are missing', () => {
		expect(service.toggleAll(parsed, [])).toEqual(['https://a.test/feed', 'https://c.test/feed']);
	});
});

describe('toggle', () => {
	it('adds a url that is not selected', () => {
		expect(service.toggle(['https://a.test/feed'], 'https://b.test/feed')).toEqual(['https://a.test/feed', 'https://b.test/feed']);
	});

	it('removes a url that is selected', () => {
		expect(service.toggle(['https://a.test/feed', 'https://b.test/feed'], 'https://a.test/feed')).toEqual(['https://b.test/feed']);
	});
});

describe('group', () => {
	it('puts each status in its group and keeps the reason for failures', () => {
		const finished = feedImportState({
			stage: 'finished',
			total: 5,
			processed: 5,
			feeds: [
				feedImportEntry({ url: 'https://a.test/feed', title: 'A', status: 'subscribed' }),
				feedImportEntry({ url: 'https://b.test/feed', title: 'B', status: 'already_subscribed' }),
				feedImportEntry({ url: 'https://c.test/feed', title: 'C', status: 'unreachable' }),
				feedImportEntry({ url: 'https://d.test/feed', title: 'D', status: 'not_a_feed' }),
				feedImportEntry({ url: 'https://e.test/feed', title: 'E', status: 'limit_reached' })
			]
		});

		const result = service.group(finished);

		expect(result.added.map((feed) => feed.url)).toEqual(['https://a.test/feed']);
		expect(result.alreadySubscribed.map((feed) => feed.url)).toEqual(['https://b.test/feed']);
		expect(result.failed).toEqual([
			{ url: 'https://c.test/feed', title: 'C', reason: 'unreachable' },
			{ url: 'https://d.test/feed', title: 'D', reason: 'not_a_feed' },
			{ url: 'https://e.test/feed', title: 'E', reason: 'limit_reached' }
		]);
	});

	it('leaves pending and unprocessed entries out of every group', () => {
		const running = feedImportState({
			stage: 'running',
			feeds: [feedImportEntry({ status: 'pending' }), feedImportEntry({ status: null })]
		});

		expect(service.group(running)).toEqual({ added: [], alreadySubscribed: [], failed: [] });
	});
});

describe('progress', () => {
	it('is processed divided by total', () => {
		expect(service.progress(feedImportState({ total: 4, processed: 1 }))).toBe(0.25);
	});

	it('is 0 when total is 0', () => {
		expect(service.progress(feedImportState({ total: 0, processed: 0 }))).toBe(0);
	});
});
