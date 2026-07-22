import type {
	AuthToken,
	User,
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
import { SvelteDate, SvelteMap } from 'svelte/reactivity';
import {
	formatDate,
	formatDateTime,
	formatDateWithoutYear,
	formatDateWithWeekday,
	formatTime,
	formatTimeWithSeconds
} from '$lib/helpers/DateHelper';

export class Auth {
	static readonly LS_AUTH_KEY: string = 'auth';

	loggedIn = $state<boolean>(false);
	authToken = $state<AuthToken | null>(null);
	user = $state<User | null>(null);
	apiService: ApiService;
	localStorage = new LocalStorageService();
	profileCache = new SvelteMap<string, User>();

	constructor() {
		this.apiService = new ApiService(null);
		this.load().then();
	}

	private async load(): Promise<void> {
		const savedAuth = this.localStorage.getJson(Auth.LS_AUTH_KEY);

		if (!savedAuth) return;

		const { user, authToken } = savedAuth as { user: User; authToken: AuthToken }

		if (!authToken || !user) return;

		const expiresAt = new SvelteDate(authToken.expires_at).getTime();

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

	async refresh(): Promise<boolean> {
		this.apiService.updateAuthToken(this.getToken()!);
		const res = await this.apiService.post(apiRoutes.auth.refresh, {});

		if (!res) return Promise.resolve(false);
		const refresh = res.data as LoginResponse;

		this.user = refresh.user;
		this.authToken = {
			token: refresh.token,
			token_type: refresh.token_type,
			expires_at: refresh.token_expires_at
		};
		this.loggedIn = true;

		this.save();

		return Promise.resolve(true);
	}

	logout(): void {
		this.clear();
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

	async setOpenaiApiKey(key: string | null): Promise<boolean> {
		const res = await this.apiService.put(apiRoutes.users.settings.updateOpenaiApiKey, { key });
		await this.loadAdditionalData();
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
