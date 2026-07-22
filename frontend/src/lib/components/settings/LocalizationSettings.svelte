<script lang="ts">
	import type { Language } from '$lib/types/translation.js';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import { getTimeZones } from '@vvo/tzdb';
	import { getAuth } from '$lib/state/Auth.svelte';

	const ts = getTranslation();
	const auth = getAuth();

	const languageOptions = [
		{ value: 'en', label: ts.get.settings.english },
		{ value: 'de', label: ts.get.settings.german },
		{ value: 'fr', label: ts.get.settings.french },
		{ value: 'es', label: ts.get.settings.spanish }
	];

	const timezoneOptions = getTimeZones()
		.map((tz) => ({
			value: tz.name,
			label: tz.name
		}))
		.sort((a, b) => a.label.localeCompare(b.label));

	const dateFormatOptions = [
		{ value: 'dd.mm.YYYY', label: '01.10.2025' },
		{ value: 'dd.mm.YY', label: '01.10.25' },
		{ value: 'YYYY/mm/dd', label: '2025/10/01' },
		{ value: 'YY/mm/dd', label: '25/10/01' },
		{ value: 'YYYY-mm-dd', label: '2025-10-01' },
		{ value: 'YY-mm-dd', label: '25-10-01' }
	];

	const timeFormatOptions = [
		{ value: 'H:i', label: '13:37' },
		{ value: 'g:i A', label: '1.37 PM' },
		{ value: 'g:i a', label: '1.37 pm' }
	];

	let languageInput = $state<HTMLSelectElement | null>(null);
	let languageValues = $state<string>(auth?.user?.settings?.language ?? 'en');
	let timezoneInput = $state<HTMLSelectElement | null>(null);
	let timezoneValues = $state<string>(auth?.user?.settings?.timezone ?? '');
	let dateFormatInput = $state<HTMLSelectElement | null>(null);
	let dateFormatValues = $state<string>(auth?.user?.settings?.date_format ?? '');
	let timeFormatInput = $state<HTMLSelectElement | null>(null);
	let timeFormatValues = $state<string>(auth?.user?.settings?.time_format ?? '');

	const handleLanguageChange = async (value: string) => {
		ts.changeLanguage(value as Language);
		await auth.updateLanguage(value);
	};
	const handleTimezoneChange = async (value: string) => await auth.updateTimezone(value);
	const handleDateFormatChange = async (value: string) => await auth.updateDateFormat(value);
	const handleTimeFormatChange = async (value: string) => await auth.updateTimeFormat(value);
</script>

<div class="flex gap-8 max-lg:flex-col md:p-4">
	<SettingsSection label={ts.get.settings.language}>
		<Select
			bind:input={languageInput}
			bind:value={languageValues}
			onchange={(value) => handleLanguageChange(value)}
			options={languageOptions}
		/>
	</SettingsSection>
	<SettingsSection label={ts.get.settings.timezone}>
		<Select
			bind:input={timezoneInput}
			bind:value={timezoneValues}
			onchange={(value) => handleTimezoneChange(value)}
			options={timezoneOptions}
		/>
	</SettingsSection>
	<SettingsSection label={ts.get.settings.date_format}>
		<Select
			bind:input={dateFormatInput}
			bind:value={dateFormatValues}
			onchange={(value) => handleDateFormatChange(value)}
			options={dateFormatOptions}
		/>
	</SettingsSection>
	<SettingsSection label={ts.get.settings.time_format}>
		<Select
			bind:input={timeFormatInput}
			bind:value={timeFormatValues}
			onchange={(value) => handleTimeFormatChange(value)}
			options={timeFormatOptions}
		/>
	</SettingsSection>
</div>
