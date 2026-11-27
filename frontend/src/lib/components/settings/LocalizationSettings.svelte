<script lang="ts">
	import type { Language } from '$lib/types/translation.js';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import { getTimeZones } from '@vvo/tzdb';
	import { getAuth } from '$lib/state/Auth.svelte';
	import type { WeekStart } from '$lib/types/auth';
	import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES, type Currency } from '$lib/config/currency';

	const ts = getTranslation();
	const auth = getAuth();

	const languageOptions = [
		{ value: 'en', label: ts.get.settings.english },
		{ value: 'de', label: ts.get.settings.german },
		{ value: 'fr', label: ts.get.settings.french },
		{ value: 'es', label: ts.get.settings.spanish },
		{ value: 'it', label: ts.get.settings.italian },
		{ value: 'ru', label: ts.get.settings.russian }
	];

	const timezoneOptions = getTimeZones()
		.map((tz) => ({ value: tz.name, label: tz.name }))
		.sort((a, b) => a.label.localeCompare(b.label));

	const dateFormatOptions = [
		{ value: 'dd.mm.YYYY', label: '01.10.2025' },
		{ value: 'dd.mm.YY', label: '01.10.25' },
		{ value: 'YYYY/mm/dd', label: '2025/10/01' },
		{ value: 'YY/mm/dd', label: '25/10/01' },
		{ value: 'YYYY-mm-dd', label: '2025-10-01' },
		{ value: 'YY-mm-dd', label: '25-10-01' },
		{ value: 'mm/dd/YYYY', label: '10/01/2025' },
		{ value: 'mm/dd/YY', label: '10/01/25' }
	];

	const timeFormatOptions = [
		{ value: 'H:i', label: '13:37' },
		{ value: 'g:i A', label: '1.37 PM' },
		{ value: 'g:i a', label: '1.37 pm' }
	];

	const weekStartOptions = [
		{ value: 'monday', label: ts.get.calendar.weekdays[1] },
		{ value: 'sunday', label: ts.get.calendar.weekdays[7] }
	];

	const currencyOptions = SUPPORTED_CURRENCIES.map((currency) => ({
		value: currency,
		label: currencyLabel(currency)
	}));

	function currencyLabel(currency: Currency): string {
		const symbol = currencySymbol(currency);
		return symbol === currency ? currency : `${currency} ${symbol}`;
	}

	function currencySymbol(currency: Currency): string {
		return new Intl.NumberFormat('en', { style: 'currency', currency })
			.formatToParts(0)
			.find((part) => part.type === 'currency')?.value ?? currency;
	}

	async function handleLanguageChange(value: string): Promise<void> {
		ts.changeLanguage(value as Language);
		await auth.updateLanguage(value);
	}

	async function handleTimezoneChange(value: string): Promise<void> {
		await auth.updateTimezone(value);
	}

	async function handleDateFormatChange(value: string): Promise<void> {
		await auth.updateDateFormat(value);
	}

	async function handleTimeFormatChange(value: string): Promise<void> {
		await auth.updateTimeFormat(value);
	}

	async function handleWeekStartChange(value: string): Promise<void> {
		await auth.updateWeekStart(value as WeekStart);
	}

	async function handleCurrencyChange(value: string): Promise<void> {
		await auth.updateCurrency(value as Currency);
	}
</script>

<div class="flex gap-8 max-lg:flex-col">
	<SettingsSection label={ts.get.settings.language}>
		<Select value={auth.user?.settings?.language ?? 'en'} onchange={handleLanguageChange} options={languageOptions} />
	</SettingsSection>
	<SettingsSection label={ts.get.settings.timezone}>
		<Select value={auth.user?.settings?.timezone ?? ''} onchange={handleTimezoneChange} options={timezoneOptions} />
	</SettingsSection>
	<SettingsSection label={ts.get.settings.date_format}>
		<Select value={auth.user?.settings?.date_format ?? ''} onchange={handleDateFormatChange} options={dateFormatOptions} />
	</SettingsSection>
	<SettingsSection label={ts.get.settings.time_format}>
		<Select value={auth.user?.settings?.time_format ?? ''} onchange={handleTimeFormatChange} options={timeFormatOptions} />
	</SettingsSection>
	<SettingsSection label={ts.get.settings.week_start}>
		<Select value={auth.getWeekStart()} onchange={handleWeekStartChange} options={weekStartOptions} />
	</SettingsSection>
	<SettingsSection label={ts.get.settings.currency}>
		<Select value={auth.user?.settings?.currency ?? DEFAULT_CURRENCY} onchange={handleCurrencyChange} options={currencyOptions} />
	</SettingsSection>
</div>
