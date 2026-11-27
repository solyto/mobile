import type { DetectionResult, QuickAddContentType } from '$lib/types/quick_add';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import { getTranslation, type Translation } from '$lib/state/Translation.svelte';
import { getUiNotifications, type UiNotifications } from '$lib/state/UiNotifications.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class QuickAdd {
	open = $state<boolean>(false);
	loading = $state<boolean>(false);
	content = $state<string>('');
	detectedType = $state<QuickAddContentType | null>(null);
	confidence = $state<number>(0);
	metadata = $state<Record<string, unknown> | null>(null);
	needsConfirmation = $state<boolean>(false);
	showTypeSelector = $state<boolean>(false);
	error = $state<string | null>(null);
	auth: Auth;
	ts: Translation;
	notifications: UiNotifications;
	apiService: ApiService;

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		ts: Translation = getTranslation(),
		notifications: UiNotifications = getUiNotifications()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.ts = ts;
		this.notifications = notifications;
	}

	openModal(): void {
		this.reset();
		this.open = true;
	}

	closeModal(): void {
		this.open = false;
		this.reset();
	}

	reset(): void {
		this.content = '';
		this.loading = false;
		this.detectedType = null;
		this.confidence = 0;
		this.metadata = null;
		this.needsConfirmation = false;
		this.showTypeSelector = false;
		this.error = null;
	}

	async detect(): Promise<void> {
		if (!this.content.trim()) return;

		this.error = null;
		this.detectedType = null;
		this.needsConfirmation = false;
		this.showTypeSelector = false;

		const request = { content: this.content };
		const res = await this.whileLoading(() => this.apiService.create(apiRoutes.dashboard.quickAddDetect, request));

		if (!res) {
			this.error = this.ts.get.quick_add.detect_error;
			this.notifications.error(this.ts.get.quick_add.detect_error);
			return;
		}

		const data = res.data as DetectionResult;

		this.detectedType = data.content_type;
		this.confidence = data.confidence;
		this.metadata = data.metadata ?? null;

		if (data.needs_confirmation) {
			this.needsConfirmation = true;
		} else {
			await this.confirm(data.content_type);
		}
	}

	rejectDetection(): void {
		this.needsConfirmation = false;
		this.showTypeSelector = true;
	}

	backToConfirmation(): void {
		if (!this.detectedType) return;
		this.showTypeSelector = false;
		this.needsConfirmation = true;
	}

	async confirmDetected(): Promise<void> {
		if (this.detectedType) await this.confirm(this.detectedType);
	}

	async confirm(type: QuickAddContentType): Promise<void> {
		this.error = null;

		const request = { content: this.content, content_type: type, metadata: this.metadata };
		const res = await this.whileLoading(() => this.apiService.create(apiRoutes.dashboard.quickAddCommit, request));

		if (!res) {
			this.error = this.ts.get.quick_add.commit_error;
			this.notifications.error(this.ts.get.quick_add.commit_error);
			return;
		}

		const destination = this.ts.get.quick_add.destinations[type];
		this.notifications.success(this.ts.get.quick_add.commit_success.replace('%s', destination));
		this.closeModal();
	}

	async selectType(type: QuickAddContentType): Promise<void> {
		this.showTypeSelector = false;
		this.detectedType = type;
		this.metadata = null;
		await this.confirm(type);
	}

	get isUrl(): boolean {
		try {
			new URL(this.content);
			return true;
		} catch {
			return false;
		}
	}

	private async whileLoading<T>(request: () => Promise<T>): Promise<T> {
		this.loading = true;
		try {
			return await request();
		} finally {
			this.loading = false;
		}
	}
}

const QUICK_ADD_KEY = Symbol('SOLYTO_QUICK_ADD');

export function setQuickAdd(): QuickAdd {
	return setContext(QUICK_ADD_KEY, new QuickAdd());
}

export function getQuickAdd(): QuickAdd {
	return getContext<QuickAdd>(QUICK_ADD_KEY);
}
