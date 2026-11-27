import { setContext, getContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import type { Connection } from '$lib/types/telegram_bot_connection';

export class TelegramBot {
	connection = $state<Connection | null>(null);
	auth: Auth;
	apiService: ApiService;

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	get isConnected(): boolean {
		return this.connection?.is_confirmed ?? false;
	}

	async load(): Promise<void> {
		const res = await this.apiService.get(apiRoutes.telegram.getRequest, null);
		if (res) this.connection = res.data as Connection;
	}

	async requestToken(): Promise<void> {
		const res = await this.apiService.get(apiRoutes.telegram.getToken, null);
		if (res) this.connection = res.data as Connection;
	}
}

const TELEGRAM_BOT_KEY = Symbol('SOLYTO_TELEGRAM_BOT');

export function setTelegramBot(): TelegramBot {
	return setContext(TELEGRAM_BOT_KEY, new TelegramBot());
}

export function getTelegramBot(): TelegramBot {
	return getContext<TelegramBot>(TELEGRAM_BOT_KEY);
}
