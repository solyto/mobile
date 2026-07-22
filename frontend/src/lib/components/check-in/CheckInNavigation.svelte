<script lang="ts">
	import { urls } from '$lib/config/urls';
	import { getUrlFormat } from '$lib/helpers/DateHelper';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import InlineEditButton from '$lib/components/ui/buttons/InlineEditButton.svelte';
	import CheckInSettings from '$lib/components/check-in/CheckInSettings.svelte';

	const ts = getTranslation();

	let settingsOpen = $state(false);
</script>

<div class="relative flex w-full flex-row items-center space-x-4 p-4 pt-0">
	<a href={resolve(urls.checkInDate, { date: getUrlFormat(new Date()) })}>
		<h1
			class="text-2xl"
			class:font-bold={page.url.pathname === `/check-in/date/${getUrlFormat(new Date())}`}
		>
			{ts.get.checkIn.today}
		</h1>
	</a>
	<a href={resolve(urls.checkInHistory)}>
		<h1 class="text-2xl" class:font-bold={page.url.pathname === '/check-in/history' || (page.url.pathname.startsWith('/check-in/date') && page.url.pathname !== `/check-in/date/${getUrlFormat(new Date())}`)}>
			{ts.get.checkIn.history}
		</h1>
	</a>
	<a href={resolve(urls.checkInTrends)}>
		<h1 class="text-2xl" class:font-bold={page.url.pathname === '/check-in/trends'}>
			{ts.get.checkIn.trends}
		</h1>
	</a>
	<div class="ml-auto">
		<InlineEditButton onClick={() => { settingsOpen = true; }} />
	</div>
</div>

{#if settingsOpen}
	<CheckInSettings onClose={() => {settingsOpen = false}} />
{/if}
