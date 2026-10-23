import type {
	AuthToken,
	User,
	UserSettings,
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	VerifyRequest,
	AuthActionResponse,
	VerifyActionResponse,
	PasskeyActionResponse,
	PasskeyAuthenticationOptions,
	PasskeyRegistrationOptions,
	Passkey
} from '$lib/types/auth';
import { IS_NATIVE, PLATFORM } from '$lib/config/platform';
import { setContext, getContext } from 'svelte';
import { apiRoutes } from '$lib/config/apiRoutes';
import ApiService from '$lib/services/ApiService';
import LocalStorageService from '$lib/services/LocalStorageService';
import { SessionMonitor } from '$lib/state/SessionMonitor';
import { SvelteMap } from 'svelte/reactivity';
import {
	formatDate,
	formatDateTime,
	formatDateWithoutYear,
	formatDateWithWeekday,
	formatTime,
	formatTimeWithSeconds
} from '$lib/helpers/DateHelper';

type RefreshOutcome = 'refreshed' | 'transient' | 'rejected';

export class Auth {
	static readonly LS_AUTH_KEY: string = 'auth';

	loggedIn = $state<boolean>(false);
	authToken = $state<AuthToken | null>(null);
	user = $state<User | null>(null);
	apiService: ApiService;
	localStorage = new LocalStorageService();
	profileCache = new SvelteMap<string, User>();
	private refreshInFlight: Promise<RefreshOutcome> | null = null;
	private recoveryInFlight: Promise<boolean> | null = null;
	private sessionMonitor: SessionMonitor;
	private sessionExpiredHandler: (() => void) | null = null;

	constructor() {
		this.apiService = new ApiService(null);
		this.apiService.setUnauthorizedHandler(() => this.recoverFromUnauthorized());
		this.load().then();
		this.sessionMonitor = new SessionMonitor(() => this.validateSession());
	}

	private async load(): Promise<void> {
		const savedAuth = this.localStorage.getJson(Auth.LS_AUTH_KEY);

		if (!savedAuth) return;

		const { user, authToken } = savedAuth as { user: User; authToken: AuthToken };

		if (!authToken || !user) return;

		const expiresAt = new Date(authToken.expires_at as string).getTime();

		if (expiresAt > Date.now()) {
			this.user = user;
			this.authToken = authToken;
			this.apiService.updateAuthToken(this.getToken()!);
			this.loggedIn = true;

			if (this.shouldRefresh(expiresAt)) {
				await this.refresh();
			}

			await this.loadAdditionalData();

			this.save();
		} else {
			this.localStorage.destroy(Auth.LS_AUTH_KEY);
		}
	}

	public async loadAdditionalData(): Promise<void> {
		if (!this.user) return;
		const res = await this.apiService.get(apiRoutes.users.get, null);
		if (res) this.user = res.data as User;
		this.save();
	}

	public save(): void {
		this.localStorage.setJson(Auth.LS_AUTH_KEY, {
			user: this.user,
			authToken: this.authToken
		});
	}

	private clear(): void {
		this.localStorage.destroy(Auth.LS_AUTH_KEY);
		this.user = null;
		this.authToken = null;
		this.loggedIn = false;
		this.apiService.updateAuthToken(null);
	}

	async login(email: string, password: string): Promise<boolean> {
		const request: LoginRequest = { email, password, platform: PLATFORM };
		const res = await this.apiService.post(apiRoutes.auth.login, request);

		if (!res) return Promise.resolve(false);
		const login = res.data as LoginResponse;

		this.user = login.user;
		this.authToken = {
			token: login.token,
			token_type: login.token_type,
			expires_at: login.token_expires_at
		};
		this.loggedIn = true;
		this.apiService.updateAuthToken(this.getToken()!);

		this.save();
		await this.loadAdditionalData();

		return Promise.resolve(true);
	}

	private shouldRefresh(expiresAt: number): boolean {
		const thresholdDays = IS_NATIVE ? 14 : 5;
		return expiresAt < Date.now() + thresholdDays * 24 * 60 * 60 * 1000;
	}

	async refresh(): Promise<RefreshOutcome> {
		if (this.refreshInFlight) return this.refreshInFlight;

		this.refreshInFlight = this.performRefresh().finally(() => {
			this.refreshInFlight = null;
		});

		return this.refreshInFlight;
	}

	private async performRefresh(): Promise<RefreshOutcome> {
		this.apiService.updateAuthToken(this.getToken());
		const res = await this.apiService.postWithStatus(apiRoutes.auth.refresh, {});

		if (!res.ok) {
			return res.status === 401 || res.status === 403 ? 'rejected' : 'transient';
		}

		const refresh = res.data.data as LoginResponse;

		this.user = refresh.user;
		this.authToken = {
			token: refresh.token,
			token_type: refresh.token_type,
			expires_at: refresh.token_expires_at
		};
		this.loggedIn = true;
		this.apiService.updateAuthToken(this.getToken());

		this.save();

		return 'refreshed';
	}

	logout(): void {
		this.clear();
	}

	setSessionExpiredHandler(handler: () => void): void {
		this.sessionExpiredHandler = handler;
	}

	private expireSession(): void {
		this.logout();
		this.sessionExpiredHandler?.();
	}

	destroy(): void {
		this.sessionMonitor.destroy();
	}

	async recoverFromUnauthorized(): Promise<boolean> {
		if (this.recoveryInFlight) return this.recoveryInFlight;

		this.recoveryInFlight = this.performRecovery().finally(() => {
			this.recoveryInFlight = null;
		});

		return this.recoveryInFlight;
	}

	private async performRecovery(): Promise<boolean> {
		if (this.adoptExternalSession()) return true;

		const outcome = await this.refreshOrTransient();
		if (outcome === 'rejected') this.expireSession();

		return outcome === 'refreshed';
	}

	private async refreshOrTransient(): Promise<RefreshOutcome> {
		try {
			return await this.refresh();
		} catch {
			return 'transient';
		}
	}

	private adoptExternalSession(): boolean {
		const savedAuth = this.localStorage.getJson(Auth.LS_AUTH_KEY) as
			| { user: User; authToken: AuthToken }
			| null;

		if (!savedAuth?.authToken?.token || !savedAuth.user) return false;
		if (savedAuth.authToken.token === this.getToken()) return false;
		if (new Date(savedAuth.authToken.expires_at as string).getTime() <= Date.now()) return false;

		this.user = savedAuth.user;
		this.authToken = savedAuth.authToken;
		this.loggedIn = true;
		this.apiService.updateAuthToken(savedAuth.authToken.token);

		return true;
	}

	private async validateSession(): Promise<void> {
		if (!this.loggedIn || !this.authToken) return;

		try {
			const expiresAt = new Date(this.authToken.expires_at as string).getTime();

			if (expiresAt <= Date.now() || this.shouldRefresh(expiresAt)) {
				const outcome = await this.refresh();

				if (outcome === 'rejected') {
					this.expireSession();
					return;
				}

				if (outcome === 'transient') return;
			}

			await this.loadAdditionalData();
		} catch {
			// Offline is transient and must never log out; the `online` event re-checks.
		}
	}

	isAdmin(): boolean {
		return this.user?.role === 'admin' || this.user?.role === 'super_admin';
	}

	async register(request: RegisterRequest): Promise<AuthActionResponse> {
		return this.apiService.postRaw<AuthActionResponse>(apiRoutes.auth.register, request);
	}

	async verify(request: VerifyRequest): Promise<VerifyActionResponse> {
		return this.apiService.postRaw<VerifyActionResponse>(apiRoutes.auth.verify, request);
	}

	async forgotPassword(email: string, platform: string): Promise<void> {
		await this.apiService.post(apiRoutes.auth.forgotPassword, { email, platform });
	}

	async resetPassword(token: string, email: string, password: string, passwordConfirmation: string): Promise<AuthActionResponse> {
		return this.apiService.postRaw<AuthActionResponse>(apiRoutes.auth.resetPassword, {
			token,
			email,
			password,
			password_confirmation: passwordConfirmation
		});
	}

	async changePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string): Promise<AuthActionResponse> {
		const res = await this.apiService.putRaw<AuthActionResponse>(apiRoutes.users.changePassword, {
			current_password: currentPassword,
			new_password: newPassword,
			new_password_confirmation: newPasswordConfirmation
		});
		// The API revokes every token on success, including the one that made this request.
		if (res.success) this.logout();
		return res;
	}

	async passkeyAuthenticationOptions(): Promise<PasskeyAuthenticationOptions | null> {
		const res = await this.apiService.post(apiRoutes.auth.passkeys.authenticateOptions, {});
		return (res?.data ?? null) as PasskeyAuthenticationOptions | null;
	}

	async passkeyAuthenticate(response: object): Promise<void> {
		const res = await this.apiService.postRaw<PasskeyActionResponse>(apiRoutes.auth.passkeys.authenticate, { response, platform: PLATFORM });
		if (!res.success) {
			throw new Error(res.message ?? 'Passkey authentication failed');
		}
		const data = res.data as LoginResponse;
		this.user = data.user;
		this.authToken = {
			token: data.token,
			token_type: data.token_type,
			expires_at: data.token_expires_at
		};
		this.loggedIn = true;
		this.apiService.updateAuthToken(this.getToken()!);
		this.save();
		await this.loadAdditionalData();
	}

	async passkeyRegistrationOptions(): Promise<PasskeyRegistrationOptions | null> {
		const res = await this.apiService.post(apiRoutes.auth.passkeys.registerOptions, {});
		return (res?.data ?? null) as PasskeyRegistrationOptions | null;
	}

	async passkeyRegister(response: object, name: string): Promise<void> {
		const res = await this.apiService.postRaw<PasskeyActionResponse>(apiRoutes.auth.passkeys.register, { response, name });
		if (!res.success) {
			throw new Error(res.message ?? 'Registration failed');
		}
	}

	async getPasskeys(): Promise<Passkey[]> {
		const res = await this.apiService.get(apiRoutes.auth.passkeys.list, null);
		return (res?.data ?? []) as Passkey[];
	}

	async deletePasskey(id: string): Promise<void> {
		await this.apiService.delete(apiRoutes.auth.passkeys.delete, id);
	}

	async renamePasskey(id: string, name: string): Promise<void> {
		await this.apiService.update(apiRoutes.auth.passkeys.update, id, { name });
	}

	getToken(): string | null {
		return this.authToken?.token ?? null;
	}

	async updateNavigation(navigation: string): Promise<boolean> {
		const res = await this.apiService.put(apiRoutes.users.settings.updateNavigationSettings, {
			navigation
		});
		return Promise.resolve(res);
	}

	async updateTimezone(timezone: string): Promise<boolean> {
		const res = await this.apiService.put(apiRoutes.users.settings.updateTimezone, {
			timezone
		});
		return Promise.resolve(res);
	}

	async updateDateFormat(dateFormat: string): Promise<boolean> {
		const res = await this.apiService.put(apiRoutes.users.settings.updateDateFormat, {
			date_format: dateFormat
		});
		return Promise.resolve(res);
	}

	async updateTimeFormat(timeFormat: string): Promise<boolean> {
		const res = await this.apiService.put(apiRoutes.users.settings.updateTimeFormat, {
			time_format: timeFormat
		});
		return Promise.resolve(res);
	}

	private async updateBooleanSetting(
		endpoint: string,
		enabled: boolean,
		apply: (settings: UserSettings) => void
	): Promise<boolean> {
		const res = await this.apiService.put(endpoint, { enabled });
		if (res && this.user?.settings) {
			apply(this.user.settings);
			this.save();
		}
		return Promise.resolve(res);
	}

	async updateJournalEnabled(enabled: boolean): Promise<boolean> {
		return this.updateBooleanSetting(
			apiRoutes.users.settings.updateJournal,
			enabled,
			(settings) => (settings.journal_enabled = enabled)
		);
	}

	async updateJournalCalendarMark(enabled: boolean): Promise<boolean> {
		return this.updateBooleanSetting(
			apiRoutes.users.settings.updateJournalCalendarMark,
			enabled,
			(settings) => (settings.journal_calendar_mark = enabled)
		);
	}

	async updateCheckInCalendarMark(enabled: boolean): Promise<boolean> {
		return this.updateBooleanSetting(
			apiRoutes.users.settings.updateCheckInCalendarMark,
			enabled,
			(settings) => (settings.check_in_calendar_mark = enabled)
		);
	}

	async updateLanguage(language: string): Promise<boolean> {
		const res = await this.apiService.put(apiRoutes.users.settings.updateLanguage, {
			language
		});
		if (res) await this.loadAdditionalData();
		return Promise.resolve(res);
	}

	async completeOnboarding(): Promise<boolean> {
		const res = await this.apiService.put(apiRoutes.users.settings.completeOnboarding, {});
		if (res && this.user?.settings) {
			this.user.settings.first_visit = false;
			this.save();
		}
		return Promise.resolve(res);
	}

	async setProfileImage(file: File): Promise<boolean> {
		if (!file.type.startsWith('image/')) {
			return Promise.resolve(false);
		}

		const formData = new FormData();
		formData.append('profile_image', file);

		const res = await this.apiService.postFormData(
			apiRoutes.users.updateProfileImage,
			formData
		);
		await this.loadAdditionalData();
		return Promise.resolve(res);
	}

	async getPublicProfile(userId: string): Promise<User | null> {
		if (this.profileCache.has(userId)) return this.profileCache.get(userId)!;
		const res = await this.apiService.get(apiRoutes.users.getPublicProfile, userId);
		const user = res?.data as User | null;
		if (user) this.profileCache.set(userId, user);
		return user;
	}

	getDateInUserPreferredFormat(input: string | Date): string {
		return formatDate(input, this?.user?.settings?.date_format ?? null);
	}

	getDateWithoutYearInUserPreferredFormat(input: string | Date): string {
		return formatDateWithoutYear(input, this?.user?.settings?.date_format ?? null);
	}

	getDateWithWeekdayInUserPreferredFormat(input: string | Date): string {
		return formatDateWithWeekday(input, this?.user?.settings?.date_format ?? null, this?.user?.settings?.language ?? undefined);
	}

	getDateTimeInUserPreferredFormat(input: string | Date): string {
		return formatDateTime(
			input,
			this?.user?.settings?.date_format ?? null,
			this?.user?.settings?.time_format ?? null
		);
	}

	getTimeInUserPreferredFormat(input: string | Date): string {
		return formatTime(input, this?.user?.settings?.time_format ?? null);
	}

	getTimeWithSecondsInUserPreferredFormat(input: string | Date): string {
		return formatTimeWithSeconds(input, this?.user?.settings?.time_format ?? null);
	}

	getTemperatureInUserPreferredFormat(temperature: number): number {
		if (this?.user?.settings?.temperature_unit === 'c') return temperature;

		return Math.round((temperature * 9) / 5 + 32);
	}
}

const AUTH_KEY = Symbol('SOLYTO_AUTH');

export function setAuth(): Auth {
	return setContext(AUTH_KEY, new Auth());
}

export function getAuth(): Auth {
	return getContext<Auth>(AUTH_KEY);
}
