<script lang="ts">
	import type { CheckInType } from '$lib/types/check_in';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getUrlFormat } from '$lib/helpers/DateHelper';
	import { urls } from '$lib/config/urls';
	import CheckInIcon from '$lib/components/check-in/overview/CheckInIcon.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAuth } from '$lib/state/Auth.svelte';

	let { dates, trackers } = $props<{
		dates: Date[];
		trackers: CheckInType[];
	}>();

	const checkInData = getCheckInData();
	const auth = getAuth();

	function getData(date: string, type: CheckInType): number | null {
		const dayData = checkInData.getDayData(date);
		if (!dayData) return null;
		return dayData[type];
	}
</script>

<div class="flex flex-col space-y-2 p-4 pt-8">
	{#each dates as date (date.getTime())}
		<div>
			<button
				type="button"
				class="text-lg hover:font-bold"
				onclick={() =>
					goto(resolve(urls.checkInDate, { date: getUrlFormat(new Date(date)) }))}
			>
				{auth.getDateInUserPreferredFormat(date)}
			</button>
			<div class="mt-4 flex flex-row">
				{#each trackers as tracker (tracker)}
					<div class="w-1/7">
						<CheckInIcon
							type={tracker}
							value={getData(getUrlFormat(new Date(date)), tracker)}
						/>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
