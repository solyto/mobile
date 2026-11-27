import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import { Auth } from '$lib/state/Auth.svelte';
import LocalizationSettings from '$lib/components/settings/LocalizationSettings.svelte';
import { renderWithContext } from './helpers/context';

const user = {
	settings: { language: 'en', timezone: 'Europe/Berlin', date_format: 'YYYY-mm-dd', time_format: 'H:i', week_start: 'sunday', currency: 'EUR' }
};

function renderSettings() {
	renderWithContext(LocalizationSettings, {}, { stores: { auth: { user: structuredClone(user) } } });
}

describe('Localization settings', () => {
	it('shows the user\'s settings', () => {
		renderSettings();

		expect(screen.getByDisplayValue('English')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Europe/Berlin')).toBeInTheDocument();
		expect(screen.getByDisplayValue('2025-10-01')).toBeInTheDocument();
		expect(screen.getByDisplayValue('13:37')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Sunday')).toBeInTheDocument();
		expect(screen.getByDisplayValue('EUR €')).toBeInTheDocument();
	});

	it('saves each changed setting and keeps showing the picked value', async () => {
		const updateTimezone = vi.spyOn(Auth.prototype, 'updateTimezone').mockResolvedValue(true);
		const updateDateFormat = vi.spyOn(Auth.prototype, 'updateDateFormat').mockResolvedValue(false);
		const updateTimeFormat = vi.spyOn(Auth.prototype, 'updateTimeFormat').mockResolvedValue(true);
		const updateWeekStart = vi.spyOn(Auth.prototype, 'updateWeekStart').mockResolvedValue(true);
		const updateCurrency = vi.spyOn(Auth.prototype, 'updateCurrency').mockResolvedValue(true);
		renderSettings();

		await fireEvent.change(screen.getByDisplayValue('Europe/Berlin'), { target: { value: 'Asia/Tokyo' } });
		await fireEvent.change(screen.getByDisplayValue('2025-10-01'), { target: { value: 'dd.mm.YYYY' } });
		await fireEvent.change(screen.getByDisplayValue('13:37'), { target: { value: 'g:i a' } });
		await fireEvent.change(screen.getByDisplayValue('Sunday'), { target: { value: 'monday' } });
		await fireEvent.change(screen.getByDisplayValue('EUR €'), { target: { value: 'USD' } });

		expect(updateTimezone).toHaveBeenCalledWith('Asia/Tokyo');
		expect(updateDateFormat).toHaveBeenCalledWith('dd.mm.YYYY');
		expect(updateTimeFormat).toHaveBeenCalledWith('g:i a');
		expect(updateWeekStart).toHaveBeenCalledWith('monday');
		expect(updateCurrency).toHaveBeenCalledWith('USD');
		await waitFor(() => expect(screen.getByDisplayValue('Asia/Tokyo')).toBeInTheDocument());
		expect(screen.getByDisplayValue('01.10.2025')).toBeInTheDocument();
		expect(screen.getByDisplayValue('1.37 pm')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Monday')).toBeInTheDocument();
		expect(screen.getByDisplayValue('USD $')).toBeInTheDocument();
	});

	it('shows only the code when a currency has no symbol of its own', () => {
		renderSettings();

		expect(screen.getByRole('option', { name: 'CHF' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'RUB' })).toBeInTheDocument();
		expect(screen.queryByRole('option', { name: 'CHF CHF' })).not.toBeInTheDocument();
	});

	it('switches the app language and saves it', async () => {
		const updateLanguage = vi.spyOn(Auth.prototype, 'updateLanguage').mockResolvedValue(true);
		renderSettings();

		await fireEvent.change(screen.getByDisplayValue('English'), { target: { value: 'de' } });

		expect(updateLanguage).toHaveBeenCalledWith('de');
		expect(await screen.findByDisplayValue('German')).toBeInTheDocument();
	});
});
