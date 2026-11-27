import type {
	ImportFileTarget,
	ImportRequest,
	ImportSource,
	ImportState,
	SelectImportAddressBooksRequest
} from '$lib/types/contact';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import { getContacts, type Contacts } from '$lib/state/Contacts.svelte';
import { getUiNotifications, type UiNotifications } from '$lib/state/UiNotifications.svelte';
import { getTranslation, type Translation } from '$lib/state/Translation.svelte';
import ApiService, { NetworkError, RateLimitedError } from '$lib/services/ApiService';
import ContactImportService, { type ContactImportError } from '$lib/services/ContactImportService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class ContactImport {
	static readonly POLL_INTERVAL_MS = 1000;
	static readonly STALL_TIMEOUT_MS = 300000;

	importModal = $state<boolean>(false);
	state = $state<ImportState | null>(null);
	stalled = $state<boolean>(false);
	awaitingState = $state<boolean>(false);

	auth: Auth;
	apiService: ApiService;
	contacts: Contacts;
	notifications: UiNotifications;
	ts: Translation;
	service = new ContactImportService();

	private pollTimer: ReturnType<typeof setTimeout> | null = null;
	private lastMarker = '';
	private lastProgressAt = 0;
	private destroyed = false;

	constructor(
		auth: Auth = getAuth(),
		apiService: ApiService = auth.apiService,
		contacts: Contacts = getContacts(),
		notifications: UiNotifications = getUiNotifications(),
		ts: Translation = getTranslation()
	) {
		this.auth = auth;
		this.apiService = apiService;
		this.contacts = contacts;
		this.notifications = notifications;
		this.ts = ts;
	}

	get polling(): boolean {
		return this.pollTimer !== null;
	}

	async open(): Promise<void> {
		this.importModal = true;
		if (this.polling) return;

		this.stalled = false;
		await this.refresh();
		if (this.service.isStale(this.state)) this.state = null;
		if (this.service.isRunning(this.state)) this.startPolling();
	}

	close(): void {
		this.importModal = false;
		if (!this.polling) this.reset();
	}

	async startCarddavImport(request: ImportRequest): Promise<ContactImportError | null> {
		return this.start('carddav', apiRoutes.contacts.startImport, request);
	}

	async selectCarddavAddressBooks(addressBooks: string[]): Promise<ContactImportError | null> {
		const request: SelectImportAddressBooksRequest = { address_books: addressBooks };
		return this.start('carddav', apiRoutes.contacts.selectImportAddressBooks, request);
	}

	async importFile(file: File, target: ImportFileTarget): Promise<ContactImportError | null> {
		return this.start('file', apiRoutes.contacts.startFileImport, this.service.fileRequest(file, target));
	}

	destroy(): void {
		this.destroyed = true;
		this.stopPolling();
	}

	private async start(
		source: ImportSource,
		endpoint: string,
		body: FormData | object
	): Promise<ContactImportError | null> {
		const res = await this.post(endpoint, body);
		if (!res.ok) return this.service.errorFor(res.status, source);

		this.state = res.state ?? this.startedState(source);
		this.awaitingState = res.state === null;
		this.stalled = false;
		this.startPolling();
		return null;
	}

	// The file endpoint answers with the initial state, the CardDAV endpoints with an empty list.
	private async post(
		endpoint: string,
		body: FormData | object
	): Promise<{ ok: boolean; status: number; state: ImportState | null }> {
		try {
			const res = await this.apiService.postWithStatus(endpoint, body);
			if (!res.ok) return { ok: false, status: res.status, state: null };

			const data = res.data.data;
			return { ok: true, status: res.status, state: Array.isArray(data) ? null : (data as ImportState) };
		} catch (error) {
			if (error instanceof RateLimitedError) return { ok: false, status: 429, state: null };
			if (error instanceof NetworkError) return { ok: false, status: 0, state: null };
			throw error;
		}
	}

	private async refresh(): Promise<void> {
		const res = await this.apiService.get(apiRoutes.contacts.getImportState, null);
		if (!res) return;

		this.state = res.data as ImportState;
		this.awaitingState = false;
	}

	private startPolling(): void {
		if (this.polling || this.destroyed) return;

		this.lastMarker = this.service.progressMarker(this.state);
		this.lastProgressAt = Date.now();
		this.pollTimer = setTimeout(() => this.poll(), ContactImport.POLL_INTERVAL_MS);
	}

	private async poll(): Promise<void> {
		try {
			await this.refresh();
		} catch (error) {
			if (!(error instanceof NetworkError || error instanceof RateLimitedError)) {
				this.stall();
				return;
			}
		}

		if (this.destroyed) return;

		if (this.service.isRunning(this.state, this.awaitingState)) {
			this.continuePolling();
			return;
		}

		this.stopPolling();
		await this.settle();
	}

	private continuePolling(): void {
		const marker = this.service.progressMarker(this.state);
		if (marker !== this.lastMarker) {
			this.lastMarker = marker;
			this.lastProgressAt = Date.now();
		}

		if (Date.now() - this.lastProgressAt >= ContactImport.STALL_TIMEOUT_MS) {
			this.stall();
			return;
		}

		this.pollTimer = setTimeout(() => this.poll(), ContactImport.POLL_INTERVAL_MS);
	}

	private stall(): void {
		this.stopPolling();
		this.stalled = true;
		this.announceFailure();
	}

	private async settle(): Promise<void> {
		if (this.state?.stage === 'failed') {
			this.announceFailure();
			return;
		}

		if (this.state?.stage !== 'finished') return;

		await this.contacts.loadAddressBooks();
		await this.contacts.loadContacts();
		if (!this.importModal) {
			this.notifications.success(this.ts.get.contacts.import_success);
			this.reset();
		}
	}

	private announceFailure(): void {
		if (this.importModal) return;

		this.notifications.error(this.ts.get.contacts.import_error);
		this.reset();
	}

	private reset(): void {
		this.state = null;
		this.stalled = false;
		this.awaitingState = false;
	}

	private stopPolling(): void {
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = null;
	}

	private startedState(source: ImportSource): ImportState {
		return {
			stage: 'started',
			source,
			address_books: null,
			address_books_count: 0,
			address_books_done: 0,
			address_books_current: null,
			contacts_count: 0,
			contacts_done: 0,
			contacts_skipped: 0
		};
	}
}

const CONTACT_IMPORT_KEY = Symbol('SOLYTO_CONTACT_IMPORT');

export function setContactImport(): ContactImport {
	return setContext(CONTACT_IMPORT_KEY, new ContactImport());
}

export function getContactImport(): ContactImport {
	return getContext<ContactImport>(CONTACT_IMPORT_KEY);
}
