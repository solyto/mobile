<script lang="ts">
	import type { CreateCheckInRequest, CheckInType } from '$lib/types/check_in';
	import DailyCheckIn from '$lib/components/check-in/daily/DailyCheckIn.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import {
		formatDate,
		isDateToday,
		isDateYesterday
	} from '$lib/helpers/DateHelper';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const checkInData = getCheckInData();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let save = $state<CreateCheckInRequest | null>(null);
	let date = $derived(page.params.date);
	let dayData = $derived(checkInData.getDayData());

	const isToday = $derived(isDateToday(new Date(date as string)));
	const isYesterday = $derived(isDateYesterday(new Date(date as string)));

	afterNavigate(() => {
		save = null;
	});

	async function onChange(type: CheckInType, value: number | null): Promise<void> {
		if (save === null) {
			save = { date: checkInData.selectedDate!, [type]: value };
		} else {
			save[type] = value;
		}
	}

	async function onSave(): Promise<void> {
		if (save === null || save.date === null) return;
		loadingIndicator.start();
		if (await checkInData.save(save)) save = null;
		loadingIndicator.stop();
		notifications.success(ts.get.checkIn.save_success);
	}
</script>

<div class="relative mt-8 flex-row space-y-4">
	<div class="mb-8 flex w-full flex-col items-center justify-center gap-1">
		<h2 class="text-3xl font-bold">
			{#if isToday}
				{ts.get.checkIn.today}
			{:else if isYesterday}
				{ts.get.checkInSummary.day_yesterday}
			{:else}
				{formatDate(date!)}
			{/if}
		</h2>
	</div>

	{#each checkInData.activeTrackers as type (type)}
		<DailyCheckIn {type} label={ts.get.checkIn[type]} currentValue={dayData?.[type]} {onChange} selectedSports={checkInData.settings.selectedSports} />
	{/each}

	<div class="mb-8 flex w-full justify-center sm:absolute sm:top-0 sm:right-8 sm:mb-0 sm:w-auto">
		<TextButton title={ts.get.layout.save} onclick={onSave} class="max-sm:h-14 max-sm:w-full" />
	</div>
</div>
