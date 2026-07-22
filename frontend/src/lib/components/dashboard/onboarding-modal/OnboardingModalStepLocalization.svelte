<script lang="ts">
	import { blur } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import IconSettings from '@lucide/svelte/icons/settings';
	import type { Language } from '$lib/types/translation';

	const ts = getTranslation();
	const auth = getAuth();

	let {
		selectedLanguage = $bindable(),
		selectedDateFormat = $bindable(),
		selectedTimeFormat = $bindable()
	} = $props<{ selectedLanguage: string; selectedDateFormat: string; selectedTimeFormat: string }>();

	const languages = [
		{ value: 'en', label: ts.get.settings.english },
		{ value: 'de', label: ts.get.settings.german },
		{ value: 'fr', label: ts.get.settings.french },
		{ value: 'es', label: ts.get.settings.spanish }
	];

	const dateFormats = [
		{ value: 'dd.mm.YYYY', label: 'dd.mm.YYYY (31.12.2025)' },
		{ value: 'dd.mm.YY', label: 'dd.mm.YY (31.12.25)' },
		{ value: 'YYYY/mm/dd', label: 'YYYY/mm/dd (2025/12/31)' },
		{ value: 'YY/mm/dd', label: 'YY/mm/dd (25/12/31)' },
		{ value: 'YYYY-mm-dd', label: 'YYYY-mm-dd (2025-12-31)' },
		{ value: 'YY-mm-dd', label: 'YY-mm-dd (25-12-31)' }
	];

	const timeFormats = [
		{ value: 'H:i', label: '24h (14:30)' },
		{ value: 'g:i A', label: '12h (2:30 PM)' },
		{ value: 'g:i a', label: '12h (2:30 pm)' }
	];

	async function selectLanguage(code: string): Promise<void> {
		selectedLanguage = code;
		ts.changeLanguage(code as Language);
		await auth.updateLanguage(code);
	}
</script>

<div in:blur={{ duration: 200 }}>
	<div class="mb-2 flex items-center gap-3">
		<div class="flex size-10 items-center justify-center rounded-xl bg-c-btn/10">
			<IconSettings class="size-5 text-c-btn" />
		</div>
		<div>
			<h2 class="text-2xl font-bold text-c-neutral-9 dark:text-white">
				{ts.get.welcome_tour.localization_title}
			</h2>
			<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.welcome_tour.localization_subtitle}
			</p>
		</div>
	</div>
	<p class="mb-6 text-sm text-c-neutral-6 dark:text-c-neutral-4">
		{ts.get.welcome_tour.localization_description}
	</p>

	<div class="space-y-5">
		<div>
			<span class="mb-2 block text-sm font-medium text-c-neutral-7 dark:text-c-neutral-3">
				{ts.get.settings.language}
			</span>
			<div class="grid grid-cols-4 gap-2">
				{#each languages as lang}
					<button
						class="cursor-pointer rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all
							{selectedLanguage === lang.value
							? 'border-c-btn bg-c-btn/10 text-c-btn'
							: 'border-c-neutral-2 text-c-neutral-6 hover:border-c-neutral-3 dark:border-s-dark-3 dark:text-c-neutral-4'}"
						onclick={() => selectLanguage(lang.value)}
					>
						{lang.label}
					</button>
				{/each}
			</div>
		</div>
		<div>
			<span class="mb-2 block text-sm font-medium text-c-neutral-7 dark:text-c-neutral-3">
				{ts.get.settings.date_format}
			</span>
			<div class="grid grid-cols-2 gap-2">
				{#each dateFormats as format}
					<button
						class="cursor-pointer rounded-lg border-2 px-3 py-2 text-left text-sm font-medium transition-all
							{selectedDateFormat === format.value
							? 'border-c-btn bg-c-btn/10 text-c-btn'
							: 'border-c-neutral-2 text-c-neutral-6 hover:border-c-neutral-3 dark:border-s-dark-3 dark:text-c-neutral-4'}"
						onclick={() => (selectedDateFormat = format.value)}
					>
						{format.label}
					</button>
				{/each}
			</div>
		</div>
		<div>
			<span class="mb-2 block text-sm font-medium text-c-neutral-7 dark:text-c-neutral-3">
				{ts.get.settings.time_format}
			</span>
			<div class="grid grid-cols-3 gap-2">
				{#each timeFormats as format}
					<button
						class="cursor-pointer rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all
							{selectedTimeFormat === format.value
							? 'border-c-btn bg-c-btn/10 text-c-btn'
							: 'border-c-neutral-2 text-c-neutral-6 hover:border-c-neutral-3 dark:border-s-dark-3 dark:text-c-neutral-4'}"
						onclick={() => (selectedTimeFormat = format.value)}
					>
						{format.label}
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
