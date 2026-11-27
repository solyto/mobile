<script lang="ts">
	import { urls } from '$lib/config/urls';
	import { getUrlFormat } from '$lib/helpers/DateHelper';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import InlineEditButton from '$lib/components/ui/buttons/InlineEditButton.svelte';
	import InlineAddButton from '$lib/components/ui/buttons/InlineAddButton.svelte';
	import CheckInSettings from '$lib/components/check-in/CheckInSettings.svelte';

	const ts = getTranslation();

	let settingsOpen = $state(false);
	let addingTracker = $state(false);
</script>

<div class="relative flex w-full flex-row items-center space-x-3 p-4 pt-2 sm:space-x-4 xl:pt-0">
	<a href={resolve(urls.checkInDate, { date: getUrlFormat(new Date()) })}>
		<h1
			class="text-lg sm:text-2xl"
			class:font-bold={page.url.pathname === `/check-in/date/${getUrlFormat(new Date())}`}
		>
			{ts.get.checkIn.today}
		</h1>
	</a>
	<a href={resolve(urls.checkInHistory)}>
		<h1 class="text-lg sm:text-2xl" class:font-bold={page.url.pathname === '/check-in/history' || (page.url.pathname.startsWith('/check-in/date') && page.url.pathname !== `/check-in/date/${getUrlFormat(new Date())}`)}>
			{ts.get.checkIn.history}
		</h1>
	</a>
	<a href={resolve(urls.checkInTrends)}>
		<h1 class="text-lg sm:text-2xl" class:font-bold={page.url.pathname === '/check-in/trends'}>
			{ts.get.checkIn.trends}
		</h1>
	</a>
	<a href={resolve(urls.checkInGoals)}>
		<h1 class="text-lg sm:text-2xl" class:font-bold={page.url.pathname === '/check-in/goals'}>
			{ts.get.goals.title}
		</h1>
	</a>
	<div class="ml-auto flex items-center gap-2">
		<!-- A spacer of the buttons' height keeps the header the same size on the Goals tab. -->
		{#if page.url.pathname === '/check-in/goals'}
			<div class="h-[34px]" aria-hidden="true"></div>
		{:else}
			<div class="flex items-center gap-2">
				<InlineAddButton label={ts.get.checkIn.add_tracker} onClick={() => { addingTracker = true; }} />
				<InlineEditButton onClick={() => { settingsOpen = true; }} />
			</div>
		{/if}
	</div>
</div>

{#if settingsOpen}
	<CheckInSettings onClose={() => {settingsOpen = false;}} />
{/if}

{#if addingTracker}
	<CheckInSettings startWithNewTracker onClose={() => {addingTracker = false;}} />
{/if}
