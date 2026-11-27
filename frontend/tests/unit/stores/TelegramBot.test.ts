import { describe, it, expect, beforeEach } from 'vitest';
import { TelegramBot } from '$lib/state/TelegramBot.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';
import type { Connection } from '$lib/types/telegram_bot_connection';

function connection(overrides: Partial<Connection> = {}): Connection {
	return {
		token: 'abc123',
		is_confirmed: false,
		your_day_alert: false,
		check_in_alert: false,
		chat_id: null,
		created_at: '2026-11-20T10:15:00Z',
		...overrides
	};
}

beforeEach(() => {
	resetStoreMocks();
});

describe('TelegramBot store', () => {
	it('loads the connection request', async () => {
		api.get.mockResolvedValue({ data: connection({ is_confirmed: true, chat_id: '4711' }) });
		const bot = new TelegramBot();

		await bot.load();

		expect(api.get).toHaveBeenCalledWith(expect.stringMatching(/\/telegram\/request$/), null);
		expect(bot.connection).toEqual(connection({ is_confirmed: true, chat_id: '4711' }));
		expect(bot.isConnected).toBe(true);
	});

	it('is not connected without a request or before it is confirmed', async () => {
		const bot = new TelegramBot();
		await bot.load();
		expect(bot.connection).toBeNull();
		expect(bot.isConnected).toBe(false);

		api.get.mockResolvedValue({ data: connection() });
		await bot.load();
		expect(bot.isConnected).toBe(false);
	});

	it('requests a token and keeps the new connection', async () => {
		api.get.mockResolvedValue({ data: connection({ token: 'fresh' }) });
		const bot = new TelegramBot();

		await bot.requestToken();

		expect(api.get).toHaveBeenCalledWith(expect.stringMatching(/\/telegram\/token-request$/), null);
		expect(bot.connection?.token).toBe('fresh');
	});

	it('keeps the previous connection when a request fails', async () => {
		api.get.mockResolvedValue({ data: connection() });
		const bot = new TelegramBot();
		await bot.load();

		api.get.mockResolvedValue(null);
		await bot.load();
		await bot.requestToken();

		expect(bot.connection).toEqual(connection());
	});
});
