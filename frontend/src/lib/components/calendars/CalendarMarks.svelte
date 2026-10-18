<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import IconNotebook from '@lucide/svelte/icons/notebook';
	import IconGoal from '@lucide/svelte/icons/goal';
	import { urls } from '$lib/config/urls';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUrlFormat, isDateInTheFuture } from '$lib/helpers/DateHelper';

	let {
		date,
		showJournal,
		showCheckIn,
		size = 14,
		class: extraClass = ''
	}: {
		date: Date;
		showJournal: boolean;
		showCheckIn: boolean;
		size?: number;
		class?: string;
	} = $props();

	const calendars = getCalendars();
	const ts = getTranslation();

	function openJournal(): void {
		goto(resolve(urls.journalDate, { date: getUrlFormat(date) }));
	}

	function openCheckIn(): void {
		goto(resolve(urls.checkInDate, { date: getUrlFormat(date) }));
	}
</script>

{#if !isDateInTheFuture(date) && (showJournal || showCheckIn)}
	<div class="flex items-center {extraClass}" style="gap: {Math.round(size * 0.45)}px">
		{#if showJournal}
			<button
				tabindex="-1"
				title={ts.get.calendar.life_journal}
				onclick={openJournal}
				class="shrink-0 cursor-pointer transition-transform duration-200 hover:scale-125"
			>
				<IconNotebook
					{size}
					class={calendars.journalMarks.includes(getUrlFormat(date)) ? 'text-c-action' : 'text-c-neutral-4 dark:text-c-neutral-6'}
				/>
			</button>
		{/if}
		{#if showCheckIn}
			<button
				tabindex="-1"
				title={ts.get.calendar.life_check_in}
				onclick={openCheckIn}
				class="shrink-0 cursor-pointer transition-transform duration-200 hover:scale-125"
			>
				<IconGoal
					{size}
					class={calendars.checkInMarks.includes(getUrlFormat(date)) ? 'text-c-primary' : 'text-c-neutral-4 dark:text-c-neutral-6'}
				/>
			</button>
		{/if}
	</div>
{/if}
