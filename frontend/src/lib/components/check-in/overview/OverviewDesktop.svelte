<script lang="ts">
	import type { CheckInType } from '$lib/types/check_in';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getUrlFormat } from '$lib/helpers/DateHelper';
	import { urls } from '$lib/config/urls';
	import CheckInIcon from '$lib/components/check-in/overview/CheckInIcon.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { dates, trackers } = $props<{
		dates: Date[];
		trackers: CheckInType[];
	}>();

	const checkInData = getCheckInData();
	const ts = getTranslation();

	function getData(date: string, type: CheckInType): number | null {
		const dayData = checkInData.getDayData(date);
		if (!dayData) return null;
		return dayData[type];
	}
</script>

<div class="flex">
	<div class="flex flex-col w-32 shrink-0">
		<div class="h-10">&nbsp;</div>
		{#each trackers as tracker (tracker)}
			<div class="flex w-full items-center justify-start font-bold h-12 p-3">
				<p>{ts.get.checkIn[tracker as keyof typeof ts.get.checkIn]}</p>
			</div>
		{/each}
	</div>
	<div class="flex flex-row items-start">
		{#each dates as date (date.getTime())}
			{@const dateStr = getUrlFormat(new Date(date))}
			<div class="flex h-full flex-col w-8 items-center justify-center">
				<button
					type="button"
					class="h-10 flex items-center justify-center cursor-pointer font-medium hover:font-bold hover:scale-125 transition-transform"
					onclick={() => goto(resolve(urls.checkInDate, { date: dateStr }))}
				>
					{date.getDate()}
				</button>
				{#each trackers as tracker (tracker)}
					<div class="size-12 flex items-center justify-center p-3">
						<CheckInIcon type={tracker} value={getData(dateStr, tracker)} />
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
