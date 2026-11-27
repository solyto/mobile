import type { FeedImportState, FeedImportResponse, FeedImportPollError } from '$lib/types/feed';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import { getFeeds, type Feeds } from '$lib/state/Feeds.svelte';
import { getUiNotifications, type UiNotifications } from '$lib/state/UiNotifications.svelte';
import { getTranslation, type Translation } from '$lib/state/Translation.svelte';
import ApiService, { NetworkError, RateLimitedError } from '$lib/services/ApiService';
import FeedImportService from '$lib/services/FeedImportService';
import { apiRoutes } from '$lib/config/apiRoutes';
import { pluralize } from '$lib/helpers/FormatHelper';

export class FeedImport {
	static readonly POLL_INTERVAL_MS = 1000;
	static readonly MAX_POLL_INTERVAL_MS = 30000;
	static readonly POLL_TIMEOUT_MS = 300000;
	static readonly MS_PER_SECOND = 1000;

	modalOpen = $state<boolean>(false);
	state = $state<FeedImportState | null>(null);
	polling = $state<boolean>(false);
	stalled = $state<boolean>(false);
	pollError = $state<FeedImportPollError | null>(null);

	auth: Auth;
	apiService: ApiService;
	feeds: Feeds;
	notifications: UiNotifications;
	ts: Translation;
	service = new FeedImportService();

	private pollTimer: ReturnType<typeof setTimeout> | null = null;
	private failedPolls = 0;
	private lastProgressAt = 0;
	private lastProcessed: number | null = null;
	private destroyed = false;

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		feeds: Feeds = getFeeds(),
		notifications: UiNotifications = getUiNotifications(),
		ts: Translation = getTranslation()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.feeds = feeds;
		this.notifications = notifications;
		this.ts = ts;
	}

	async upload(file: File): Promise<FeedImportResponse> {
		const body = new FormData();
		body.append('file', file);

		return this.post(apiRoutes.feeds.importStart, body);
	}

	async select(urls: string[]): Promise<FeedImportResponse> {
		return this.post(apiRoutes.feeds.importSelect, { urls });
	}

	async refresh(): Promise<boolean> {
		const res = await this.apiService.get(apiRoutes.feeds.importState, null);
		if (!res) return false;

		const previousStage = this.state?.stage ?? null;
		this.state = res.data as FeedImportState;

		if (previousStage === 'running' && this.state.stage === 'finished') await this.feeds.load();

		return true;
	}

	async resume(): Promise<void> {
		const found = await this.refresh();
		if (found && this.state?.stage === 'running') this.startPolling();
	}

	startPolling(): void {
		if (this.polling || this.destroyed) return;

		this.polling = true;
		this.stalled = false;
		this.pollError = null;
		this.failedPolls = 0;
		this.lastProgressAt = Date.now();
		this.lastProcessed = this.state?.processed ?? null;
		this.pollTimer = setTimeout(() => this.poll(), FeedImport.POLL_INTERVAL_MS);
	}

	reset(): void {
		this.state = null;
		this.stalled = false;
		this.pollError = null;
	}

	destroy(): void {
		this.destroyed = true;
		this.stopPolling();
	}

	private async post(endpoint: string, body: FormData | object): Promise<FeedImportResponse> {
		try {
			const res = await this.apiService.postWithStatus(endpoint, body);
			if (res.ok) this.state = res.data.data as FeedImportState;
			return { ok: res.ok, status: res.status };
		} catch (error) {
			if (!(error instanceof RateLimitedError)) throw error;
			return { ok: false, status: 429 };
		}
	}

	private async poll(): Promise<void> {
		this.pollTimer = null;
		let delay = FeedImport.POLL_INTERVAL_MS;

		try {
			if (await this.refresh()) {
				this.failedPolls = 0;
				this.pollError = null;
			} else {
				delay = this.backOff('network');
			}
		} catch (error) {
			if (error instanceof RateLimitedError) {
				delay = this.backOff('rate_limited', (error.retryAfter ?? 0) * FeedImport.MS_PER_SECOND);
			} else if (error instanceof NetworkError) {
				delay = this.backOff('network');
			} else {
				this.stall();
				return;
			}
		}

		this.continuePolling(delay);
	}

	private backOff(kind: FeedImportPollError, retryAfterMs = 0): number {
		this.failedPolls++;
		this.pollError = kind;

		const delay = Math.max(FeedImport.POLL_INTERVAL_MS * 2 ** this.failedPolls, retryAfterMs);
		return Math.min(delay, FeedImport.MAX_POLL_INTERVAL_MS);
	}

	private continuePolling(delay: number): void {
		if (!this.polling) return;

		if (this.state?.stage !== 'running') {
			this.stopPolling();
			if (this.state?.stage === 'finished') this.announceFinished(this.state);
			return;
		}

		if (this.state.processed !== this.lastProcessed) {
			this.lastProcessed = this.state.processed;
			this.lastProgressAt = Date.now();
		}

		if (Date.now() - this.lastProgressAt >= FeedImport.POLL_TIMEOUT_MS) {
			this.stall();
			return;
		}

		this.pollTimer = setTimeout(() => this.poll(), delay);
	}

	private stall(): void {
		if (!this.polling) return;

		this.stopPolling();
		this.pollError = null;
		this.stalled = true;
		if (!this.modalOpen) this.notifications.error(this.ts.get.feeds.import_error_generic);
	}

	private announceFinished(state: FeedImportState): void {
		if (this.modalOpen) return;

		const added = this.service.group(state).added.length;
		this.notifications.success(pluralize(added, this.ts.get.feeds.import_finished_singular, this.ts.get.feeds.import_finished_plural));
	}

	private stopPolling(): void {
		this.polling = false;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = null;
	}
}

const FEED_IMPORT_KEY = Symbol('SOLYTO_FEED_IMPORT');

export function setFeedImport(): FeedImport {
	return setContext(FEED_IMPORT_KEY, new FeedImport());
}

export function getFeedImport(): FeedImport {
	return getContext<FeedImport>(FEED_IMPORT_KEY);
}
