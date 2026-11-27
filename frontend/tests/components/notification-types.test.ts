import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import type { Translation } from '$lib/state/Translation.svelte';
import { setTelegramBot } from '$lib/state/TelegramBot.svelte';
import { setNotificationPreferences } from '$lib/state/NotificationPreferences.svelte';
import ManageNotificationTypes from '$lib/components/settings/notifications/ManageNotificationTypes.svelte';
import { renderWithContext } from './helpers/context';
import StoreHarness from './helpers/StoreHarness.svelte';

describe('Notification types', () => {
	it('names the notification types and channels in the app\'s language', async () => {
		vi.spyOn(ApiService.prototype, 'get').mockResolvedValue({ data: {} } as never);

		renderWithContext(
			StoreHarness,
			{
				component: ManageNotificationTypes,
				props: { showTelegram: true },
				provide: () => {
					setTelegramBot();
					return setNotificationPreferences();
				}
			},
			{ onReady: ({ ts }) => (ts as Translation).changeLanguage('de') }
		);

		await waitFor(() => expect(screen.getByText('Hinweise')).toBeInTheDocument());
		expect(screen.getByText('Neue Freundschaftsanfragen')).toBeInTheDocument();
		expect(screen.getByText('E-Mail')).toBeInTheDocument();
		expect(screen.queryByText('Alerts')).not.toBeInTheDocument();
	});
});
